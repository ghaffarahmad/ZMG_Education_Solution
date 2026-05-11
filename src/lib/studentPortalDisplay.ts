import { getSafeRemainingBalance } from "@/lib/feeMath";

export type PortalFeeStatus = "clear" | "pending" | "partial" | "overdue" | "blocked" | string;

export interface PortalStudent {
  _id: string;
  studentName?: string;
  fatherName?: string;
  gender?: string;
  program?: string;
  group?: string;
  board?: string;
  session?: string;
  feeStatus?: PortalFeeStatus;
  totalProgramFee?: number;
  discountAmount?: number;
  finalPayableFee?: number;
  totalPaid?: number;
  remainingBalance?: number;
  isManuallyBlocked?: boolean;
}

export interface PortalDocument {
  _id: string;
  title?: string;
  type?: "admit_card" | "enrollment_card" | "marksheet" | "fee_voucher" | "other" | string;
  createdAt?: string;
  downloadAllowed?: boolean;
  requiresFeeClearance?: boolean;
  isPublished?: boolean;
  fileSize?: number;
  mimeType?: string;
}

export type DocumentAccessStatus =
  | "available"
  | "not_uploaded"
  | "locked"
  | "fee_clearance_required"
  | "not_published";

const preservedTokens: Record<string, string> = {
  aiou: "AIOU",
  bba: "BBA",
  bs: "BS",
  adc: "ADC",
  cnic: "CNIC",
};

export function formatTitleCase(value?: string | null, fallback = "N/A") {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  if (!text) return fallback;

  return text
    .split(" ")
    .map((word) =>
      word
        .split("/")
        .map((part) => {
          const cleanPart = part.trim();
          const key = cleanPart.toLowerCase();
          if (!cleanPart) return cleanPart;
          if (preservedTokens[key]) return preservedTokens[key];
          if (/^[A-Z0-9.]{2,}$/.test(cleanPart)) return cleanPart;
          return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1).toLowerCase();
        })
        .join("/")
    )
    .join(" ");
}

export function formatFeeStatus(value?: PortalFeeStatus) {
  return formatTitleCase(String(value || "pending").replace(/[_-]+/g, " "));
}

export function formatCurrency(value?: number) {
  const amount = Number(value || 0);
  return `Rs ${Math.max(0, amount).toLocaleString("en-PK")}`;
}

export function getRemainingBalance(student: PortalStudent) {
  return getSafeRemainingBalance({
    finalPayableFee: student.finalPayableFee,
    totalPaid: student.totalPaid,
    remainingBalance: student.remainingBalance,
  });
}

export function isFeeClear(student: PortalStudent) {
  return student.feeStatus === "clear" && getRemainingBalance(student) === 0 && !student.isManuallyBlocked;
}

export function getPaymentProgress(student: PortalStudent) {
  const payable = Math.max(0, Number(student.finalPayableFee || 0));
  const paid = Math.max(0, Number(student.totalPaid || 0));

  if (isFeeClear(student)) return 100;
  if (payable <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((paid / payable) * 100)));
}

export function formatRelation(fatherName?: string, gender?: string) {
  const formattedFatherName = formatTitleCase(fatherName, "N/A");
  const normalizedGender = String(gender || "").trim().toLowerCase();

  if (normalizedGender === "male") return `S/O ${formattedFatherName}`;
  if (normalizedGender === "female") return `D/O ${formattedFatherName}`;
  return `Father Name: ${formattedFatherName}`;
}

export function getDocumentAccessStatus(document: PortalDocument | undefined, student: PortalStudent): DocumentAccessStatus {
  if (!document) return "not_uploaded";
  if (document.isPublished === false) return "not_published";

  const feePending = getRemainingBalance(student) > 0 || student.feeStatus !== "clear";
  const requiresFeeClearance = Boolean(document.requiresFeeClearance);
  const lockedByAdmin = Boolean(student.isManuallyBlocked) || student.feeStatus === "blocked";

  if (requiresFeeClearance && lockedByAdmin) return "locked";
  if (requiresFeeClearance && feePending) return "fee_clearance_required";
  if (document.downloadAllowed === false) return "locked";
  return "available";
}

export function isDocumentDownloadable(document: PortalDocument | undefined, student: PortalStudent) {
  return getDocumentAccessStatus(document, student) === "available";
}

export function toWhatsAppUrl(value?: string | null) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `https://wa.me/${number}` : "/contact";
}
