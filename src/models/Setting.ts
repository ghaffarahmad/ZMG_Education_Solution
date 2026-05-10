import mongoose, { Schema, Document } from "mongoose";
import { DEFAULT_ABOUT_STATS, type AboutStat } from "@/lib/aboutStats";

export interface ISetting extends Document {
  // General
  websiteName: string;
  shortWebsiteDescription?: string;
  footerDescription?: string;
  logoText?: string;
  logoImageUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  aboutStats: AboutStat[];

  // Contact
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  whatsappNumber?: string;
  emailAddress?: string;
  officeAddress?: string;
  officeTiming?: string;
  contactPersonName?: string;

  // Location
  googleMapEmbedUrl?: string;
  googleMapShareLink?: string;
  mapLatitude?: string;
  mapLongitude?: string;

  // Social
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;

  // Portal Messages
  portalWelcomeMessage?: string;
  studentPortalNotice?: string;
  admitCardLockedMessage?: string;
  documentNotAvailableMessage?: string;
  feeClearanceMessage?: string;
  studentInactiveMessage?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema(
  {
    // General
    websiteName: { type: String, default: "Z.M.G Education Solution" },
    shortWebsiteDescription: { type: String, default: "" },
    footerDescription: { type: String, default: "" },
    logoText: { type: String, default: "ZMG" },
    logoImageUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    primaryColor: { type: String, default: "#0D3B46" },
    accentColor: { type: String, default: "#D4AF37" },
    aboutStats: {
      type: [
        new Schema(
          {
            value: { type: Number, min: 0, default: 0 },
            suffix: { type: String, default: "" },
            label: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: () => DEFAULT_ABOUT_STATS.map((stat) => ({ ...stat })),
    },

    // Contact
    phoneNumber: { type: String, default: "" },
    alternatePhoneNumber: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    emailAddress: { type: String, default: "" },
    officeAddress: { type: String, default: "" },
    officeTiming: { type: String, default: "" },
    contactPersonName: { type: String, default: "" },

    // Location
    googleMapEmbedUrl: { type: String, default: "" },
    googleMapShareLink: { type: String, default: "" },
    mapLatitude: { type: String, default: "" },
    mapLongitude: { type: String, default: "" },

    // Social
    facebookUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    tiktokUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },

    // Portal Messages
    portalWelcomeMessage: { type: String, default: "Welcome to the Student Portal" },
    studentPortalNotice: { type: String, default: "" },
    admitCardLockedMessage: { type: String, default: "Your admit card is locked. Please contact the office." },
    documentNotAvailableMessage: { type: String, default: "This document is not available yet." },
    feeClearanceMessage: { type: String, default: "Fee clearance is required to download this document." },
    studentInactiveMessage: { type: String, default: "Your record is inactive. Please contact the office." },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "The portal is currently undergoing maintenance. Please check back later." },

    // SEO
    metaTitle: { type: String, default: "Z.M.G Education Solution" },
    metaDescription: { type: String, default: "Admission and Student Document Portal" },
    metaKeywords: { type: String, default: "Education, Admission, Portal" },
  },
  { timestamps: true }
);

// We only need one document for settings, so we can enforce it conceptually,
// but for simplicity, we'll just always query the first one or update the first one.

if (mongoose.models.Setting && !mongoose.models.Setting.schema.path("aboutStats")) {
  delete mongoose.models.Setting;
}

export default mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
