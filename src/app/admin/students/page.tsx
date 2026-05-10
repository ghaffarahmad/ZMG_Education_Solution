"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  CheckSquare,
  Download,
  Edit,
  Filter,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  ShieldBan,
  Trash2,
  Upload,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { SkeletonBlock, SkeletonLine, StudentCardSkeleton } from "@/components/ui/Skeleton";
import { formatFatherRelation } from "@/lib/studentRules";
import { getSafeRemainingBalance, normalizeMoney } from "@/lib/feeMath";
import { DocumentUploadForm } from "@/components/admin/DocumentUploadForm";

type Student = {
  _id: string;
  studentName: string;
  fatherName: string;
  gender?: "male" | "female";
  cnicOrBform: string;
  dob: string;
  phone?: string;
  board?: string;
  program?: string;
  group?: string;
  session?: string;
  totalProgramFee?: number;
  discountAmount?: number;
  finalPayableFee?: number;
  totalPaid?: number;
  remainingBalance?: number;
  feeStatus: "clear" | "pending" | "partial" | "overdue" | "blocked";
  status: "active" | "inactive";
  isManuallyBlocked?: boolean;
};

type ImportRow = {
  rowNumber: number;
  status: "create" | "update";
  data: Record<string, unknown>;
  errors: string[];
};

function StudentTableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="admin-table-row" aria-hidden="true">
          <td className="px-4 py-4">
            <SkeletonBlock className="h-4 w-4 rounded" />
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <div className="ml-4 space-y-2">
                <SkeletonLine className="w-36" />
                <SkeletonLine className="w-28" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <SkeletonLine className="w-32" />
            <SkeletonLine className="mt-2 w-20" />
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <SkeletonLine className="w-28" />
            <SkeletonLine className="mt-2 w-36" />
          </td>
          <td className="px-4 py-4 whitespace-nowrap"><SkeletonLine className="w-20" /></td>
          <td className="px-4 py-4 whitespace-nowrap"><SkeletonLine className="w-20" /></td>
          <td className="px-4 py-4 whitespace-nowrap"><SkeletonLine className="w-20" /></td>
          <td className="px-4 py-4 whitespace-nowrap"><SkeletonBlock className="h-7 w-20 rounded-full" /></td>
          <td className="admin-table-sticky-action px-4 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [board, setBoard] = useState("");
  const [program, setProgram] = useState("");
  const [gender, setGender] = useState("");
  const [feeStatus, setFeeStatus] = useState("");
  const [status, setStatus] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [academicOptions, setAcademicOptions] = useState<any[]>([]);
  const [uploadModalStudentId, setUploadModalStudentId] = useState<string | null>(null);
  const [uploadModalStudentName, setUploadModalStudentName] = useState("");

  const fetchAcademicOptions = async () => {
    try {
      const res = await fetch("/api/admin/academic-options?activeOnly=true");
      const json = await res.json();
      if (json.success) setAcademicOptions(json.data);
    } catch (error) {
      console.error("Failed to load academic options", error);
    }
  };

  useEffect(() => {
    fetchAcademicOptions();
  }, []);

  const buildQuery = () => {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (board) query.append("board", board);
    if (program) query.append("program", program);
    if (gender) query.append("gender", gender);
    if (feeStatus) query.append("feeStatus", feeStatus);
    if (status) query.append("status", status);
    return query;
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students?${buildQuery().toString()}`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
      } else {
        toast.error(json.message || "Failed to load students");
      }
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchStudents, 400);
    return () => window.clearTimeout(timer);
  }, [search, board, program, gender, feeStatus, status]);

  const maskCnic = (cnic: string) => {
    if (!cnic || cnic.length < 13) return cnic;
    return `${cnic.substring(0, 5)}-*******-${cnic.substring(cnic.length - 1)}`;
  };

  const formatMoney = (value?: number) => `Rs ${normalizeMoney(value).toLocaleString("en-PK")}`;
  const getStudentRemaining = (student: Student) =>
    getSafeRemainingBalance({
      finalPayableFee: student.finalPayableFee,
      totalProgramFee: student.totalProgramFee,
      discountAmount: student.discountAmount,
      totalPaid: student.totalPaid,
      remainingBalance: student.remainingBalance,
    });
  const hasFilters = Boolean(search || board || program || gender || feeStatus || status);

  const clearFilters = () => {
    setSearch("");
    setBoard("");
    setProgram("");
    setGender("");
    setFeeStatus("");
    setStatus("");
  };

  const exportStudents = (scope: "all" | "filtered" | "selected") => {
    if (scope === "selected" && selectedIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    const query = scope === "filtered" ? buildQuery() : new URLSearchParams();
    query.set("scope", scope);
    if (scope === "selected") query.set("ids", selectedIds.join(","));
    window.location.href = `/api/admin/students/export?${query.toString()}`;
  };

  const previewImport = async (file: File) => {
    setImporting(true);
    setImportRows([]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/students/import", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setImportRows(json.data.rows || []);
        toast.success(`Preview ready: ${json.data.validCount} valid rows, ${json.data.errorCount} rows with errors`);
      } else {
        toast.error(json.message || "Failed to preview Excel file");
      }
    } catch {
      toast.error("Failed to preview Excel file");
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const confirmImport = async () => {
    const invalidCount = importRows.filter((row) => row.errors.length > 0).length;
    if (invalidCount > 0) {
      toast.error("Fix validation errors before importing");
      return;
    }

    if (!confirm(`Import ${importRows.length} rows? Existing students will be updated by CNIC/B-Form.`)) return;

    setImporting(true);
    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", rows: importRows }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Import complete: ${json.data.created} created, ${json.data.updated} updated`);
        setImportRows([]);
        fetchStudents();
      } else {
        if (json.data?.rows) setImportRows(json.data.rows);
        toast.error(json.message || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? students.map((student) => student._id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Student deleted successfully");
        setStudents((current) => current.filter((student) => student._id !== id));
        setSelectedIds((current) => current.filter((studentId) => studentId !== id));
      } else {
        toast.error(json.message || "Failed to delete student");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleBulkAction = async (action: "mark_clear" | "block_admit_card") => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    if (!confirm(`Apply this bulk update to ${selectedIds.length} selected students?`)) return;

    try {
      const res = await fetch("/api/admin/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, studentIds: selectedIds }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Bulk update applied");
        setSelectedIds([]);
        fetchStudents();
      } else {
        toast.error(json.message || "Failed to perform bulk update");
      }
    } catch {
      toast.error("An error occurred during bulk update");
    }
  };

  const getFeeStatusBadge = (feeStatusValue: Student["feeStatus"]) => {
    const classes = {
      clear: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-200",
      partial: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200",
      overdue: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
      blocked: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200",
      pending: "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200",
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${classes[feeStatusValue]}`}>{feeStatusValue}</span>;
  };

  return (
    <div className="content-fade-in relative z-0 space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-300">Manage enrollment, fees, document access, and bulk Excel operations.</p>
        </div>
        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link href="/admin/students/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        </Button>
      </div>

      <div className="admin-card p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
          <div className="text-sm font-bold text-slate-900 dark:text-white">Filters</div>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((current) => !current)}
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-100"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showAdvancedFilters ? "Less" : "More"}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-7">
          <div className="relative md:col-span-3 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, father name, or full CNIC..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="admin-input block min-h-10 w-full rounded-lg py-2 pr-3 pl-9 text-sm"
            />
          </div>

          <select value={board} onChange={(event) => setBoard(event.target.value)} className={`admin-input min-h-10 w-full rounded-lg px-3 py-2 text-sm ${showAdvancedFilters ? "block" : "hidden md:block"}`}>
            <option value="">All Boards</option>
            {academicOptions.filter(o => o.type === "board").map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
          </select>

          <select value={program} onChange={(event) => setProgram(event.target.value)} className={`admin-input min-h-10 w-full rounded-lg px-3 py-2 text-sm ${showAdvancedFilters ? "block" : "hidden md:block"}`}>
            <option value="">All Programs</option>
            {academicOptions.filter(o => o.type === "program" && (!o.boardId || (board && academicOptions.find(b => b.name === board)?._id === o.boardId))).map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
          </select>

          <select value={gender} onChange={(event) => setGender(event.target.value)} className={`admin-input min-h-10 w-full rounded-lg px-3 py-2 text-sm ${showAdvancedFilters ? "block" : "hidden md:block"}`}>
            <option value="">All Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select value={feeStatus} onChange={(event) => setFeeStatus(event.target.value)} className={`admin-input min-h-10 w-full rounded-lg px-3 py-2 text-sm ${showAdvancedFilters ? "block" : "hidden md:block"}`}>
            <option value="">All Fee Status</option>
            <option value="clear">Clear</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="blocked">Blocked</option>
          </select>

          <select value={status} onChange={(event) => setStatus(event.target.value)} className={`admin-input min-h-10 w-full rounded-lg px-3 py-2 text-sm ${showAdvancedFilters ? "block" : "hidden md:block"}`}>
            <option value="">Account Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={clearFilters} className="min-h-10 w-full rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary/10 dark:text-accent sm:w-auto">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="admin-card p-3 sm:p-4">
        <div className="mb-3 text-sm font-bold text-slate-900 dark:text-white md:hidden">Bulk Tools</div>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:flex sm:flex-wrap">
            <Button size="sm" variant="outline" className="min-h-10 w-full px-3 text-xs sm:w-auto sm:text-sm" onClick={() => exportStudents("all")}>
              <Download className="mr-2 h-4 w-4" /> Export All
            </Button>
            <Button size="sm" variant="outline" className="min-h-10 w-full px-3 text-xs sm:w-auto sm:text-sm" onClick={() => exportStudents("filtered")}>
              <Download className="mr-2 h-4 w-4" /> Export Filtered
            </Button>
            <Button size="sm" variant="outline" className="min-h-10 w-full px-3 text-xs min-[390px]:col-span-2 sm:w-auto sm:text-sm" onClick={() => exportStudents("selected")} disabled={selectedIds.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export Selected
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:flex sm:flex-wrap">
            <Button size="sm" variant="outline" className="min-h-10 w-full px-3 text-xs sm:w-auto sm:text-sm" onClick={() => { window.location.href = "/api/admin/students/import/template"; }}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Template
            </Button>
            <Button size="sm" variant="outline" className="min-h-10 w-full px-3 text-xs sm:w-auto sm:text-sm" onClick={() => importInputRef.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload Excel
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) previewImport(file);
              }}
            />
          </div>
        </div>
      </div>

      {importRows.length > 0 && (
        <div className="admin-card">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Import Preview</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {importRows.filter((row) => row.errors.length === 0).length} valid rows, {importRows.filter((row) => row.errors.length > 0).length} rows with errors.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setImportRows([])}>Clear Preview</Button>
              <Button size="sm" variant="primary" onClick={confirmImport} disabled={importing || importRows.some((row) => row.errors.length > 0)}>
                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Confirm Import
              </Button>
            </div>
          </div>
          <div className="space-y-3 p-4 md:hidden">
            {importRows.map((row) => (
              <div key={row.rowNumber} className={`rounded-xl border p-3 text-sm ${row.errors.length ? "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-900 dark:text-white">Row {row.rowNumber}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700 dark:bg-white/10 dark:text-slate-200">{row.status}</span>
                </div>
                <div className="mt-2 font-medium text-slate-800 dark:text-slate-100">{String(row.data.studentName || "-")}</div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-300">{String(row.data.cnicOrBform || "-")}</div>
                <div className={`mt-2 text-xs ${row.errors.length ? "text-red-700 dark:text-red-200" : "text-slate-500 dark:text-slate-300"}`}>
                  {row.errors.length ? row.errors.join("; ") : "Ready"}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden max-h-96 overflow-auto md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
              <thead className="admin-table-header sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">Row</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">CNIC/B-Form</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-300">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {importRows.map((row) => (
                  <tr key={row.rowNumber} className={`admin-table-row ${row.errors.length ? "admin-table-row-error" : ""}`}>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{row.rowNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{String(row.data.studentName || "-")}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-200">{String(row.data.cnicOrBform || "-")}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700 dark:bg-white/10 dark:text-slate-200">{row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.errors.length ? row.errors.join("; ") : "Ready"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center text-sm font-semibold text-primary dark:text-accent">
            <CheckSquare className="mr-2 h-4 w-4" />
            {selectedIds.length} students selected
          </div>
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <Button size="sm" variant="outline" className="min-h-10" onClick={() => handleBulkAction("mark_clear")}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Fee Clear
            </Button>
            <Button size="sm" variant="outline" className="min-h-10 text-red-600 dark:text-red-200" onClick={() => handleBulkAction("block_admit_card")}>
              <ShieldBan className="mr-2 h-4 w-4" /> Block Admit Cards
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3 md:hidden">
        {loading ? (
          <div aria-busy="true" aria-label="Loading students" className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <StudentCardSkeleton key={index} />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="admin-card p-8 text-center text-sm font-medium text-slate-500 dark:text-slate-300">No students found matching the criteria.</div>
        ) : (
          students.map((student) => (
            <div key={student._id} className={`admin-card p-4 ${selectedIds.includes(student._id) ? "ring-2 ring-primary/25 dark:ring-accent/30" : ""}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary dark:border-white/30 dark:bg-white/10"
                  checked={selectedIds.includes(student._id)}
                  onChange={() => handleSelectOne(student._id)}
                  aria-label={`Select ${student.studentName}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-slate-900 dark:text-white">{student.studentName}</h2>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-300">{formatFatherRelation(student.fatherName, student.gender)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold uppercase ${student.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
                      {student.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <div className="text-slate-400">CNIC/B-Form</div>
                      <div className="mt-1 font-mono font-semibold text-slate-800 dark:text-slate-100">{maskCnic(student.cnicOrBform)}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <div className="text-slate-400">Session</div>
                      <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{student.session || "N/A"}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <div className="text-slate-400">Board</div>
                      <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{student.board || "N/A"}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <div className="text-slate-400">Program</div>
                      <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{student.program || "N/A"}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {getFeeStatusBadge(student.feeStatus)}
                    {getStudentRemaining(student) > 0 && (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">
                        Remaining {formatMoney(getStudentRemaining(student))}
                      </span>
                    )}
                    {student.isManuallyBlocked && (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-200">
                        <ShieldBan className="mr-1 h-3 w-3" /> Admit Blocked
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Link href={`/admin/students/${student._id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-white">
                      View
                    </Link>
                    <Link href={`/admin/students/${student._id}#documents`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-100">
                      Documents
                    </Link>
                    <Link href={`/admin/students/${student._id}#fees`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-100">
                      Fees
                    </Link>
                    <button onClick={() => { setUploadModalStudentId(student._id); setUploadModalStudentName(student.studentName); }} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary dark:bg-accent/10 dark:text-accent">
                      <UploadCloud className="mr-1 h-3.5 w-3.5" /> Upload
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
                    className="rounded border-slate-300 text-primary focus:ring-primary dark:border-white/30 dark:bg-white/10"
                    checked={students.length > 0 && selectedIds.length === students.length}
                    onChange={(event) => handleSelectAll(event.target.checked)}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">CNIC / B-Form</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Board / Program</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Payable</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Paid</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Remaining</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Fee Status</th>
                <th className="admin-table-sticky-header z-10 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <StudentTableSkeletonRows />
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 dark:text-slate-300">No students found matching the criteria.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className={`admin-table-row ${selectedIds.includes(student._id) ? "admin-table-row-selected" : ""}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary dark:border-white/30 dark:bg-white/10"
                        checked={selectedIds.includes(student._id)}
                        onChange={() => handleSelectOne(student._id)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
                          <GraduationCap className="h-5 w-5 text-primary dark:text-accent" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{student.studentName}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">{formatFatherRelation(student.fatherName, student.gender)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{maskCnic(student.cnicOrBform)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">DOB: {student.dob}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{student.board || "N/A"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">{student.program || "N/A"}{student.group ? ` / ${student.group}` : ""}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-200">{formatMoney(student.finalPayableFee)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-300">{formatMoney(student.totalPaid)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-red-500 dark:text-red-300">{formatMoney(getStudentRemaining(student))}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1.5">
                        {getFeeStatusBadge(student.feeStatus)}
                        {student.isManuallyBlocked && (
                          <span className="inline-flex items-center text-[10px] font-bold uppercase text-red-600 dark:text-red-300">
                            <ShieldBan className="mr-1 h-3 w-3" /> Admit Card Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="admin-table-sticky-action px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setUploadModalStudentId(student._id); setUploadModalStudentName(student.studentName); }} className="admin-icon-action rounded-lg p-2 text-primary dark:text-accent hover:bg-primary/10 dark:hover:bg-accent/10" title="Quick Upload Document">
                          <UploadCloud className="h-4 w-4" />
                        </button>
                        <Link href={`/admin/students/${student._id}`} className="admin-icon-action rounded-lg p-2" title="Manage Student">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(student._id)} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300" title="Delete Student">
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

      {importRows.some((row) => row.errors.length > 0) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Do not import until every row is valid. Rows with duplicate CNIC/B-Form values or invalid fees are rejected.
        </div>
      )}

      {uploadModalStudentId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-[#0C2A33] border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload Document for {uploadModalStudentName}
              </h2>
              <button 
                onClick={() => { setUploadModalStudentId(null); setUploadModalStudentName(""); }}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <DocumentUploadForm 
                studentId={uploadModalStudentId} 
                onUploadSuccess={() => {
                  setUploadModalStudentId(null);
                  setUploadModalStudentName("");
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
