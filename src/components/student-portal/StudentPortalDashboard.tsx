"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Banknote,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  GraduationCap,
  IdCard,
  Landmark,
  LogOut,
  MessageCircle,
  ShieldCheck,
  UserRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { StudentDocumentCard } from "@/components/public/StudentDocumentCard";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatFeeStatus,
  formatRelation,
  formatTitleCase,
  getPaymentProgress,
  getRemainingBalance,
  isDocumentDownloadable,
  isFeeClear,
  type PortalDocument,
  type PortalStudent,
} from "@/lib/studentPortalDisplay";
import {
  createPaymentScreenshotMessage,
  createWhatsAppUrl,
  getPaymentInstructions,
  type PaymentInstructionSettings,
} from "@/lib/paymentInstructions";

export interface PortalResult {
  student: PortalStudent;
  documents: PortalDocument[];
}

export interface PublicSettings extends PaymentInstructionSettings {
  whatsappNumber?: string;
}

interface InfoTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
}

function InfoTile({ label, value, icon: Icon, accent = false }: InfoTileProps) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            accent
              ? "bg-primary text-white dark:bg-accent dark:text-[#092128]"
              : "bg-white text-primary shadow-sm dark:bg-white/10 dark:text-accent"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">{label}</p>
          <p className="mt-1 break-words text-sm font-black text-slate-950 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusChip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "verified" | "clear" | "warning" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
        tone === "verified" &&
          "border-emerald-300/40 bg-emerald-300/15 text-emerald-50 dark:border-emerald-200/30",
        tone === "clear" && "border-accent/60 bg-accent/15 text-white",
        tone === "warning" && "border-amber-200/50 bg-amber-200/15 text-amber-50",
        tone === "neutral" && "border-white/20 bg-white/10 text-white"
      )}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#0c2a33]">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11 dark:bg-accent/10 dark:text-accent">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-950 sm:text-xl dark:text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function FeeStatusBadge({ status, clear }: { status?: string; clear: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide",
        clear
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
          : status === "blocked" || status === "overdue"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
            : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
      )}
    >
      {formatFeeStatus(status)}
    </span>
  );
}

function FeeRow({
  label,
  value,
  strong = false,
  tone = "default",
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "default" | "success" | "danger";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-sm",
        strong ? "bg-slate-50 font-black dark:bg-white/5" : "font-semibold",
        tone === "success" && "text-emerald-700 dark:text-emerald-200",
        tone === "danger" && "text-red-600 dark:text-red-200",
        tone === "default" && "text-slate-700 dark:text-slate-200"
      )}
    >
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}

function isFeeActionRequired(status?: string, remainingBalance = 0) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  return remainingBalance > 0 || ["pending", "partial", "overdue", "blocked"].includes(normalizedStatus);
}

function CopyButton({ children, value }: { children: React.ReactNode; value: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Account details copied");
    } catch {
      toast.error("Unable to copy account details");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-black text-primary transition-colors hover:border-accent hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf0] dark:text-accent dark:focus-visible:ring-offset-[#0D3B46] sm:w-auto sm:text-sm"
    >
      <Copy className="mr-2 h-4 w-4" />
      {children}
    </button>
  );
}

