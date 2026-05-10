import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { normalizeAboutStats } from "@/lib/aboutStats";

export async function GET() {
  try {
    await connectToDatabase();
    
    // We only need one settings document. If it doesn't exist, create it.
    let settings = await Setting.findOne().sort({ updatedAt: -1, _id: -1 });
    if (!settings) {
      settings = await Setting.create({});
    }

    // Explicitly select only public fields, DO NOT send sensitive data or extra data
    const publicData = {
      // General
      websiteName: settings.websiteName,
      shortWebsiteDescription: settings.shortWebsiteDescription,
      footerDescription: settings.footerDescription,
      logoText: settings.logoText,
      logoImageUrl: settings.logoImageUrl,
      faviconUrl: settings.faviconUrl,
      primaryColor: settings.primaryColor,
      accentColor: settings.accentColor,
      aboutStats: normalizeAboutStats(settings.aboutStats),

      // Contact
      phoneNumber: settings.phoneNumber,
      alternatePhoneNumber: settings.alternatePhoneNumber,
      whatsappNumber: settings.whatsappNumber,
      emailAddress: settings.emailAddress,
      officeAddress: settings.officeAddress,
      officeTiming: settings.officeTiming,
      contactPersonName: settings.contactPersonName,

      // Location
      googleMapEmbedUrl: settings.googleMapEmbedUrl,
      googleMapShareLink: settings.googleMapShareLink,
      mapLatitude: settings.mapLatitude,
      mapLongitude: settings.mapLongitude,

      // Social
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      tiktokUrl: settings.tiktokUrl,
      youtubeUrl: settings.youtubeUrl,
      linkedinUrl: settings.linkedinUrl,

      // Portal Messages
      portalWelcomeMessage: settings.portalWelcomeMessage,
      studentPortalNotice: settings.studentPortalNotice,
      admitCardLockedMessage: settings.admitCardLockedMessage,
      documentNotAvailableMessage: settings.documentNotAvailableMessage,
      feeClearanceMessage: settings.feeClearanceMessage,
      studentInactiveMessage: settings.studentInactiveMessage,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      
      // SEO
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      metaKeywords: settings.metaKeywords,
    };

    return NextResponse.json({ success: true, data: publicData });
  } catch (error) {
    console.error("GET Public Settings Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
