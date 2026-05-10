"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CreditCard, FileText, Activity, ShieldAlert, Plus, Loader2, Trash2, UploadCloud, GraduationCap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";
import { BOARD_OPTIONS, GROUP_OPTIONS, PROGRAM_OPTIONS, formatFatherRelation } from "@/lib/studentRules";
import { formatRupees, getSafeRemainingBalance, normalizeMoney } from "@/lib/feeMath";

function StudentDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading student details" className="content-fade-in space-y-5 pb-12 sm:space-y-6">
      <SkeletonCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-lg" />
            <div className="min-w-0 space-y-2">
              <SkeletonLine className="h-7 w-56 max-w-full" />
              <SkeletonLine className="w-44" />
              <div className="flex flex-wrap gap-2 pt-1">
                <SkeletonBlock className="h-7 w-32 rounded-full" />
                <SkeletonBlock className="h-7 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <SkeletonButton className="h-11 w-full sm:ml-auto sm:w-44" />
        </div>
      </SkeletonCard>

      <div className="-mx-3 overflow-hidden px-3 pb-1">
        <div className="flex min-w-max gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-10 w-28 rounded-full" />
          ))}
        </div>
      </div>

      <SkeletonCard className="space-y-6 p-4 sm:p-6 sm:space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <SkeletonLine className="h-6 w-40" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((__, index) => (
                  <div key={index} className="space-y-2">
                    <SkeletonLine className="w-24" />
                    <SkeletonBlock className="h-10 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-white/10">
          <SkeletonButton className="h-11 w-full sm:w-36" />
        </div>
      </SkeletonCard>
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const isNew = studentId === "new";

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [student, setStudent] = useState<any>({
    studentName: "", fatherName: "", gender: "", cnicOrBform: "", dob: "", phone: "",
    board: "", program: "", group: "", session: "", admissionDate: "", nextDueDate: "", notes: "",
    totalProgramFee: 0, admissionFee: 0, monthlyFee: 0, discountAmount: 0, totalPaid: 0,
    feeStatus: "pending", status: "active",
    isManuallyBlocked: false, manualBlockReason: ""
  });

  const [payments, setPayments] = useState<any[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: "", paymentMethod: "cash", receiptNo: "", note: "" });
  const [academicOptions, setAcademicOptions] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteForm, setPromoteForm] = useState({ board: "", program: "", group: "", session: "", startDate: "", notes: "", markAsCompleted: false });
  const fetchAcademicOptions = async () => {
    try {
      const res = await fetch("/api/admin/academic-options?activeOnly=true");
      const json = await res.json();
      if (json.success) setAcademicOptions(json.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}`);
      const json = await res.json();
      if (json.success) {
        setStudent({
          ...json.data,
          admissionDate: json.data.admissionDate ? String(json.data.admissionDate).slice(0, 10) : "",
          nextDueDate: json.data.nextDueDate ? String(json.data.nextDueDate).slice(0, 10) : "",
        });
      } else {
        toast.error("Student not found");
        router.push("/admin/students");
      }
    } catch (error) {
      toast.error("Error loading student");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/admin/payments?studentId=${studentId}`);
      const json = await res.json();
      if (json.success) setPayments(json.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/enrollments`);
      const json = await res.json();
      if (json.success) setEnrollments(json.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAcademicOptions();
    if (!isNew) {
      fetchStudent();
      fetchPayments();
      fetchEnrollments();
    }
  }, [studentId]);

  useEffect(() => {
    const syncTabFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (["overview", "academics", "fees", "documents", "activity"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  const maskCnic = (cnic: string) => {
    if (!cnic || cnic.length < 13) return cnic;
    return `${cnic.substring(0, 5)}-*******-${cnic.substring(cnic.length - 1)}`;
  };
  const currentRemainingBalance = getSafeRemainingBalance({
    finalPayableFee: student.finalPayableFee,
    totalProgramFee: student.totalProgramFee,
    discountAmount: student.discountAmount,
    totalPaid: student.totalPaid,
    remainingBalance: student.remainingBalance,
  });
  const paymentAmount = normalizeMoney(newPayment.amount);
  const paymentAmountError =
    newPayment.amount && paymentAmount <= 0
      ? "Payment amount must be greater than 0."
      : newPayment.amount && paymentAmount > currentRemainingBalance
        ? `Payment cannot exceed remaining balance of ${formatRupees(currentRemainingBalance)}.`
        : "";
  const canSubmitPayment = Boolean(newPayment.amount) && currentRemainingBalance > 0 && !paymentAmountError && !saving;

  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew ? "/api/admin/students" : `/api/admin/students/${studentId}`;
      const method = isNew ? "POST" : "PATCH";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(isNew ? "Student created successfully" : "Student updated successfully");
        if (isNew) {
          router.push(`/admin/students/${json.data._id}`);
        } else {
          setStudent({
            ...json.data,
            admissionDate: json.data.admissionDate ? String(json.data.admissionDate).slice(0, 10) : "",
            nextDueDate: json.data.nextDueDate ? String(json.data.nextDueDate).slice(0, 10) : "",
          });
        }
      } else {
        toast.error(json.message || "Failed to save student");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRemainingBalance <= 0) {
      toast.error("This student has no remaining balance.");
      return;
    }
    if (paymentAmount <= 0) {
      toast.error("Payment amount must be greater than 0.");
      return;
    }
    if (paymentAmount > currentRemainingBalance) {
      toast.error(`Payment cannot exceed remaining balance of ${formatRupees(currentRemainingBalance)}.`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPayment, amount: Number(newPayment.amount), studentId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Payment added successfully");
        setShowPaymentForm(false);
        setNewPayment({ amount: "", paymentMethod: "cash", receiptNo: "", note: "" });
        fetchPayments();
        fetchStudent(); // Refresh student balances
      } else {
        toast.error(json.message || "Failed to add payment");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Delete this payment? This will update the student's balance.")) return;
    try {
      const res = await fetch(`/api/admin/payments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Payment deleted");
        fetchPayments();
        fetchStudent();
      }
    } catch (error) {
      toast.error("Error deleting payment");
    }
  };

  const toggleManualBlock = async () => {
    const isBlocked = !student.isManuallyBlocked;
    const reason = isBlocked ? prompt("Enter reason for blocking admit card:") : "";
    if (isBlocked && reason === null) return; // cancelled

    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isManuallyBlocked: isBlocked, manualBlockReason: reason }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(isBlocked ? "Student Blocked" : "Student Unblocked");
        setStudent({
          ...json.data,
          admissionDate: json.data.admissionDate ? String(json.data.admissionDate).slice(0, 10) : "",
          nextDueDate: json.data.nextDueDate ? String(json.data.nextDueDate).slice(0, 10) : "",
        });
      }
    } catch (error) {
      toast.error("Failed to update block status");
    }
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoteForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(promoteForm.markAsCompleted ? "Student completed" : "Student promoted successfully");
        setShowPromoteModal(false);
        fetchStudent();
        fetchEnrollments();
      } else {
        toast.error(json.message || "Action failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StudentDetailSkeleton />;

  return (
    <div className="content-fade-in space-y-5 pb-12 sm:space-y-6">
      <div className="admin-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-3">
            <Link href="/admin/students" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-[#103743] dark:hover:text-accent">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {isNew ? "Add New Student" : student.studentName}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {isNew ? "Enter student details below." : formatFatherRelation(student.fatherName, student.gender)}
              </p>
              {!isNew && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    {maskCnic(student.cnicOrBform)}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${student.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
                    {student.status}
                  </span>
                </div>
              )}
            </div>
          </div>
          {!isNew && (
            <div className="sm:ml-auto">
              <Button
                onClick={toggleManualBlock}
                variant="outline"
                className={`w-full whitespace-nowrap sm:w-auto ${student.isManuallyBlocked ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20" : "text-slate-600 dark:text-slate-100"}`}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                {student.isManuallyBlocked ? "Unblock Admit Card" : "Block Admit Card"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isNew && (
        <div className="-mx-3 overflow-x-auto px-3 pb-1">
          <div className="flex min-w-max gap-2">
          <button onClick={() => setActiveTab("overview")} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${activeTab === "overview" ? "bg-primary text-white dark:bg-accent dark:text-[#092128]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary dark:bg-[#0c2a33] dark:text-slate-300 dark:ring-white/10 dark:hover:text-accent"}`}>
            <User className="mr-2 h-4 w-4" /> Overview
          </button>
          <button onClick={() => setActiveTab("academics")} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${activeTab === "academics" ? "bg-primary text-white dark:bg-accent dark:text-[#092128]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary dark:bg-[#0c2a33] dark:text-slate-300 dark:ring-white/10 dark:hover:text-accent"}`}>
            <GraduationCap className="mr-2 h-4 w-4" /> Academics
          </button>
          <button onClick={() => setActiveTab("fees")} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${activeTab === "fees" ? "bg-primary text-white dark:bg-accent dark:text-[#092128]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary dark:bg-[#0c2a33] dark:text-slate-300 dark:ring-white/10 dark:hover:text-accent"}`}>
            <CreditCard className="mr-2 h-4 w-4" /> Fees
          </button>
          <button onClick={() => setActiveTab("documents")} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${activeTab === "documents" ? "bg-primary text-white dark:bg-accent dark:text-[#092128]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary dark:bg-[#0c2a33] dark:text-slate-300 dark:ring-white/10 dark:hover:text-accent"}`}>
            <FileText className="mr-2 h-4 w-4" /> Documents
          </button>
          <button onClick={() => setActiveTab("activity")} className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${activeTab === "activity" ? "bg-primary text-white dark:bg-accent dark:text-[#092128]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary dark:bg-[#0c2a33] dark:text-slate-300 dark:ring-white/10 dark:hover:text-accent"}`}>
            <Activity className="mr-2 h-4 w-4" /> Activity
          </button>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {(activeTab === "overview" || isNew) && (
        <form onSubmit={handleSaveOverview} className="admin-card space-y-6 p-4 sm:p-6 sm:space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-bold text-slate-900 dark:border-white/10 dark:text-white">Personal Info</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Student Name *</label>
                  <input required value={student.studentName} onChange={e=>setStudent({...student, studentName: e.target.value.replace(/[0-9]/g, '')})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Father Name *</label>
                  <input required value={student.fatherName} onChange={e=>setStudent({...student, fatherName: e.target.value.replace(/[0-9]/g, '')})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Gender *</label>
                  <select required value={student.gender || ""} onChange={e=>setStudent({...student, gender: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">CNIC / B-Form *</label>
                  <input required value={student.cnicOrBform} onChange={e=>setStudent({...student, cnicOrBform: e.target.value.replace(/\D/g, '').slice(0, 13)})} maxLength={13} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="4210112345671" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Date of Birth *</label>
                  <input type="date" required value={student.dob} onChange={e=>setStudent({...student, dob: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                  <input value={student.phone || ""} onChange={e=>setStudent({...student, phone: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Notes</label>
                  <textarea value={student.notes || ""} onChange={e=>setStudent({...student, notes: e.target.value})} className="admin-input min-h-20 w-full rounded-md px-3 py-2 text-sm" rows={3} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-bold text-slate-900 dark:border-white/10 dark:text-white">Academic Info</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Board</label>
                  <select value={student.board || ""} onChange={e=>setStudent({...student, board: e.target.value, program: "", group: ""})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm">
                    <option value="">Select Board</option>
                    {academicOptions.filter(o => o.type === "board").map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                    {student.board && !academicOptions.some(o => o.type === "board" && o.name === student.board) && <option value={student.board}>{student.board} (Legacy)</option>}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Program</label>
                  <select value={student.program || ""} onChange={e=>setStudent({...student, program: e.target.value, group: ""})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm">
                    <option value="">Select Program</option>
                    {academicOptions
                      .filter(o => o.type === "program" && (!o.boardId || (student.board && academicOptions.find(b => b.name === student.board)?._id === o.boardId)))
                      .map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                    {student.program && !academicOptions.some(o => o.type === "program" && o.name === student.program) && <option value={student.program}>{student.program} (Legacy)</option>}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Group</label>
                  <select value={student.group || ""} onChange={e=>setStudent({...student, group: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm">
                    <option value="">Select Group</option>
                    {academicOptions
                      .filter(o => {
                        if (o.type !== "group") return false;
                        const boardMatch = !o.boardId || (student.board && academicOptions.find(b => b.name === student.board)?._id === o.boardId);
                        const programMatch = !o.programId || (student.program && academicOptions.find(p => p.name === student.program)?._id === o.programId);
                        return boardMatch && programMatch;
                      })
                      .map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                    {student.group && !academicOptions.some(o => o.type === "group" && o.name === student.group) && <option value={student.group}>{student.group} (Legacy)</option>}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Session</label>
                  <input value={student.session || ""} onChange={e=>setStudent({...student, session: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="2023-2024" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Admission Date</label>
                  <input type="date" value={student.admissionDate || ""} onChange={e=>setStudent({...student, admissionDate: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Account Status</label>
                  <select value={student.status} onChange={e=>setStudent({...student, status: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            
            {isNew && (
              <div className="space-y-4 md:col-span-2">
                <h3 className="border-b pb-2 text-lg font-bold text-slate-900 dark:border-white/10 dark:text-white">Initial Fee Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Total Program Fee (Rs)</label>
                    <input type="number" required min="0" value={student.totalProgramFee === 0 ? "" : student.totalProgramFee} onChange={e=>setStudent({...student, totalProgramFee: e.target.value === "" ? 0 : Number(e.target.value)})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="e.g. 50000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Initial Amount Paid (Rs)</label>
                    <input type="number" required min="0" value={student.totalPaid === 0 ? "" : student.totalPaid} onChange={e=>setStudent({...student, totalPaid: e.target.value === "" ? 0 : Number(e.target.value)})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="e.g. 10000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Discount Amount (Rs)</label>
                    <input type="number" required min="0" value={student.discountAmount === 0 ? "" : student.discountAmount} onChange={e=>setStudent({...student, discountAmount: e.target.value === "" ? 0 : Number(e.target.value)})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="e.g. 0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Next Due Date</label>
                    <input type="date" value={student.nextDueDate || ""} onChange={e=>setStudent({...student, nextDueDate: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                  Note: The remaining balance and fee status will be automatically calculated. You can record detailed payments in the Fees tab later.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-white/10">
            <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isNew ? "Create Student" : "Save Changes"}
            </Button>
          </div>
        </form>
      )}

      {/* ACADEMICS TAB */}
      {activeTab === "academics" && !isNew && (
        <div id="academics" className="space-y-6">
          <div className="admin-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Academic History & Promotions</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Manage the student's enrollments and promote them to the next class or session.
              </p>
            </div>
            <Button onClick={() => setShowPromoteModal(true)} disabled={enrollments.some(e => e.academicStatus === "active") === false && enrollments.length > 0}>
              <GraduationCap className="w-4 h-4 mr-2" /> Promote / Complete
            </Button>
          </div>

          {showPromoteModal && (
            <form onSubmit={handlePromote} className="admin-card p-5 sm:p-6 space-y-4 border-l-4 border-primary bg-primary/5 dark:bg-[#092128]">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Update Academic Status</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="markAsCompleted" checked={promoteForm.markAsCompleted} onChange={e=>setPromoteForm({...promoteForm, markAsCompleted: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                <label htmlFor="markAsCompleted" className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Mark current program as Completed (Student is graduating/leaving)
                </label>
              </div>

              {!promoteForm.markAsCompleted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Promote to Board</label>
                    <select required value={promoteForm.board} onChange={e=>setPromoteForm({...promoteForm, board: e.target.value, program: "", group: ""})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm">
                      <option value="">Select Board</option>
                      {academicOptions.filter(o => o.type === "board").map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Promote to Program</label>
                    <select required value={promoteForm.program} onChange={e=>setPromoteForm({...promoteForm, program: e.target.value, group: ""})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm">
                      <option value="">Select Program</option>
                      {academicOptions.filter(o => o.type === "program" && (!o.boardId || (promoteForm.board && academicOptions.find(b => b.name === promoteForm.board)?._id === o.boardId))).map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Promote to Group</label>
                    <select value={promoteForm.group} onChange={e=>setPromoteForm({...promoteForm, group: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm">
                      <option value="">Select Group</option>
                      {academicOptions.filter(o => {
                        if (o.type !== "group") return false;
                        const boardMatch = !o.boardId || (promoteForm.board && academicOptions.find(b => b.name === promoteForm.board)?._id === o.boardId);
                        const programMatch = !o.programId || (promoteForm.program && academicOptions.find(p => p.name === promoteForm.program)?._id === o.programId);
                        return boardMatch && programMatch;
                      }).map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">New Session</label>
                    <input required value={promoteForm.session} onChange={e=>setPromoteForm({...promoteForm, session: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="e.g. 2024-2025" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Promotion Date</label>
                    <input type="date" value={promoteForm.startDate} onChange={e=>setPromoteForm({...promoteForm, startDate: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Notes</label>
                    <input value={promoteForm.notes} onChange={e=>setPromoteForm({...promoteForm, notes: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="Optional notes about promotion..." />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowPromoteModal(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {promoteForm.markAsCompleted ? "Complete Program" : "Confirm Promotion"}
                </Button>
              </div>
            </form>
          )}

          <div className="admin-card overflow-hidden">
            {enrollments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>No enrollment history found.</p>
                <p className="text-sm mt-1">Enrollments are automatically tracked when new students are created or promoted.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/10">
                {enrollments.map((enr, i) => (
                  <div key={enr._id} className={`p-5 sm:p-6 ${enr.academicStatus === 'active' ? 'bg-primary/5 dark:bg-[#103743]/50' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                            {enr.program} {enr.group ? `(${enr.group})` : ''}
                          </h4>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                            enr.academicStatus === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                            enr.academicStatus === 'promoted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                            enr.academicStatus === 'completed' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {enr.academicStatus === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {enr.academicStatus}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
                          <div><span className="text-slate-500 font-medium">Board:</span> <span className="text-slate-800 dark:text-slate-200">{enr.board || '-'}</span></div>
                          <div><span className="text-slate-500 font-medium">Session:</span> <span className="text-slate-800 dark:text-slate-200">{enr.session || '-'}</span></div>
                          <div><span className="text-slate-500 font-medium">Started:</span> <span className="text-slate-800 dark:text-slate-200">{enr.startDate ? new Date(enr.startDate).toLocaleDateString('en-GB') : '-'}</span></div>
                          <div><span className="text-slate-500 font-medium">Ended:</span> <span className="text-slate-800 dark:text-slate-200">{enr.endDate ? new Date(enr.endDate).toLocaleDateString('en-GB') : 'Present'}</span></div>
                        </div>
                        {enr.notes && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 italic">"{enr.notes}"</p>}
                      </div>
                      
                      <div className="flex-shrink-0 text-sm font-mono text-slate-400">
                        {i === 0 ? "Latest Record" : "Previous Record"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEES & PAYMENTS TAB */}
      {activeTab === "fees" && !isNew && (
        <div id="fees" className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div className="admin-card p-3 sm:p-4">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Fee</div>
              <div className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">Rs {student.totalProgramFee?.toLocaleString() || 0}</div>
            </div>
            <div className="admin-card p-3 sm:p-4">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Discount</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-300 sm:text-2xl">Rs {student.discountAmount?.toLocaleString() || 0}</div>
            </div>
            <div className="admin-card p-3 sm:p-4">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Paid</div>
              <div className="text-xl font-black text-green-600 dark:text-green-300 sm:text-2xl">Rs {student.totalPaid?.toLocaleString() || 0}</div>
            </div>
            <div className="admin-card border-l-4 border-l-red-500 p-3 sm:p-4">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Remaining</div>
              <div className="text-xl font-black text-red-600 dark:text-red-300 sm:text-2xl">{formatRupees(currentRemainingBalance)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <form onSubmit={handleSaveOverview} className="admin-card space-y-4 p-4 sm:p-6">
                <h3 className="border-b pb-2 text-lg font-bold text-slate-900 dark:border-white/10 dark:text-white">Fee Configuration</h3>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Total Program Fee</label>
                  <input type="number" value={student.totalProgramFee === 0 ? "" : student.totalProgramFee} onChange={e=>setStudent({...student, totalProgramFee: e.target.value === "" ? 0 : Number(e.target.value)})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Discount Amount</label>
                  <input type="number" value={student.discountAmount === 0 ? "" : student.discountAmount} onChange={e=>setStudent({...student, discountAmount: e.target.value === "" ? 0 : Number(e.target.value)})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Next Due Date</label>
                  <input type="date" value={student.nextDueDate || ""} onChange={e=>setStudent({...student, nextDueDate: e.target.value})} className="admin-input min-h-10 w-full rounded-md px-3 py-2 text-sm" />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>Save Config</Button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="admin-card overflow-hidden">
                <div className="admin-table-header flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment History</h3>
                    {currentRemainingBalance <= 0 && (
                      <p className="mt-1 text-sm font-semibold text-green-600 dark:text-green-300">Fee already clear.</p>
                    )}
                  </div>
                  <Button onClick={() => setShowPaymentForm(!showPaymentForm)} variant={showPaymentForm ? "outline" : "primary"} size="sm" className="min-h-10" disabled={!showPaymentForm && currentRemainingBalance <= 0}>
                    {showPaymentForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Payment</>}
                  </Button>
                </div>
                
                {showPaymentForm && (
                  <form onSubmit={handleAddPayment} className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-primary/5 p-4 dark:border-white/10 dark:bg-[#103743] sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Amount (Rs) *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        max={currentRemainingBalance}
                        value={newPayment.amount}
                        onChange={e=>setNewPayment({...newPayment, amount: e.target.value})}
                        className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm"
                        aria-invalid={Boolean(paymentAmountError)}
                      />
                      {paymentAmountError && (
                        <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-300">{paymentAmountError}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Method *</label>
                      <select required value={newPayment.paymentMethod} onChange={e=>setNewPayment({...newPayment, paymentMethod: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm">
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="easypaisa">Easypaisa</option>
                        <option value="jazzcash">JazzCash</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Note / Receipt No</label>
                      <input value={newPayment.note} onChange={e=>setNewPayment({...newPayment, note: e.target.value})} className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="Optional notes..." />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <Button type="submit" className="w-full sm:w-auto" disabled={!canSubmitPayment}>Record Payment</Button>
                    </div>
                  </form>
                )}

                <div className="space-y-3 p-4 md:hidden">
                  {payments.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">No payments recorded yet.</div>
                  ) : (
                    payments.map(payment => (
                      <div key={payment._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-green-600 dark:text-green-300">Rs {payment.amount.toLocaleString()}</div>
                            <div className="mt-1 text-xs uppercase text-slate-500 dark:text-slate-300">{payment.paymentMethod.replace('_', ' ')}</div>
                          </div>
                          <button onClick={() => handleDeletePayment(payment._id)} className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" aria-label="Delete payment">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-300">{new Date(payment.paymentDate).toLocaleDateString('en-GB')}</div>
                        {payment.note && <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{payment.note}</div>}
                      </div>
                    ))
                  )}
                </div>

                <table className="hidden min-w-full divide-y divide-slate-200 md:table">
                  <thead className="admin-table-header">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Note</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {payments.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">No payments recorded yet.</td></tr>
                    ) : (
                      payments.map(payment => (
                        <tr key={payment._id} className="admin-table-row">
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">{new Date(payment.paymentDate).toLocaleDateString('en-GB')}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-300">Rs {payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 uppercase dark:text-slate-300">{payment.paymentMethod.replace('_', ' ')}</td>
                          <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-300">{payment.note || "-"}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                            <button onClick={() => handleDeletePayment(payment._id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === "documents" && !isNew && (
        <div id="documents" className="space-y-5 sm:space-y-6">
          <div className="admin-card overflow-hidden">
            <div className="admin-table-header flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Documents</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-3 lg:gap-8">
              {/* Upload Form */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#092128] sm:p-6">
                <h4 className="font-bold text-slate-900 mb-4 dark:text-white">Upload New Document</h4>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const fileInput = form.file as HTMLInputElement;
                    if (!fileInput.files?.[0]) return toast.error("Select a file");
                    
                    setSaving(true);
                    const formData = new FormData(form);
                    formData.append("studentId", studentId);
                    
                    try {
                      const res = await fetch("/api/admin/documents", { method: "POST", body: formData });
                      if (res.ok) {
                        toast.success("Document uploaded successfully");
                        form.reset();
                        // Refetch documents (need to add a fetch call, but we can just reload for simplicity since it's an admin dashboard)
                        window.location.reload();
                      } else {
                        toast.error("Failed to upload document");
                      }
                    } catch (err) {
                      toast.error("Upload error");
                    } finally {
                      setSaving(false);
                    }
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Document Title *</label>
                    <input name="title" required className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm" placeholder="e.g. 2024 Final Admit Card" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Type *</label>
                    <select name="type" required className="admin-input mt-1 min-h-10 w-full rounded-md px-3 py-2 text-sm">
                      <option value="admit_card">Admit Card</option>
                      <option value="enrollment_card">Enrollment Card</option>
                      <option value="marksheet">Marksheet</option>
                      <option value="fee_voucher">Fee Voucher</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">PDF File *</label>
                    <input name="file" type="file" accept="application/pdf" required className="mt-1 w-full text-sm file:mr-4 file:min-h-10 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 dark:file:bg-accent/10 dark:file:text-accent dark:hover:file:bg-accent/20" />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="hidden" name="isPublished" value="false" />
                      <input type="checkbox" name="isPublished" value="true" defaultChecked className="rounded text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Publish Immediately</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="hidden" name="requiresFeeClearance" value="false" />
                      <input type="checkbox" name="requiresFeeClearance" value="true" className="rounded text-primary focus:ring-primary" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Requires Fee Clearance</span>
                    </label>
                    <input type="hidden" name="downloadAllowed" value="true" />
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                    Upload to Secure Storage
                  </Button>
                </form>
              </div>

              {/* List Placeholder */}
              <div className="lg:col-span-2">
                <div className="admin-card flex h-full flex-col items-center justify-center p-6 text-center sm:p-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">Secure Document Vault</h4>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 dark:text-slate-300">
                    Uploaded documents are securely stored in protected cloud storage. To view or manage uploaded documents, go to the centralized Document Center.
                  </p>
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={`/admin/documents?search=${student.cnicOrBform}`}>
                      Manage Student Documents
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === "activity" && (
        <div id="activity" className="admin-card p-4 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 dark:text-white">Audit Log & Activity</h3>
          <p className="text-slate-500 text-sm mb-6 dark:text-slate-300">Track when this student logs into the portal and downloads documents.</p>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-8 text-center text-slate-400 dark:border-white/10 dark:bg-[#092128] dark:text-slate-300">
            Activity logs will appear here once the Student Portal tracking is active.
          </div>
        </div>
      )}
    </div>
  );
}
