"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Download, Lock, AlertCircle, Clock, CheckCircle, Plus, UploadCloud, Bell, Globe2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" className="content-fade-in space-y-5 pb-10 sm:space-y-8">
      <div className="space-y-2">
        <SkeletonLine className="h-7 w-56" />
        <SkeletonLine className="w-72 max-w-full" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} className="flex items-center gap-3 p-3 sm:gap-5 sm:p-5 lg:p-6">
            <SkeletonBlock className="h-11 w-11 shrink-0 rounded-xl sm:h-16 sm:w-16" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="w-24" />
              <SkeletonLine className="h-8 w-16 sm:h-10" />
            </div>
          </SkeletonCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonButton key={index} className="h-10" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        {Array.from({ length: 2 }).map((_, panelIndex) => (
          <SkeletonCard key={panelIndex} className="p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <SkeletonLine className="h-6 w-40" />
              <SkeletonLine className="w-16" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg p-3">
                  <SkeletonBlock className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <SkeletonLine className="w-2/3" />
                    <SkeletonLine className="w-24" />
                  </div>
                  <SkeletonBlock className="h-7 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/stats");
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (error) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!stats) return <div className="p-8 text-red-500">Failed to load stats.</div>;

  const statCards = [
    { title: "Total Students", value: stats.totalStudents, icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
    { title: "Active Students", value: stats.activeStudents, icon: CheckCircle, color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" },
    { title: "Pending Fees", value: stats.pendingFees, icon: AlertCircle, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400" },
    { title: "Locked Admit Cards", value: stats.lockedAdmitCards, icon: Lock, color: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
    { title: "Total Documents", value: stats.totalDocuments, icon: FileText, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" },
    { title: "Total Downloads", value: stats.totalDownloads, icon: Download, color: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400" },
  ];

  return (
    <div className="content-fade-in space-y-5 pb-10 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to Z.M.G Education Admin Panel</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            className="group flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#0c2a33] sm:gap-5 sm:p-5 lg:rounded-2xl lg:p-6"
          >
            <div className={`shrink-0 rounded-xl p-2.5 sm:p-4 ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon className="h-5 w-5 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase leading-tight text-gray-500 dark:text-gray-300 sm:text-sm">{stat.title}</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/admin/students/new" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Link>
        <Link href="/admin/documents" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#0c2a33] dark:text-slate-100 dark:hover:bg-white/10">
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Docs
        </Link>
        <Link href="/admin/notices/add" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#0c2a33] dark:text-slate-100 dark:hover:bg-white/10">
          <Bell className="mr-2 h-4 w-4" /> Add Notice
        </Link>
        <Link href="/" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-accent/20 dark:text-accent">
          <Globe2 className="mr-2 h-4 w-4" /> Public Site
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c2a33] sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Students</h2>
            <Link href="/admin/students" className="text-sm text-[var(--primary)] dark:text-[var(--accent)] hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {stats.recentStudents.length === 0 ? <p className="text-gray-500">No students found.</p> : stats.recentStudents.map((student: any) => (
              <div key={student._id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full"><Users className="w-4 h-4 text-gray-500" /></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{student.studentName}</p>
                    <p className="text-xs text-gray-500">{student.program || 'N/A'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${student.feeStatus === 'clear' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {student.feeStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c2a33] sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Downloads</h2>
          </div>
          <div className="space-y-4">
            {stats.recentDownloads.length === 0 ? <p className="text-gray-500">No downloads yet.</p> : stats.recentDownloads.map((log: any) => (
              <div key={log._id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded-full"><Download className="w-4 h-4 text-teal-600 dark:text-teal-400" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {log.studentId?.studentName} downloaded {log.documentId?.title || 'a document'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
