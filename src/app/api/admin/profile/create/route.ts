import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { verifyToken, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Name, email, and password are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Check if an admin with the same email already exists
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ success: false, message: "An admin with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newAdmin = new AdminUser({
      name,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    return NextResponse.json({ success: true, message: "Admin created successfully" });
  } catch (error: any) {
    console.error("Profile Create Admin Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "An admin with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
