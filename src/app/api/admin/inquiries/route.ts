import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";

// GET all inquiries
export async function GET() {
  try {
    await connectToDatabase();
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH to update status
export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const { id, status, adminNote } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedInquiry) {
      return NextResponse.json({ success: false, message: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedInquiry });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