function PaymentInstructionsCard({
  student,
  remainingBalance,
  settings,
  whatsappNumber,
}: {
  student: PortalStudent;
  remainingBalance: number;
  settings?: PublicSettings | null;
  whatsappNumber?: string | null;
}) {
  const instructions = getPaymentInstructions(settings);
  const bankDetailsText = [
    `Bank Name: ${instructions.bankName}`,
    `Account Title: ${instructions.accountTitle}`,
    `Account Number: ${instructions.accountNumber}`,
  ].join("\n");
  const screenshotMessage = createPaymentScreenshotMessage(student, remainingBalance);
  const screenshotUrl = createWhatsAppUrl(whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923143061669", screenshotMessage);

  const rows = [
    ["Bank Name", instructions.bankName],
    ["Account Title", instructions.accountTitle],
    ["Account Number", instructions.accountNumber],
    ["Remaining Amount", formatCurrency(remainingBalance)],
  ];

  return (
    <div
      data-payment-instructions-card
      className="premium-card-line mt-5 overflow-hidden rounded-2xl border border-accent/35 bg-[#fffaf0] p-4 shadow-[0_18px_55px_rgb(13_59_70/0.1)] dark:border-accent/25 dark:bg-[#0D3B46] dark:shadow-black/20 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary shadow-lg shadow-accent/20">
          <Banknote className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-black text-slate-950 dark:text-white sm:text-lg">Payment Instructions</h3>
          <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">
            Please clear your pending dues and send the payment screenshot for verification.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2.5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-xl border border-accent/20 bg-white/75 px-3 py-2.5 dark:border-white/10 dark:bg-white/10 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
              {label}
            </span>
            <span className="break-words text-sm font-black text-slate-950 dark:text-white sm:text-right">
              {value}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2.5 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-100">
        {instructions.instructionText} Include your student name with the screenshot.
      </p>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <CopyButton value={instructions.accountNumber}>Copy Account Number</CopyButton>
        <CopyButton value={bankDetailsText}>Copy Bank Details</CopyButton>
        <a
          href={screenshotUrl}
          target={screenshotUrl.startsWith("http") ? "_blank" : undefined}
          rel={screenshotUrl.startsWith("http") ? "noopener noreferrer" : undefined}
          className="premium-soft-glow inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-[#124C5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf0] dark:bg-accent dark:text-[#092128] dark:hover:bg-[#f0cf62] dark:focus-visible:ring-offset-[#0D3B46] sm:w-auto"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Send Payment Screenshot
        </a>
      </div>

      <p className="mt-4 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
        Payment will be verified by administration. Your portal status will update after confirmation.
      </p>
    </div>
  );
}

export function StudentPortalDashboard({
  result,
  settings,
}: {
  result: PortalResult;
  settings?: PublicSettings | null;
}) {
  const router = useRouter();
  const { student } = result;
  const documents = result.documents || [];
  const studentName = formatTitleCase(student.studentName, "Student");
  const fatherRelation = formatRelation(student.fatherName, student.gender);
  const feeClear = isFeeClear(student);
  const remaining = getRemainingBalance(student);
  const progress = getPaymentProgress(student);
  const shouldShowPaymentInstructions = isFeeActionRequired(student.feeStatus, remaining);
  const adminWhatsappUrl = createWhatsAppUrl(settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923143061669");
  const academicSummary: Array<{ label: string; value: string; icon: LucideIcon }> = [
    { label: "Board / University", value: formatTitleCase(student.board), icon: Landmark },
    { label: "Program / Class", value: formatTitleCase(student.program), icon: BookOpenCheck },
    { label: "Group / Subject", value: formatTitleCase(student.group), icon: GraduationCap },
    { label: "Session", value: formatTitleCase(student.session), icon: BadgeCheck },
  ];

  const documentGroups = [
    {
      key: "enrollment",
      title: "Enrollment Card",
      description: "Official enrollment record for your board or university.",
      icon: IdCard,
      documents: documents.filter((document) => document.type === "enrollment_card"),
    },
    {
      key: "admit",
      title: "Admit Card",
      description: "Exam entry document, released when published and eligible.",
      icon: FileText,
      documents: documents.filter((document) => document.type === "admit_card"),
    },
    {
      key: "other",
      title: "Other Documents",
      description: "Marksheets, vouchers, letters, or additional student files.",
      icon: BookOpenCheck,
      documents: documents.filter((document) => document.type !== "enrollment_card" && document.type !== "admit_card"),
    },
  ];

  const hasDownloadableDocuments = documentGroups.some((group) =>
    group.documents.some((document) => isDocumentDownloadable(document, student))
  );

  const handleLogout = async () => {
    await fetch("/api/student/logout", { method: "POST" });
    toast.success("Logged out successfully");
    router.replace("/student-portal");
    router.refresh();
  };

  return (
    <div data-hide-floating-whatsapp className="premium-fade-up space-y-5 pb-16 sm:space-y-6 sm:pb-0">
      <section className="premium-pattern relative overflow-hidden rounded-2xl bg-primary p-4 text-white shadow-2xl shadow-primary/20 sm:p-8">
        <div className="absolute inset-x-0 bottom-0 h-px bg-accent/70" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/40 bg-white/10 text-accent sm:h-14 sm:w-14">
              <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Student Portal</p>
              <h1 className="mt-2 break-words text-2xl font-black leading-tight sm:text-4xl">
                Welcome, {studentName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">
                Your student record has been verified successfully.
              </p>
              {feeClear && (
                <div className="mt-5 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-emerald-200/30 bg-emerald-300/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-50 sm:rounded-full sm:px-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Record Verified</span>
                  <span className="h-1 w-1 rounded-full bg-emerald-100" />
                  <span>Fee Clear</span>
                  <span className="h-1 w-1 rounded-full bg-emerald-100" />
                  <span>Portal Access Active</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap gap-2">
              <StatusChip tone="verified">
                <BadgeCheck className="h-3.5 w-3.5" />
                Record Verified
              </StatusChip>
              <StatusChip tone={feeClear ? "clear" : "warning"}>
                <CreditCard className="h-3.5 w-3.5" />
                Fee Status: {formatFeeStatus(student.feeStatus)}
              </StatusChip>
              {feeClear && (
                <StatusChip tone="clear">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Portal Access Active
                </StatusChip>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/notices"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15 sm:w-auto"
              >
                <Bell className="mr-2 h-4 w-4" />
                View Latest Notices
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-white/30 bg-white px-4 py-2.5 text-sm font-black text-primary shadow-sm transition-colors hover:bg-accent hover:text-[#092128] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:w-auto dark:border-accent/40 dark:bg-accent/15 dark:text-accent dark:hover:bg-accent dark:hover:text-[#092128]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-5 sm:space-y-6">
          <SectionCard
            title="Student Information"
            subtitle="Verified profile details linked with this portal access."
            icon={UserRound}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoTile label="Student Name" value={studentName} icon={GraduationCap} accent />
              <InfoTile label="Father / Relation" value={fatherRelation} icon={UserRound} />
              <InfoTile label="Board / University" value={formatTitleCase(student.board)} icon={Landmark} />
              <InfoTile label="Program / Class" value={formatTitleCase(student.program)} icon={BookOpenCheck} />
              <InfoTile label="Group / Subject" value={formatTitleCase(student.group)} icon={GraduationCap} />
              <InfoTile label="Session" value={formatTitleCase(student.session)} icon={BadgeCheck} />
            </div>
          </SectionCard>

          <SectionCard
            title="Academic Details"
            subtitle="Academic record summary for document and notice updates."
            icon={BookOpenCheck}
            action={
              <Link
                href="/notices"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-primary transition-colors hover:border-accent hover:bg-accent/10 sm:w-auto dark:border-white/10 dark:text-accent dark:hover:bg-white/10"
              >
                <Bell className="mr-2 h-4 w-4" />
                View Latest Notices
              </Link>
            }
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {academicSummary.map(({ label, value, icon: AcademicIcon }) => (
                <div
                  key={label}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent">
                    <AcademicIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-black text-slate-950 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Fee Summary"
          subtitle="Payment status and access eligibility for protected documents."
          icon={WalletCards}
          action={<FeeStatusBadge status={student.feeStatus} clear={feeClear} />}
        >
          <div className="space-y-3">
            <FeeRow label="Total Fee" value={formatCurrency(student.totalProgramFee)} />
            <FeeRow label="Discount" value={`- ${formatCurrency(student.discountAmount)}`} tone="success" />
            <FeeRow label="Net Payable" value={formatCurrency(student.finalPayableFee)} strong />
            <FeeRow label="Total Paid" value={formatCurrency(student.totalPaid)} tone="success" />
            <FeeRow
              label="Remaining"
              value={formatCurrency(remaining)}
              strong
              tone={remaining > 0 ? "danger" : "success"}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              <span>Paid {formatCurrency(student.totalPaid)}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  feeClear ? "bg-emerald-500" : "bg-accent"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Paid {formatCurrency(student.totalPaid)} out of {formatCurrency(student.finalPayableFee)}
            </p>
          </div>

          {feeClear ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
              Your fee is clear. Available documents can be downloaded from your portal.
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>Fee clearance is pending.</span>
                <span className="inline-flex w-fit rounded-full border border-amber-300 bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-900 dark:border-amber-300/40 dark:bg-white/10 dark:text-amber-100">
                  Remaining: {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          )}

          {shouldShowPaymentInstructions && (
            <PaymentInstructionsCard
              student={student}
              remainingBalance={remaining}
              settings={settings}
              whatsappNumber={settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923143061669"}
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Documents"
        subtitle="Expected student documents are shown below with current availability status."
        icon={FileText}
        action={
          <Link
            href="/notices"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#124C5A] sm:w-auto dark:bg-accent dark:text-[#092128] dark:hover:bg-[#f0cf62]"
          >
            <Bell className="mr-2 h-4 w-4" />
            View Latest Notices
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {documentGroups.map((group) => (
            <StudentDocumentCard
              key={group.key}
              title={group.title}
              description={group.description}
              documents={group.documents}
              student={student}
              icon={group.icon}
            />
          ))}
        </div>

        {!hasDownloadableDocuments && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-primary dark:text-accent">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-950 dark:text-white">Documents Not Available Yet</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Your documents are not available yet. Please check notices or contact administration for updates.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/notices"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:border-accent hover:bg-accent/10 sm:w-auto dark:border-white/10 dark:text-accent dark:hover:bg-white/10"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  View Notices
                </Link>
                <a
                  href={adminWhatsappUrl}
                  target={adminWhatsappUrl.startsWith("http") ? "_blank" : undefined}
                  rel={adminWhatsappUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#124C5A] sm:w-auto dark:bg-accent dark:text-[#092128] dark:hover:bg-[#f0cf62]"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Administration
                </a>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
