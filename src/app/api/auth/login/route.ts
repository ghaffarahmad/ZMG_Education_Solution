import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { comparePassword, createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required." }, { status: 400 });
    }

    const user = await AdminUser.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials." }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials." }, { status: 401 });
    }

    if (user.isActive === false) {
      return NextResponse.json({ success: false, message: "Account has been deactivated. Please contact support." }, { status: 403 });
    }

    const token = await createToken({ id: user._id.toString(), email: user.email, name: user.name });

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
