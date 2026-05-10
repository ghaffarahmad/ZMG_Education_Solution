import { z } from "zod";
import { BOARD_OPTIONS } from "@/lib/studentRules";

export const paymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  amount: z.coerce.number().positive("Payment amount must be greater than 0."),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(["cash", "bank_transfer", "easypaisa", "jazzcash", "cheque", "other"]),
  receivedBy: z.string().trim().optional().or(z.literal("")),
  receiptNo: z.string().trim().optional().or(z.literal("")),
  note: z.string().trim().optional().or(z.literal("")),
});

export const documentUploadSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  title: z.string().trim().min(1, "Document title is required"),
  type: z.enum(["admit_card", "enrollment_card", "marksheet", "fee_voucher", "other"]),
  isPublished: z.boolean(),
  requiresFeeClearance: z.boolean(),
  downloadAllowed: z.boolean(),
});

export const noticeSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  slug: z.string().trim().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  shortDescription: z.string().trim().min(10, "Short description is required"),
  fullContent: z.string().trim().min(20, "Full content is required"),
  category: z.enum(["admission", "admit_card", "enrollment", "fee", "board_update", "aiou", "general"]),
  priority: z.enum(["normal", "important", "urgent"]),
  imageUrl: z.string().trim().optional().or(z.literal("")),
  linkUrl: z.string().trim().optional().or(z.literal("")),
  linkLabel: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  pinToTop: z.boolean().default(false),
  showInTicker: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, "Phone format is invalid"),
  programInterest: z.string().trim().optional().or(z.literal("")),
  board: z.enum(BOARD_OPTIONS).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

const optionalUrl = z.string().trim().url("Must be a valid URL").optional().or(z.literal(""));

const aboutStatSchema = z.object({
  value: z.coerce.number().min(0, "Stat value must be zero or greater"),
  suffix: z.string().trim().max(16, "Suffix must be 16 characters or fewer").optional().or(z.literal("")),
  label: z.string().trim().min(1, "Stat label is required").max(60, "Stat label must be 60 characters or fewer"),
});

export const settingsSchema = z.object({
  websiteName: z.string().trim().min(1, "Website name is required").optional(),
  shortWebsiteDescription: z.string().trim().optional().or(z.literal("")),
  footerDescription: z.string().trim().optional().or(z.literal("")),
  logoText: z.string().trim().optional().or(z.literal("")),
  logoImageUrl: z.string().trim().optional().or(z.literal("")),
  faviconUrl: z.string().trim().optional().or(z.literal("")),
  primaryColor: z.string().trim().optional().or(z.literal("")),
  accentColor: z.string().trim().optional().or(z.literal("")),
  aboutStats: z.array(aboutStatSchema).length(4, "Exactly four About stats are required").optional(),
  phoneNumber: z.string().trim().optional().or(z.literal("")),
  alternatePhoneNumber: z.string().trim().optional().or(z.literal("")),
  whatsappNumber: z.string().trim().optional().or(z.literal("")),
  emailAddress: z.string().trim().email("Email format is invalid").optional().or(z.literal("")),
  officeAddress: z.string().trim().optional().or(z.literal("")),
  officeTiming: z.string().trim().optional().or(z.literal("")),
  contactPersonName: z.string().trim().optional().or(z.literal("")),
  googleMapEmbedUrl: z.string().trim().optional().or(z.literal("")),
  googleMapShareLink: z.string().trim().optional().or(z.literal("")),
  mapLatitude: z.string().trim().optional().or(z.literal("")),
  mapLongitude: z.string().trim().optional().or(z.literal("")),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portalWelcomeMessage: z.string().trim().optional().or(z.literal("")),
  studentPortalNotice: z.string().trim().optional().or(z.literal("")),
  admitCardLockedMessage: z.string().trim().optional().or(z.literal("")),
  documentNotAvailableMessage: z.string().trim().optional().or(z.literal("")),
  feeClearanceMessage: z.string().trim().optional().or(z.literal("")),
  studentInactiveMessage: z.string().trim().optional().or(z.literal("")),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().trim().optional().or(z.literal("")),
  metaTitle: z.string().trim().optional().or(z.literal("")),
  metaDescription: z.string().trim().optional().or(z.literal("")),
  metaKeywords: z.string().trim().optional().or(z.literal("")),
});

export function validationMessage(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join("; ");
}
