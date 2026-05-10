"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Lock,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatTitleCase,
  getDocumentAccessStatus,
  getRemainingBalance,
  type DocumentAccessStatus,
  type PortalDocument,
  type PortalStudent,
} from "@/lib/studentPortalDisplay";

interface StudentDocumentCardProps {
  title: string;
  description: string;
  documents: PortalDocument[];
  student: PortalStudent;
  icon: LucideIcon;
}

const statusPriority: DocumentAccessStatus[] = [
  "available",
  "fee_clearance_required",
  "locked",
  "not_published",
  "not_uploaded",
];

const statusMeta: Record<
  DocumentAccessStatus,
  {
    label: string;
    Icon: LucideIcon;
    badgeClass: string;
    iconClass: string;
    message: string;
  }
> = {
  available: {
    label: "Available",
    Icon: CheckCircle2,
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
    iconClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
    message: "This document is ready to download.",
  },
  not_uploaded: {
    label: "Not Uploaded Yet",
    Icon: Clock3,
    badgeClass:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200",
    iconClass: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    message: "Administration has not uploaded this document yet.",
  },
  locked: {
    label: "Locked",
    Icon: Lock,
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200",
    iconClass: "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-200",
    message: "Download access is currently locked by administration.",
  },
  fee_clearance_required: {
    label: "Fee Clearance Required",
    Icon: ShieldAlert,
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200",
    iconClass: "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200",
    message: "Please clear your pending fee before downloading this document.",
  },
  not_published: {
    label: "Not Published Yet",
    Icon: AlertCircle,
    badgeClass:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200",
    iconClass: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200",
    message: "This document has not been published for students yet.",
  },
};

function resolveCardStatus(documents: PortalDocument[], student: PortalStudent): DocumentAccessStatus {
  if (documents.length === 0) return "not_uploaded";

  const statuses = documents.map((document) => getDocumentAccessStatus(document, student));
  return statusPriority.find((status) => statuses.includes(status)) || "not_uploaded";
}

function formatFileSize(size?: number) {
  const fileSize = Number(size || 0);
  if (fileSize <= 0) return "PDF";
  if (fileSize >= 1024 * 1024) return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(fileSize / 1024)).toLocaleString("en-PK")} KB`;
}

export function StudentDocumentCard({
  title,
  description,
  documents,
  student,
  icon: Icon,
}: StudentDocumentCardProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const cardStatus = resolveCardStatus(documents, student);
  const cardMeta = statusMeta[cardStatus];
  const StatusIcon = cardMeta.Icon;
  const downloadableDocuments = documents.filter(
    (document) => getDocumentAccessStatus(document, student) === "available"
  );
  const hasMultipleDownloads = downloadableDocuments.length > 1;

  const handleDownload = async (document: PortalDocument) => {
    const status = getDocumentAccessStatus(document, student);

    if (status !== "available") {
      if (status === "fee_clearance_required") {
        toast.error(
          `Please clear your pending dues of ${formatCurrency(getRemainingBalance(student))} to download this document.`,
          { duration: 5000 }
        );
      } else if (status === "locked") {
        toast.error("Download is currently locked by administration.");
      } else if (status === "not_published") {
        toast.error("This document is not published yet.");
      } else {
        toast.error("This document is not uploaded yet.");
      }
      return;
    }

    setDownloadingId(document._id);
    try {
      const res = await fetch(`/api/student/download/${document._id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to download");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${formatTitleCase(document.title || title, title)}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      toast.success("Download started");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error downloading document";
      toast.error(message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <article className="content-soft-rise flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg sm:p-5 dark:border-white/10 dark:bg-[#0c2a33]">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", cardMeta.iconClass)}>
          <Icon className="h-6 w-6" />
        </div>
        <span
          className={cn(
            "inline-flex max-w-[10.5rem] items-center gap-1.5 rounded-full border px-2.5 py-1 text-right text-[11px] font-bold uppercase leading-tight sm:max-w-[12rem]",
            cardMeta.badgeClass
          )}
        >
          <StatusIcon className="h-3.5 w-3.5 shrink-0" />
          {cardMeta.label}
        </span>
      </div>

      <div className="mt-5 min-w-0">
        <h3 className="text-lg font-black text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>

      <div className="mt-5 flex-1 space-y-2">
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
            {cardMeta.message}
          </div>
        ) : (
          documents.map((document) => {
            const documentStatus = getDocumentAccessStatus(document, student);
            const documentMeta = statusMeta[documentStatus];
            const DocumentStatusIcon = documentMeta.Icon;
            const isDownloading = downloadingId === document._id;
            const canDownload = documentStatus === "available";

            return (
              <div
                key={document._id}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary dark:text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {formatTitleCase(document.title || title, title)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {formatTitleCase(String(document.type || "").replace(/_/g, " "), title)} - {formatFileSize(document.fileSize)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold", documentMeta.badgeClass)}>
                    <DocumentStatusIcon className="h-3.5 w-3.5" />
                    {documentMeta.label}
                  </span>
                  {canDownload && hasMultipleDownloads && (
                    <button
                      type="button"
                      onClick={() => handleDownload(document)}
                      disabled={isDownloading}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#124C5A] disabled:opacity-60 sm:w-auto dark:bg-accent dark:text-[#092128] dark:hover:bg-[#f0cf62]"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isDownloading ? "Processing..." : "Download"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-5">
        {downloadableDocuments.length === 1 ? (
          <button
            type="button"
            onClick={() => handleDownload(downloadableDocuments[0])}
            disabled={downloadingId === downloadableDocuments[0]._id}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#124C5A] disabled:opacity-60 dark:bg-accent dark:text-[#092128] dark:hover:bg-[#f0cf62]"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloadingId === downloadableDocuments[0]._id ? "Processing..." : "Download"}
          </button>
        ) : downloadableDocuments.length > 1 ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
            {downloadableDocuments.length} documents ready. Use the download buttons above.
          </p>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
          >
            <Lock className="mr-2 h-4 w-4" />
            {cardMeta.label}
          </button>
        )}
      </div>
    </article>
  );
}
