import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ isAdmin: false });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    await jwtVerify(token, secret);

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}
