import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { inquirySchema, validationMessage } from "@/lib/apiValidation";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const parsed = inquirySchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    const newInquiry = await Inquiry.create({
      name: parsed.data.name,
      phone: parsed.data.phone,
      programInterest: parsed.data.programInterest,
      board: parsed.data.board,
      message: parsed.data.message,
    });

    return NextResponse.json({ success: true, data: newInquiry });
  } catch (error) {
    console.error("Error saving inquiry:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
