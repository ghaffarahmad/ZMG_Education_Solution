import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { verifyToken, comparePassword, hashPassword } from "@/lib/auth";

export async function GET() {
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

    await connectToDatabase();
    const admin = await AdminUser.findById(payload.id).select("-password");

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { name: admin.name, email: admin.email } });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const { name, email, currentPassword, newPassword } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name and email are required" }, { status: 400 });
    }

    await connectToDatabase();
    const admin = await AdminUser.findById(payload.id);

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }

    // If attempting to change password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: "Current password is required to set a new password" }, { status: 400 });
      }

      const isMatch = await comparePassword(currentPassword, admin.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Incorrect current password" }, { status: 401 });
      }

      admin.password = await hashPassword(newPassword);
    }

    admin.name = name;
    admin.email = email;
    await admin.save();

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Profile PUT Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Email is already in use" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
