"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NoticeCardSkeleton, SkeletonBlock, SkeletonLine } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

function NoticeTableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="admin-table-row" aria-hidden="true">
          <td className="px-6 py-4">
            <div className="flex items-center">
              <SkeletonBlock className="mr-4 h-10 w-10 rounded" />
              <div className="space-y-2">
                <SkeletonLine className="w-56" />
                <SkeletonLine className="w-24" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="space-y-2">
              <SkeletonLine className="w-20" />
              <SkeletonBlock className="h-6 w-24 rounded" />
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="space-y-2">
              <SkeletonLine className="w-20" />
              <SkeletonLine className="w-24" />
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <SkeletonBlock className="h-7 w-24 rounded-full" />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="flex justify-end gap-2">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notices");
      if (res.ok) {
        const data = await res.json();
        setNotices(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Notice deleted successfully");
        setNotices(notices.filter(n => n._id !== id));
      } else {
        toast.error("Failed to delete notice");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleStatus = async (notice: any) => {
    const newStatus = notice.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/notices/${notice._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Notice ${newStatus === "published" ? "published" : "moved to draft"}`);
        setNotices(notices.map(n => n._id === notice._id ? { ...n, status: newStatus } : n));
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertCircle className="w-4 h-4 text-red-500 mr-1" />;
      case "important": return <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />;
      default: return <Info className="w-4 h-4 text-blue-500 mr-1" />;
    }
  };

  return (
    <div className="content-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Notices & Announcements</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Manage portal alerts, admission news, and student updates.</p>
        </div>
        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link href="/admin/notices/add">
            <Plus className="w-4 h-4 mr-2" />
            Add New Notice
          </Link>
        </Button>
      </div>

      <div className="admin-card flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="admin-table-header border-b border-slate-200 p-4 dark:border-white/10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notices by title or category..."
              className="admin-input min-h-10 w-full rounded-lg py-2 pr-4 pl-9 text-sm transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {loading ? (
            <div aria-busy="true" aria-label="Loading notices" className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <NoticeCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-300">No notices found.</div>
          ) : (
            filteredNotices.map((notice) => (
              <div key={notice._id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <div className="flex gap-3">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-[#092128]">
                    {notice.imageUrl ? (
                      <Image src={notice.imageUrl} alt={notice.title} fill sizes="64px" className="object-contain p-1" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">{notice.title}</h3>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                      {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-800 dark:bg-white/10 dark:text-slate-100">
                        {notice.category.replace("_", " ")}
                      </span>
                      <button
                        onClick={() => toggleStatus(notice)}
                        className={cn(
                          "inline-flex min-h-7 items-center rounded-full border px-2 text-xs font-medium transition-colors",
                          notice.status === "published"
                            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/25 dark:bg-green-500/15 dark:text-green-200"
                            : "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                        )}
                      >
                        {notice.status === "published" ? "Published" : "Draft"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {notice.pinToTop && <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-200">Pinned</span>}
                  {notice.showInTicker && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">Ticker</span>}
                  {notice.showOnHomepage && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">Homepage</span>}
                  {!notice.pinToTop && !notice.showInTicker && !notice.showOnHomepage && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">Notice Board Only</span>}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link href={`/admin/notices/${notice._id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-2 text-xs font-semibold text-white">
                    Edit
                  </Link>
                  {notice.slug ? (
                    <Link href={`/notices/${notice.slug}`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-100">
                      View
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-400 dark:border-white/10">View</span>
                  )}
                  <button
                    onClick={() => handleDelete(notice._id)}
                    disabled={isDeleting === notice._id}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 px-2 text-xs font-semibold text-red-600 disabled:opacity-50 dark:border-red-500/20 dark:text-red-200"
                  >
                    {isDeleting === notice._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                  </button>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Notice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority & Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <NoticeTableSkeletonRows />
              ) : filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-500 font-medium">No notices found.</p>
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice) => (
                  <tr key={notice._id} className="admin-table-row">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="relative mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/10">
                          {notice.imageUrl ? (
                            <Image
                              src={notice.imageUrl}
                              alt={notice.title}
                              fill
                              sizes="40px"
                              className="object-contain p-0.5"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">{notice.title}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(notice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs font-medium capitalize">
                          {getPriorityIcon(notice.priority)}
                          {notice.priority}
                        </div>
                        <span className="inline-flex w-fit items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-800 dark:bg-white/10 dark:text-slate-100">
                          {notice.category.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {notice.pinToTop && <span className="flex items-center text-xs text-slate-600 dark:text-slate-200"><CheckCircle2 className="w-3 h-3 text-green-500 mr-1"/> Pinned</span>}
                        {notice.showInTicker && <span className="flex items-center text-xs text-slate-600 dark:text-slate-200"><CheckCircle2 className="w-3 h-3 text-green-500 mr-1"/> Ticker</span>}
                        {notice.showOnHomepage && <span className="flex items-center text-xs text-slate-600 dark:text-slate-200"><CheckCircle2 className="w-3 h-3 text-green-500 mr-1"/> Homepage</span>}
                        {!notice.pinToTop && !notice.showInTicker && !notice.showOnHomepage && <span className="text-xs text-slate-400">Notice Board Only</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleStatus(notice)}
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                          notice.status === "published" 
                            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-500/25 dark:bg-green-500/15 dark:text-green-200 dark:hover:bg-green-500/25" 
                            : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                        )}
                      >
                        {notice.status === "published" ? (
                          <><Eye className="w-3 h-3 mr-1" /> Published</>
                        ) : (
                          <><EyeOff className="w-3 h-3 mr-1" /> Draft</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          href={`/admin/notices/${notice._id}`}
                          className="admin-icon-action rounded-lg p-2"
                          title="Edit Notice"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          disabled={isDeleting === notice._id}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          title="Delete Notice"
                        >
                          {isDeleting === notice._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
