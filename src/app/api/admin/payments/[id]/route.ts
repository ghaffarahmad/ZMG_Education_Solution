import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Student from "@/models/Student"; // Required for middleware

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    if (!Student) console.log("Loading student model");
    
    const { id } = await context.params;
    
    // findOneAndDelete triggers the middleware we added in Payment.ts
    const payment = await Payment.findOneAndDelete({ _id: id });
    
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Payment deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Payment Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
