import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin pages and all admin APIs.
  if ((pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("admin_token")?.value;
    const isAdminApi = pathname.startsWith("/api/admin");

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (isAdminApi) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/student-portal/dashboard")) {
    const token = request.cookies.get("student_session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/student-portal", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload?.studentId) {
      return NextResponse.redirect(new URL("/student-portal", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/student-portal/dashboard/:path*"],
};
