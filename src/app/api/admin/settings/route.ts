import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { settingsSchema, validationMessage } from "@/lib/apiValidation";
import { writeAuditLog } from "@/lib/adminAudit";
import { normalizeAboutStats } from "@/lib/aboutStats";

export async function GET() {
  try {
    await connectToDatabase();
    
    // GET must stay read-only; return model defaults without persisting them.
    const settings = await Setting.findOne().sort({ updatedAt: -1, _id: -1 });
    const data = settings || new Setting();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET Admin Settings Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const parsed = settingsSchema.safeParse(data);
    if (!parsed.success) {
      await writeAuditLog({
        request,
        action: "settings_update",
        recordType: "Setting",
        success: false,
        reason: validationMessage(parsed.error),
      });
      return NextResponse.json({ success: false, message: validationMessage(parsed.error) }, { status: 400 });
    }

    const settingsUpdate = { ...parsed.data };
    if (parsed.data.aboutStats) {
      settingsUpdate.aboutStats = normalizeAboutStats(parsed.data.aboutStats);
    }

    // Find the first settings document
    let settings = await Setting.findOne().sort({ updatedAt: -1, _id: -1 });
    
    if (!settings) {
      // Create if it doesn't exist
      settings = await Setting.create(settingsUpdate);
    } else {
      // Keep all existing singleton settings documents in sync in case duplicates were created previously.
      await Setting.updateMany({}, { $set: settingsUpdate }, { runValidators: true });
      settings = await Setting.findById(settings._id);
    }

    await writeAuditLog({
      request,
      action: "settings_update",
      recordType: "Setting",
      recordId: settings?._id?.toString(),
      success: true,
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("PUT Admin Settings Error:", error);
    await writeAuditLog({
      request,
      action: "settings_update",
      recordType: "Setting",
      success: false,
      reason: error instanceof Error ? error.message : "Internal server error",
    });
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
