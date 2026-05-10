import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/models/Notice";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    const homepage = searchParams.get("homepage");

    await connectToDatabase();

    const query: any = { status: "published" };
    
    if (ticker === "true") {
      query.showInTicker = true;
    }
    
    if (homepage === "true") {
      query.showOnHomepage = true;
    }

    const notices = await Notice.find(query).sort({ pinToTop: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: notices });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
