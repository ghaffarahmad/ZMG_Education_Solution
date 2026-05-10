import { formatCurrency, formatTitleCase, type PortalStudent } from "@/lib/studentPortalDisplay";

export interface PaymentInstructionSettings {
  paymentBankName?: string;
  paymentAccountTitle?: string;
  paymentAccountNumber?: string;
  paymentInstructionText?: string;
}

export const DEFAULT_PAYMENT_INSTRUCTIONS = {
  bankName: "Bank Al Habib",
  accountTitle: "Ghaffar Ahmad",
  accountNumber: "10060095022849018",
  instructionText: "After making payment, please send the payment screenshot to administration on WhatsApp.",
};

export function getPaymentInstructions(settings?: PaymentInstructionSettings | null) {
  return {
    bankName: settings?.paymentBankName?.trim() || DEFAULT_PAYMENT_INSTRUCTIONS.bankName,
    accountTitle: settings?.paymentAccountTitle?.trim() || DEFAULT_PAYMENT_INSTRUCTIONS.accountTitle,
    accountNumber: settings?.paymentAccountNumber?.trim() || DEFAULT_PAYMENT_INSTRUCTIONS.accountNumber,
    instructionText: settings?.paymentInstructionText?.trim() || DEFAULT_PAYMENT_INSTRUCTIONS.instructionText,
  };
}

export function createPaymentScreenshotMessage(student: PortalStudent, remainingBalance: number) {
  return [
    "Assalam o Alaikum, I have paid my pending fee for Z.M.G Education Solution.",
    `Student Name: ${formatTitleCase(student.studentName, "Student")}`,
    `Program/Class: ${formatTitleCase(student.program, "N/A")}`,
    `Remaining Amount: ${formatCurrency(remainingBalance)}`,
    "I am sending the payment screenshot for verification.",
  ].join("\n");
}

export function createWhatsAppUrl(value?: string | null, message?: string) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  if (!number) return "/contact";

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}
