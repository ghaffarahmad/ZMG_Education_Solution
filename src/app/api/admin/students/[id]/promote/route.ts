import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Student from "@/models/Student";
import StudentEnrollment from "@/models/StudentEnrollment";
import { writeAuditLog } from "@/lib/adminAudit";
import { z } from "zod";

const promoteSchema = z.object({
  board: z.string().optional(),
  program: z.string().optional(),
  group: z.string().optional(),
  session: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
  markAsCompleted: z.boolean().optional().default(false),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const parseResult = promoteSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: "Validation error" }, { status: 400 });
    }

    const { board, program, group, session: sessionStr, startDate, notes, markAsCompleted } = parseResult.data;

    const { id } = await context.params;
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // Find current active enrollment
    const activeEnrollment = await StudentEnrollment.findOne({
      studentId: student._id,
      academicStatus: "active"
    });

    let newEnrollment = null;

    if (markAsCompleted) {
      // Just mark the current enrollment as completed and don't create a new one
      if (activeEnrollment) {
        activeEnrollment.academicStatus = "completed";
        activeEnrollment.endDate = new Date();
        await activeEnrollment.save();
      }

      await writeAuditLog({
        request,
        action: "student_update",
        recordType: "Student",
        recordId: student._id.toString(),
        success: true,
        metadata: { action: "mark_completed" },
      });

      return NextResponse.json({ success: true, message: "Student academic program marked as completed." });
    } else {
      // Create new active enrollment
      newEnrollment = await StudentEnrollment.create({
        studentId: student._id,
        board,
        program,
        group,
        session: sessionStr,
        academicStatus: "active",
        startDate: startDate ? new Date(startDate) : new Date(),
        notes
      });

      // Close old active enrollment
      if (activeEnrollment) {
        activeEnrollment.academicStatus = "promoted";
        activeEnrollment.endDate = new Date();
        activeEnrollment.promotedToEnrollmentId = newEnrollment._id;
        await activeEnrollment.save();
      }

      // Update student legacy string fields for compatibility
      student.board = board;
      student.program = program;
      student.group = group;
      student.session = sessionStr;
      await student.save();

      await writeAuditLog({
        request,
        action: "student_update",
        recordType: "Student",
        recordId: student._id.toString(),
        success: true,
        metadata: { action: "promote", newProgram: program },
      });

      return NextResponse.json({ success: true, data: newEnrollment });
    }
  } catch (error) {
    console.error("POST /api/admin/students/[id]/promote error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
