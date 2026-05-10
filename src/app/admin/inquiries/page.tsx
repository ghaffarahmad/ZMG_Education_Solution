"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  MessageCircle,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

function InquiryCardSkeleton() {
  return (
    <SkeletonCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonLine className="h-5 w-40" />
          <SkeletonLine className="w-28" />
        </div>
        <SkeletonBlock className="h-7 w-24 rounded-full" />
      </div>
      <SkeletonBlock className="mt-3 h-10 rounded-lg" />
      <div className="mt-3 space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-4/5" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <SkeletonButton className="h-10" />
        <SkeletonButton className="h-10" />
        <SkeletonButton className="col-span-2 h-10" />
      </div>
    </SkeletonCard>
  );
}

function InquiryTableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="admin-table-row" aria-hidden="true">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="space-y-2">
              <SkeletonLine className="w-24" />
              <SkeletonLine className="w-20" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
          </td>
          <td className="px-6 py-4">
            <SkeletonLine className="w-36" />
            <SkeletonLine className="mt-2 w-28" />
            <SkeletonBlock className="mt-2 h-7 w-28 rounded-md" />
          </td>
          <td className="px-6 py-4 max-w-xs">
            <SkeletonBlock className="mb-2 h-6 w-36 rounded" />
            <SkeletonLine className="w-full" />
            <SkeletonLine className="mt-2 w-4/5" />
          </td>
          <td className="px-6 py-4 max-w-xs">
            <SkeletonLine className="w-44" />
            <SkeletonLine className="mt-2 w-28" />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="flex flex-col items-end gap-2">
              <SkeletonBlock className="h-8 w-32 rounded-md" />
              <SkeletonLine className="w-20" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchInquiries();
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    }
  };

  const saveAdminNote = async (id: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/inquiries`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminNote }),
      });

      if (res.ok) {
        toast.success("Admin note saved");
        fetchInquiries();
        setSelectedInquiry(null); // Close modal
      } else {
        toast.error("Failed to save note");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.includes(searchQuery) ||
      (inq.programInterest && inq.programInterest.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-500/15 dark:text-blue-200"><Clock className="w-3 h-3 mr-1" /> New</span>;
      case "contacted":
        return <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"><RefreshCw className="w-3 h-3 mr-1" /> Contacted</span>;
      case "closed":
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-500/15 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Closed</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-white/10 dark:text-slate-100">{status}</span>;
    }
  };

  return (
    <div className="content-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Inquiries</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Manage student queries and requests.</p>
        </div>
      </div>

      <div className="admin-card flex flex-col overflow-hidden">
        {/* Filters and Search */}
        <div className="admin-table-header flex flex-col items-center justify-between gap-4 border-b border-slate-200 p-4 dark:border-white/10 sm:flex-row">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, program..."
              className="admin-input min-h-10 w-full rounded-lg py-2 pr-4 pl-9 text-sm transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              className="admin-input min-h-10 w-full rounded-lg px-3 py-2 text-sm sm:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {loading ? (
            <div aria-busy="true" aria-label="Loading inquiries" className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <InquiryCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-300">No inquiries found.</div>
          ) : (
            filteredInquiries.map((inq) => (
              <div key={inq._id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">{inq.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{inq.phone}</p>
                  </div>
                  {getStatusBadge(inq.status)}
                </div>
                <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary dark:bg-accent/10 dark:text-accent">
                  {inq.board || "No Board"} - {inq.programInterest || "No Program"}
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{inq.message}</p>
                {inq.adminNote ? (
                  <p className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-slate-700 dark:text-slate-200">{inq.adminNote}</p>
                ) : null}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#25D366]/10 px-3 text-xs font-semibold text-[#14843d]"
                  >
                    <MessageCircle className="mr-2 h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <button
                    onClick={() => {
                      setSelectedInquiry(inq);
                      setAdminNote(inq.adminNote || "");
                    }}
                    className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-100"
                  >
                    Add / Edit Note
                  </button>
                  <select
                    className={cn(
                      "col-span-2 min-h-10 rounded-lg border px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary",
                      inq.status === "new" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200" :
                      inq.status === "contacted" ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200" :
                      "border-green-300 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-200"
                    )}
                    value={inq.status}
                    onChange={(e) => updateStatus(inq._id, e.target.value)}
                  >
                    <option value="new">Mark New</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="closed">Mark Closed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
            <thead className="admin-table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest / Message</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Note</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <InquiryTableSkeletonRows />
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-500 font-medium">No inquiries found.</p>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => (
                  <tr key={inq._id} className="admin-table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
                          {new Date(inq.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(inq.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        <div>{getStatusBadge(inq.status)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{inq.name}</div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">{inq.phone}</div>
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-xs font-medium text-[#25D366] hover:text-[#20bd5a] bg-[#25D366]/10 px-2 py-1 rounded-md"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Quick WhatsApp
                      </a>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-xs font-semibold text-primary bg-primary/10 inline-block px-2 py-0.5 rounded mb-2">
                        {inq.board || "No Board"} - {inq.programInterest || "No Program"}
                      </div>
                      <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{inq.message}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {inq.adminNote ? (
                        <p className="border-l-2 border-accent pl-3 text-sm italic text-slate-700 dark:text-slate-200">{inq.adminNote}</p>
                      ) : (
                        <span className="text-sm text-slate-400 italic">No note added</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col space-y-2 items-end">
                        <select
                          className={cn(
                            "text-xs font-semibold border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer",
                            inq.status === "new" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200" :
                            inq.status === "contacted" ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200" :
                            "border-green-300 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-200"
                          )}
                          value={inq.status}
                          onChange={(e) => updateStatus(inq._id, e.target.value)}
                        >
                          <option value="new">Mark New</option>
                          <option value="contacted">Mark Contacted</option>
                          <option value="closed">Mark Closed</option>
                        </select>
                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setAdminNote(inq.adminNote || "");
                          }}
                          className="text-xs text-primary hover:text-primary/80 font-semibold underline"
                        >
                          Add / Edit Note
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

      {/* Note Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="admin-card w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="admin-table-header flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Note</h3>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedInquiry.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{selectedInquiry.phone}</p>
              </div>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Type your private note here... (only visible to admins)"
                className="admin-input w-full resize-none rounded-lg px-4 py-3 transition-shadow"
                rows={4}
              />
            </div>
            <div className="admin-table-header flex flex-col gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/10 sm:flex-row sm:justify-end sm:space-x-3">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setSelectedInquiry(null)}>Cancel</Button>
              <Button 
                variant="primary" 
                className="w-full sm:w-auto"
                onClick={() => saveAdminNote(selectedInquiry._id)}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
