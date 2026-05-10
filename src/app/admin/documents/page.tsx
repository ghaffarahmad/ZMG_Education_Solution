"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  DownloadCloud,
  FileText,
  Loader2,
  Lock,
  Search,
  ShieldAlert,
  Trash2,
  UploadCloud,
  Unlock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { DocumentCardSkeleton, SkeletonBlock, SkeletonLine } from "@/components/ui/Skeleton";
import { BOARD_OPTIONS, PROGRAM_OPTIONS } from "@/lib/studentRules";

type AdminDocument = {
  _id: string;
  title: string;
  type: string;
  originalFileName: string;
  fileSize: number;
  isPublished: boolean;
  requiresFeeClearance: boolean;
  downloadAllowed: boolean;
  createdAt: string;
  studentId?: {
    _id: string;
    studentName: string;
    cnicOrBform: string;
    board?: string;
    program?: string;
    feeStatus: string;
    remainingBalance: number;
  };
};

type PreviewRow = {
  fileName: string;
  matchedStudent: string;
  cnicOrBform: string;
  documentType: string;
  status: "ready" | "error";
  error?: string;
  willReplace?: boolean;
};

const DOCUMENT_TYPES = [
  { value: "admit_card", label: "Admit Card" },
  { value: "enrollment_card", label: "Enrollment Card" },
  { value: "other", label: "Other Document" },
];

type ApiPayload<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const nonJsonResponseMessage = "Server returned a non-JSON response. Please check login/session or API route.";

async function readApiPayload<T>(response: Response): Promise<ApiPayload<T> | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;

  try {
    return (await response.json()) as ApiPayload<T>;
  } catch {
    return null;
  }
}

function responseErrorMessage<T>(payload: ApiPayload<T> | null, fallback: string) {
  return payload?.message || (payload === null ? nonJsonResponseMessage : fallback);
}

function isFeeClear(document: AdminDocument) {
  return document.studentId?.feeStatus === "clear";
}

function getDocumentAccessMessage(document: AdminDocument) {
  const feeClear = isFeeClear(document);

  if (!document.downloadAllowed && feeClear) return "Locked by admin";
  if (document.requiresFeeClearance && !feeClear) return "Locked until fee clear";
  if (document.downloadAllowed && feeClear) return "Ready to download";
  if (document.downloadAllowed && !feeClear && document.requiresFeeClearance) return "Waiting for fee clearance";
  if (!document.downloadAllowed) return "Locked by admin";
  return "Ready to download";
}

function getDocumentAccessClass(document: AdminDocument) {
  const message = getDocumentAccessMessage(document);
  if (message === "Ready to download") return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-200";
  if (message === "Locked by admin") return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200";
  return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200";
}

