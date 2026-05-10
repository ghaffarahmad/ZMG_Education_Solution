import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { verifyToken } from "@/lib/auth";

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
    
    // Fetch all admins except passwords, sorted by oldest first to identify the master
    const adminsList = await AdminUser.find().select("-password").lean().sort({ createdAt: 1 });

    if (adminsList.length > 0) {
      // The very first account created is the master admin
      adminsList[0].isMasterAdmin = true;
    }

    const admins = adminsList.map(admin => ({
      ...admin,
      isActive: admin.isActive !== false // defaults to true for older records
    })).sort((a, b) => {
      if (a.isMasterAdmin) return -1;
      if (b.isMasterAdmin) return 1;
      // Sort the rest by newest first
      return new Date(b.createdAt || 0).getTime() < new Date(a.createdAt || 0).getTime() ? 1 : -1;
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error("Fetch Admins Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Admin ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const adminToUpdate = await AdminUser.findById(id);
    if (!adminToUpdate) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }

    // Identify master admin
    const masterAdmin = await AdminUser.findOne().sort({ createdAt: 1 });
    if (masterAdmin && masterAdmin._id.toString() === id) {
      return NextResponse.json({ success: false, message: "Cannot deactivate the master admin" }, { status: 403 });
    }

    if (id === payload.id) {
      return NextResponse.json({ success: false, message: "You cannot deactivate your own account" }, { status: 400 });
    }

    // Force update in case Next.js cached the old schema without isActive
    await AdminUser.updateOne(
      { _id: id },
      { $set: { isActive: isActive } },
      { strict: false }
    );

    return NextResponse.json({ success: true, message: `Admin account has been ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    console.error("Update Admin Status Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Admin ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const adminToDelete = await AdminUser.findById(id);
    if (!adminToDelete) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }

    // Identify master admin
    const masterAdmin = await AdminUser.findOne().sort({ createdAt: 1 });
    if (masterAdmin && masterAdmin._id.toString() === id) {
      return NextResponse.json({ success: false, message: "Cannot delete the master admin" }, { status: 403 });
    }

    if (id === payload.id) {
      return NextResponse.json({ success: false, message: "You cannot delete your own account" }, { status: 400 });
    }

    await AdminUser.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Admin account deleted successfully" });
  } catch (error) {
    console.error("Delete Admin Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
