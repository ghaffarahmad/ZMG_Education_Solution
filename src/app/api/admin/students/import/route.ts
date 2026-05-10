import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import { parseStudentWorkbook, StudentImportRow } from "@/lib/studentExcel";
import { getTotalPaidLimitMessage, normalizeCnic, prepareStudentPayload, studentWriteSchema } from "@/lib/studentRules";
import { writeAuditLog } from "@/lib/adminAudit";
import { validationMessage } from "@/lib/apiValidation";

async function validateJsonRows(rows: StudentImportRow[]) {
  const seen = new Map<string, number>();
  const validated: StudentImportRow[] = [];

  for (const row of rows) {
    const cnic = normalizeCnic(String(row.data.cnicOrBform || ""));
    const errors: string[] = [];
    const previous = cnic ? seen.get(cnic) : undefined;

    if (previous) {
      errors.push(`Duplicate CNIC/B-Form in import data. Also appears on row ${previous}.`);
    } else if (cnic) {
      seen.set(cnic, row.rowNumber);
    }

    const parsed = studentWriteSchema.safeParse(row.data);
    if (!parsed.success) {
      errors.push(validationMessage(parsed.error));
    }

    if (parsed.success) {
      const totalPaidLimitMessage = getTotalPaidLimitMessage(parsed.data);
      if (totalPaidLimitMessage) {
        errors.push(totalPaidLimitMessage);
      }
    }

    const existing = cnic ? await Student.findOne({ cnicOrBform: cnic }).select("_id") : null;
    validated.push({
      rowNumber: row.rowNumber,
      status: existing ? "update" : "create",
      data: parsed.success ? prepareStudentPayload(parsed.data) : row.data,
      errors,
    });
  }

  return validated;
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, message: "Excel file is required" }, { status: 400 });
      }

      const rows = await parseStudentWorkbook(file);
      return NextResponse.json({
        success: true,
        data: {
          rows,
          hasErrors: rows.some((row) => row.errors.length > 0),
          validCount: rows.filter((row) => row.errors.length === 0).length,
          errorCount: rows.filter((row) => row.errors.length > 0).length,
        },
      });
    }

    const body = await request.json();
    if (body.action !== "confirm" || !Array.isArray(body.rows)) {
      return NextResponse.json({ success: false, message: "Invalid import confirmation payload" }, { status: 400 });
    }

    const rows = await validateJsonRows(body.rows);
    const invalidRows = rows.filter((row) => row.errors.length > 0);
    if (invalidRows.length > 0) {
      await writeAuditLog({
        request,
        action: "student_bulk_import",
        recordType: "Student",
        success: false,
        reason: "Import confirmation contained validation errors",
        metadata: { invalidRows: invalidRows.map((row) => ({ rowNumber: row.rowNumber, errors: row.errors })) },
      });
      return NextResponse.json({ success: false, message: "Validation errors remain. Review preview before importing.", data: { rows } }, { status: 400 });
    }

    let created = 0;
    let updated = 0;

    for (const row of rows) {
      const payload = row.data as Record<string, any>;
      const cnicOrBform = normalizeCnic(String(payload.cnicOrBform));
      const initialPaid = Number(payload.totalPaid || 0);
      const existing = await Student.findOne({ cnicOrBform });

      if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        updated += 1;
      } else {
        const studentPayload = initialPaid > 0 ? { ...payload, totalPaid: 0 } : payload;
        const student = await Student.create(studentPayload);
        created += 1;
        if (initialPaid > 0) {
          await Payment.create({
            studentId: student._id,
            amount: initialPaid,
            paymentMethod: "cash",
            paymentDate: new Date(),
            note: "Initial Amount Paid from Bulk Import",
          });
        }
        
        // Create initial active enrollment based on imported academic options
        if (student.board || student.program || student.group || student.session) {
          const { default: StudentEnrollment } = await import("@/models/StudentEnrollment");
          await StudentEnrollment.create({
            studentId: student._id,
            board: student.board,
            program: student.program,
            group: student.group,
            session: student.session,
            academicStatus: "active",
            startDate: student.admissionDate || new Date()
          });
        }
      }
    }

    await writeAuditLog({
      request,
      action: "student_bulk_import",
      recordType: "Student",
      success: true,
      metadata: { created, updated, total: rows.length },
    });

    return NextResponse.json({ success: true, data: { created, updated, total: rows.length } });
  } catch (error: any) {
    await writeAuditLog({
      request,
      action: "student_bulk_import",
      recordType: "Student",
      success: false,
      reason: error.message || "Internal server error",
    });
    return NextResponse.json({ success: false, message: "Student import failed" }, { status: 500 });
  }
}