function DownloadAllowedButton({
  document,
  onToggle,
  className = "",
}: {
  document: AdminDocument;
  onToggle: () => void;
  className?: string;
}) {
  const Icon = document.downloadAllowed ? Unlock : Lock;
  const label = document.downloadAllowed ? "Allowed" : "Locked";
  const styles = document.downloadAllowed
    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-200"
    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${styles} ${className}`}
      title={document.downloadAllowed ? "Click to lock downloads" : "Click to allow downloads"}
    >
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </button>
  );
}

function DocumentTableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="admin-table-row" aria-hidden="true">
          <td className="px-4 py-4">
            <SkeletonBlock className="h-4 w-4 rounded" />
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <SkeletonBlock className="h-10 w-10 rounded-lg" />
              <div className="ml-3 space-y-2">
                <SkeletonLine className="w-36" />
                <SkeletonLine className="w-48" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4"><SkeletonLine className="w-32" /></td>
          <td className="px-4 py-4"><SkeletonLine className="w-24" /></td>
          <td className="px-4 py-4"><SkeletonBlock className="h-7 w-24 rounded-md" /></td>
          <td className="px-4 py-4"><SkeletonBlock className="h-7 w-20 rounded-md" /></td>
          <td className="px-4 py-4"><SkeletonBlock className="h-7 w-20 rounded-full" /></td>
          <td className="px-4 py-4"><SkeletonLine className="w-24" /></td>
          <td className="admin-table-sticky-action px-4 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [board, setBoard] = useState("");
  const [program, setProgram] = useState("");
  const [feeStatus, setFeeStatus] = useState("");
  const [published, setPublished] = useState("");
  const [locked, setLocked] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [documentType, setDocumentType] = useState<"admit_card" | "enrollment_card" | "other">("admit_card");
  const [isPublished, setIsPublished] = useState(true);
  const [downloadAllowed, setDownloadAllowed] = useState(true);
  const [requiresFeeClearance, setRequiresFeeClearance] = useState(true);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildQuery = () => {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (type) query.append("type", type);
    if (board) query.append("board", board);
    if (program) query.append("program", program);
    if (feeStatus) query.append("feeStatus", feeStatus);
    if (published) query.append("published", published);
    if (locked) query.append("locked", locked);
    return query;
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/documents?${buildQuery().toString()}`);
      const payload = await readApiPayload<AdminDocument[]>(res);
      if (!res.ok || !payload?.success) {
        toast.error(responseErrorMessage(payload, "Failed to load documents"));
        return;
      }
      setDocuments(payload.data || []);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchDocuments, 300);
    return () => window.clearTimeout(timer);
  }, [search, type, board, program, feeStatus, published, locked]);

  const maskCnic = (cnic: string) => {
    if (!cnic || cnic.length < 13) return cnic;
    return `${cnic.substring(0, 5)}-*******-${cnic.substring(cnic.length - 1)}`;
  };

  const formatType = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const buildBulkFormData = (mode: "preview" | "confirm", files = bulkFiles) => {
    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("documentType", documentType);
    formData.append("isPublished", String(isPublished));
    formData.append("downloadAllowed", String(downloadAllowed));
    formData.append("requiresFeeClearance", String(requiresFeeClearance));
    formData.append("replaceExisting", String(replaceExisting));
    files.forEach((file) => formData.append("files", file));
    return formData;
  };

  const previewBulkUpload = async (files: File[]) => {
    if (files.length === 0) {
      toast.error("Select PDF files or a ZIP file first");
      return;
    }

    setBulkUploading(true);
    setBulkFiles(files);
    setPreviewRows([]);
    try {
      const formData = buildBulkFormData("preview", files);
      const res = await fetch("/api/admin/documents/bulk", { method: "POST", body: formData });
      const payload = await readApiPayload<{ rows?: PreviewRow[]; readyCount?: number; errorCount?: number }>(res);
      if (!res.ok || !payload?.success) {
        toast.error(responseErrorMessage(payload, "Preview failed"));
        return;
      }
      setPreviewRows(payload.data?.rows || []);
      toast.success(`Preview ready: ${payload.data?.readyCount || 0} ready, ${payload.data?.errorCount || 0} errors`);
    } catch {
      toast.error("Preview failed");
    } finally {
      setBulkUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmBulkUpload = async () => {
    if (previewRows.some((row) => row.status === "error")) {
      toast.error("Fix unmatched or invalid files before uploading");
      return;
    }
    if (!confirm(`Upload ${previewRows.length} matched documents?`)) return;

    setBulkUploading(true);
    try {
      const res = await fetch("/api/admin/documents/bulk", { method: "POST", body: buildBulkFormData("confirm") });
      const payload = await readApiPayload<{ uploaded?: number; replaced?: number; rows?: PreviewRow[] }>(res);
      if (!res.ok || !payload?.success) {
        if (payload?.data?.rows) setPreviewRows(payload.data.rows);
        toast.error(responseErrorMessage(payload, "Bulk upload failed"));
        return;
      }
      toast.success(`Bulk upload complete: ${payload.data?.uploaded || 0} uploaded, ${payload.data?.replaced || 0} replaced`);
      setPreviewRows([]);
      setBulkFiles([]);
      fetchDocuments();
    } catch {
      toast.error("Bulk upload failed");
    } finally {
      setBulkUploading(false);
    }
  };

  const toggleFlag = async (id: string, field: "isPublished" | "downloadAllowed" | "requiresFeeClearance", currentValue: boolean) => {
    try {
      const nextValue = !currentValue;
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: nextValue }),
      });

      const payload = await readApiPayload<Partial<AdminDocument>>(res);
      if (!res.ok || !payload?.success || !payload.data) {
        throw new Error(responseErrorMessage(payload, "Document update failed"));
      }

      toast.success("Document updated");
      setDocuments((current) => current.map((doc) => (doc._id === id ? { ...doc, ...payload.data } : doc)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Document update failed");
    }
  };

  const handleBulkAction = async (action: "publish" | "unpublish" | "lock" | "unlock") => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one document");
      return;
    }

    try {
      const res = await fetch("/api/admin/documents/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, documentIds: selectedIds }),
      });
      const payload = await readApiPayload(res);
      if (!res.ok || !payload?.success) {
        toast.error(responseErrorMessage(payload, "Bulk action failed"));
        return;
      }
      toast.success("Bulk document action applied");
      setSelectedIds([]);
      fetchDocuments();
    } catch {
      toast.error("Bulk action failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document permanently?")) return;
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      const payload = await readApiPayload(res);
      if (!res.ok || !payload?.success) {
        toast.error(responseErrorMessage(payload, "Failed to delete document"));
        return;
      }
      toast.success("Document deleted");
      setDocuments((current) => current.filter((doc) => doc._id !== id));
      setSelectedIds((current) => current.filter((docId) => docId !== id));
    } catch {
      toast.error("Error occurred while deleting");
    }
  };

  const handleTypeChange = (value: "admit_card" | "enrollment_card" | "other") => {
    setDocumentType(value);
    setRequiresFeeClearance(value === "admit_card");
    setPreviewRows([]);
  };

  return (
    <div className="content-fade-in space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Center</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-300">Manage published documents, fee locks, and bulk PDF uploads.</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Bulk Documents
        </Button>
      </div>

      <div className="admin-card p-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, CNIC, document type..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="admin-input block min-h-10 w-full rounded-lg py-2 pr-3 pl-9 text-sm"
            />
          </div>
          <select value={type} onChange={(event) => setType(event.target.value)} className="admin-input min-h-10 rounded-lg px-3 py-2 text-sm">
            <option value="">All Types</option>
            <option value="admit_card">Admit Card</option>
            <option value="enrollment_card">Enrollment Card</option>
            <option value="other">Other</option>
          </select>
          <select value={board} onChange={(event) => setBoard(event.target.value)} className="admin-input min-h-10 rounded-lg px-3 py-2 text-sm">
            <option value="">All Boards</option>
            {BOARD_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={program} onChange={(event) => setProgram(event.target.value)} className="admin-input min-h-10 rounded-lg px-3 py-2 text-sm">
            <option value="">All Programs</option>
            {PROGRAM_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={feeStatus} onChange={(event) => setFeeStatus(event.target.value)} className="admin-input min-h-10 rounded-lg px-3 py-2 text-sm">
            <option value="">All Fee Status</option>
            <option value="clear">Clear</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="blocked">Blocked</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select value={published} onChange={(event) => setPublished(event.target.value)} className="admin-input min-h-10 rounded-lg px-3 py-2 text-sm">
              <option value="">Published</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <select value={locked} onChange={(event) => setLocked(event.target.value)} className="admin-input min-h-10 rounded-lg px-3 py-2 text-sm">
              <option value="">Locked</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Document Type</label>
            <select value={documentType} onChange={(event) => handleTypeChange(event.target.value as "admit_card" | "enrollment_card" | "other")} className="admin-input min-h-10 w-full rounded-lg px-3 py-2 text-sm">
              {DOCUMENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
            <label className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200">
              <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} className="rounded border-slate-300 text-primary dark:border-white/30 dark:bg-white/10" />
              Publish after upload
            </label>
            <label className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200">
              <input type="checkbox" checked={downloadAllowed} onChange={(event) => setDownloadAllowed(event.target.checked)} className="rounded border-slate-300 text-primary dark:border-white/30 dark:bg-white/10" />
              Allow download
            </label>
            <label className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200">
              <input type="checkbox" checked={requiresFeeClearance} onChange={(event) => setRequiresFeeClearance(event.target.checked)} className="rounded border-slate-300 text-primary dark:border-white/30 dark:bg-white/10" />
              Lock until fee clear
            </label>
            <label className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200">
              <input type="checkbox" checked={replaceExisting} onChange={(event) => setReplaceExisting(event.target.checked)} className="rounded border-slate-300 text-primary dark:border-white/30 dark:bg-white/10" />
              Replace existing
            </label>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={bulkUploading}>
              {bulkUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Select PDFs or ZIP
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.zip,application/pdf,application/zip"
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                if (files.length) previewBulkUpload(files);
              }}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
          Filename format: CNIC_enrollment.pdf, CNIC_admit-card.pdf, or CNIC_other.pdf. ZIP files may contain PDFs using the same naming format. Max PDF size: 10MB.
        </p>
      </div>

      {previewRows.length > 0 && (
        <div className="admin-card">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Bulk Upload Preview</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {previewRows.filter((row) => row.status === "ready").length} ready, {previewRows.filter((row) => row.status === "error").length} errors.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setPreviewRows([]); setBulkFiles([]); }}>Clear Preview</Button>
              <Button size="sm" variant="primary" onClick={confirmBulkUpload} disabled={bulkUploading || previewRows.some((row) => row.status === "error")}>
                {bulkUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Confirm Upload
              </Button>
            </div>
          </div>
          <div className="space-y-3 p-4 md:hidden">
            {previewRows.map((row) => (
              <div key={row.fileName} className={`rounded-xl border p-3 text-sm ${row.status === "error" ? "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-bold text-slate-900 dark:text-white">{row.fileName}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">{row.matchedStudent || "No match"}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold uppercase ${row.status === "ready" ? "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200"}`}>
                    {row.willReplace ? "replace" : row.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2 dark:bg-[#092128]">
                    <div className="text-slate-400">CNIC/B-Form</div>
                    <div className="mt-1 font-mono font-semibold text-slate-800 dark:text-slate-100">{row.cnicOrBform || "-"}</div>
                  </div>
                  <div className="rounded-lg bg-white p-2 dark:bg-[#092128]">
                    <div className="text-slate-400">Type</div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatType(row.documentType)}</div>
                  </div>
                </div>
                {row.error && <div className="mt-2 text-xs font-medium text-red-700 dark:text-red-200">{row.error}</div>}
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
              <thead className="admin-table-header">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">File Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">Matched Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">CNIC/B-Form</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">Document Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {previewRows.map((row) => (
                  <tr key={row.fileName} className={`admin-table-row ${row.status === "error" ? "admin-table-row-error" : ""}`}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.fileName}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{row.matchedStudent}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-200">{row.cnicOrBform}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatType(row.documentType)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${row.status === "ready" ? "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200"}`}>
                        {row.willReplace ? "replace" : row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.error || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <span className="text-sm font-semibold text-primary dark:text-accent">{selectedIds.length} documents selected</span>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button size="sm" variant="outline" className="min-h-10" onClick={() => handleBulkAction("publish")}>Publish</Button>
            <Button size="sm" variant="outline" className="min-h-10" onClick={() => handleBulkAction("unpublish")}>Unpublish</Button>
            <Button size="sm" variant="outline" className="min-h-10" onClick={() => handleBulkAction("lock")}><Lock className="mr-2 h-4 w-4" /> Lock</Button>
            <Button size="sm" variant="outline" className="min-h-10" onClick={() => handleBulkAction("unlock")}><Unlock className="mr-2 h-4 w-4" /> Unlock</Button>
          </div>
        </div>
      )}

      <div className="space-y-3 md:hidden">
        {loading ? (
          <div aria-busy="true" aria-label="Loading documents" className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <DocumentCardSkeleton key={index} />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="admin-card p-8 text-center text-sm font-medium text-slate-500 dark:text-slate-300">No documents found.</div>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className={`admin-card p-4 ${selectedIds.includes(doc._id) ? "ring-2 ring-primary/25 dark:ring-accent/30" : ""}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(doc._id)}
                  onChange={() => setSelectedIds((current) => current.includes(doc._id) ? current.filter((id) => id !== doc._id) : [...current, doc._id])}
                  className="mt-1 rounded border-slate-300 text-primary dark:border-white/30 dark:bg-white/10"
                  aria-label={`Select ${doc.title}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {doc.studentId ? (
                        <Link href={`/admin/students/${doc.studentId._id}`} className="truncate text-base font-bold text-primary dark:text-accent">
                          {doc.studentId.studentName}
                        </Link>
                      ) : (
                        <span className="text-base font-bold text-red-500">Student Deleted</span>
                      )}
                      <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">{doc.title}</p>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-300">{doc.studentId ? maskCnic(doc.studentId.cnicOrBform) : "-"}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase text-slate-700 dark:bg-white/10 dark:text-slate-200">{formatType(doc.type)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <div className="text-slate-400">Published</div>
                      <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{doc.isPublished ? "Published" : "Hidden"}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <div className="text-slate-400">Download</div>
                      <div className="mt-1">
                        <DownloadAllowedButton
                          document={doc}
                          onToggle={() => toggleFlag(doc._id, "downloadAllowed", doc.downloadAllowed)}
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <div className="text-slate-400">Fee Status</div>
                      <div className="mt-1 font-semibold uppercase text-slate-800 dark:text-slate-100">{doc.studentId?.feeStatus || "-"}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <div className="text-slate-400">Uploaded</div>
                      <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{new Date(doc.createdAt).toLocaleDateString("en-GB")}</div>
                    </div>
                  </div>
                  <div className={`mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getDocumentAccessClass(doc)}`}>
                    <ShieldAlert className="mr-1 h-3 w-3" /> {getDocumentAccessMessage(doc)}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={() => toggleFlag(doc._id, "isPublished", doc.isPublished)} className="min-h-10 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-100">
                      {doc.isPublished ? "Hide" : "Publish"}
                    </button>
                    <DownloadAllowedButton
                      document={doc}
                      onToggle={() => toggleFlag(doc._id, "downloadAllowed", doc.downloadAllowed)}
                      className="min-h-10 w-full justify-center rounded-lg"
                    />
                    <button onClick={() => toggleFlag(doc._id, "requiresFeeClearance", doc.requiresFeeClearance)} className="min-h-10 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-100">
                      {doc.requiresFeeClearance ? "Remove Fee Lock" : "Require Fee Clear"}
                    </button>
                    <a href={`/api/student/download/${doc._id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-2 text-xs font-semibold text-white">
                      Test Download
                    </a>
                    <button onClick={() => handleDelete(doc._id)} className="min-h-10 rounded-lg border border-red-200 px-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:text-red-200">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="admin-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] divide-y divide-slate-200 dark:divide-white/10">
            <thead className="admin-table-header">
              <tr>
                <th className="w-8 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary dark:border-white/30 dark:bg-white/10"
                    checked={documents.length > 0 && selectedIds.length === documents.length}
                    onChange={(event) => setSelectedIds(event.target.checked ? documents.map((doc) => doc._id) : [])}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">CNIC/B-Form</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Document Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Published Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Download Allowed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Fee Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Uploaded Date</th>
                <th className="admin-table-sticky-header z-10 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <DocumentTableSkeletonRows />
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 dark:text-slate-300">No documents found.</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className={`admin-table-row ${selectedIds.includes(doc._id) ? "admin-table-row-selected" : ""}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(doc._id)}
                        onChange={() => setSelectedIds((current) => current.includes(doc._id) ? current.filter((id) => id !== doc._id) : [...current, doc._id])}
                        className="rounded border-slate-300 text-primary dark:border-white/30 dark:bg-white/10"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10">
                          <FileText className="h-5 w-5 text-primary dark:text-accent" />
                        </div>
                        <div className="ml-3">
                          {doc.studentId ? (
                            <Link href={`/admin/students/${doc.studentId._id}`} className="text-sm font-bold text-primary hover:underline dark:text-accent">
                              {doc.studentId.studentName}
                            </Link>
                          ) : (
                            <span className="text-sm font-bold text-red-500">Student Deleted</span>
                          )}
                          <div className="text-xs text-slate-500 dark:text-slate-300">{doc.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-slate-700 dark:text-slate-200">{doc.studentId ? maskCnic(doc.studentId.cnicOrBform) : "-"}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{formatType(doc.type)}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleFlag(doc._id, "isPublished", doc.isPublished)} className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${doc.isPublished ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-200" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"}`}>
                        {doc.isPublished ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {doc.isPublished ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <DownloadAllowedButton
                        document={doc}
                        onToggle={() => toggleFlag(doc._id, "downloadAllowed", doc.downloadAllowed)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700 dark:bg-white/10 dark:text-slate-200">{doc.studentId?.feeStatus || "-"}</span>
                        <span className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-semibold ${getDocumentAccessClass(doc)}`}>
                          <ShieldAlert className="mr-1 h-3 w-3" /> {getDocumentAccessMessage(doc)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{new Date(doc.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="admin-table-sticky-action px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleFlag(doc._id, "requiresFeeClearance", doc.requiresFeeClearance)} className="admin-icon-action rounded-lg p-2" title={doc.requiresFeeClearance ? "Unlock document" : "Lock document"}>
                          {doc.requiresFeeClearance ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                        <a href={`/api/student/download/${doc._id}`} target="_blank" rel="noopener noreferrer" className="admin-icon-action rounded-lg p-2" title="Test secure download">
                          <DownloadCloud className="h-4 w-4" />
                        </a>
                        <button onClick={() => handleDelete(doc._id)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300" title="Delete Document">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
