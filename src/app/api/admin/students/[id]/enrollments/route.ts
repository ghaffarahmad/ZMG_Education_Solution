import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudentEnrollment from "@/models/StudentEnrollment";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    const { id } = await context.params;
    const enrollments = await StudentEnrollment.find({ studentId: id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: enrollments });
  } catch (error) {
    console.error("GET /api/admin/students/[id]/enrollments error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
