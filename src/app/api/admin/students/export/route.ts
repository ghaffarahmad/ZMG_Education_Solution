import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import { normalizeCnic } from "@/lib/studentRules";
import { createStudentsWorkbook, workbookResponse } from "@/lib/studentExcel";
import { writeAuditLog } from "@/lib/adminAudit";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "all";
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
    const search = searchParams.get("search");
    const board = searchParams.get("board");
    const program = searchParams.get("program");
    const gender = searchParams.get("gender");
    const feeStatus = searchParams.get("feeStatus");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (scope === "selected") {
      if (ids.length === 0) {
        return NextResponse.json({ success: false, message: "No selected students provided" }, { status: 400 });
      }
      query._id = { $in: ids };
    } else if (scope === "filtered") {
      if (search) {
        const normalizedSearch = normalizeCnic(search);
        query.$or = [
          { studentName: { $regex: search, $options: "i" } },
          { fatherName: { $regex: search, $options: "i" } },
          { cnicOrBform: { $regex: search, $options: "i" } },
          { cnicOrBform: { $regex: normalizedSearch, $options: "i" } },
        ];
      }
      if (board) query.board = board;
      if (program) query.program = program;
      if (gender) query.gender = gender;
      if (feeStatus) query.feeStatus = feeStatus;
      if (status) query.status = status;
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    await writeAuditLog({
      request,
      action: "student_export",
      recordType: "Student",
      success: true,
      metadata: { scope, count: students.length },
    });

    const workbook = await createStudentsWorkbook(students);
    return workbookResponse(workbook, `students_${scope}_${Date.now()}.xlsx`);
  } catch (error: any) {
    await writeAuditLog({
      request,
      action: "student_export",
      recordType: "Student",
      success: false,
      reason: error.message || "Internal server error",
    });
    return NextResponse.json({ success: false, message: "Failed to export students" }, { status: 500 });
  }
}
