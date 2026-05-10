"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  User,
  UserPlus,
  Lock,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  Trash2,
  Power
} from "lucide-react";
import { SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";

// Schemas
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

const createAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type CreateAdminFormValues = z.infer<typeof createAdminSchema>;

const TABS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "create", label: "Add New Admin", icon: UserPlus },
  { id: "list", label: "All Admins", icon: Users },
];

function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading profile" className="content-fade-in mx-auto max-w-6xl space-y-5 pb-10 sm:space-y-6">
      <div className="space-y-2">
        <SkeletonLine className="h-7 w-56" />
        <SkeletonLine className="w-72 max-w-full" />
      </div>
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="w-full md:w-64">
          <div className="-mx-3 flex gap-2 overflow-hidden px-3 pb-2 md:mx-0 md:flex-col md:px-0 md:pb-0">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 min-w-36 rounded-full md:w-full md:rounded-lg" />
            ))}
          </div>
        </div>
        <SkeletonCard className="flex-1 overflow-hidden p-0">
          <div className="space-y-6 p-4 sm:p-6">
            <SkeletonLine className="h-6 w-44" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <SkeletonLine className="w-28" />
                <SkeletonBlock className="h-10 rounded-md" />
              </div>
              <div className="space-y-2">
                <SkeletonLine className="w-28" />
                <SkeletonBlock className="h-10 rounded-md" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <SkeletonLine className="h-6 w-44" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                  <SkeletonLine className="w-28" />
                  <SkeletonBlock className="h-10 rounded-md" />
                </div>
                 <div className="space-y-2">
                  <SkeletonLine className="w-28" />
                  <SkeletonBlock className="h-10 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const createAdminForm = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/admin/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          profileForm.reset({
            name: data.data.name,
            email: data.data.email,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setCurrentUserEmail(data.data.email);
        }
      } else {
        toast.error("Failed to load profile details");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading profile details");
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/profile/list");
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setAdmins(data.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    Promise.all([fetchProfile(), fetchAdmins()]).finally(() => {
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully!");
        profileForm.setValue("currentPassword", "");
        profileForm.setValue("newPassword", "");
        profileForm.setValue("confirmPassword", "");
        setCurrentUserEmail(data.email);
        fetchAdmins();
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const onCreateAdminSubmit = async (data: CreateAdminFormValues) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("New admin created successfully!");
        createAdminForm.reset();
        fetchAdmins();
      } else {
        toast.error(result.message || "Failed to create admin");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating new admin");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAdminStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/profile/list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        fetchAdmins();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin account? This cannot be undone.")) return;
    try {
      const response = await fetch(`/api/admin/profile/list?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Admin deleted successfully");
        fetchAdmins();
      } else {
        toast.error(result.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="content-fade-in mx-auto max-w-6xl space-y-5 pb-10 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">Manage your credentials or configure other administrative users.</p>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="scrollbar-hide -mx-3 flex gap-2 overflow-x-auto px-3 pb-2 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-medium transition-colors md:rounded-lg ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm dark:bg-accent dark:text-[#092128]"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#103743] dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${activeTab === tab.id ? "text-accent dark:text-[#092128]" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="admin-card overflow-hidden">
              <div className="p-4 sm:p-6 space-y-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2 dark:border-white/10">
                    <User className="h-5 w-5 text-primary dark:text-accent" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</label>
                      <input
                        type="text"
                        {...profileForm.register("name")}
                        className="admin-input rounded-md px-3 py-2 text-sm"
                        placeholder="John Doe"
                      />
                      {profileForm.formState.errors.name && (
                        <span className="text-xs text-red-500">{profileForm.formState.errors.name.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email Address</label>
                      <input
                        type="email"
                        {...profileForm.register("email")}
                        className="admin-input rounded-md px-3 py-2 text-sm"
                        placeholder="admin@example.com"
                      />
                      {profileForm.formState.errors.email && (
                        <span className="text-xs text-red-500">{profileForm.formState.errors.email.message}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2 dark:border-white/10">
                    <Lock className="h-5 w-5 text-primary dark:text-accent" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10 mb-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                      Leave password fields empty if you do not wish to change your password.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-1 md:col-span-2 max-w-md">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          {...profileForm.register("currentPassword")}
                          className="admin-input rounded-md px-3 py-2 pr-10 text-sm w-full"
                          placeholder="Enter current password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {profileForm.formState.errors.currentPassword && (
                        <span className="text-xs text-red-500">{profileForm.formState.errors.currentPassword.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          {...profileForm.register("newPassword")}
                          className="admin-input rounded-md px-3 py-2 pr-10 text-sm w-full"
                          placeholder="Minimum 6 characters"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {profileForm.formState.errors.newPassword && (
                        <span className="text-xs text-red-500">{profileForm.formState.errors.newPassword.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...profileForm.register("confirmPassword")}
                          className="admin-input rounded-md px-3 py-2 pr-10 text-sm w-full"
                          placeholder="Re-enter new password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {profileForm.formState.errors.confirmPassword && (
                        <span className="text-xs text-red-500">{profileForm.formState.errors.confirmPassword.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="admin-table-header flex justify-end border-t border-slate-200 px-4 py-4 dark:border-white/10 sm:px-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-[#0D3B46] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D3B46]/90 focus:outline-none focus:ring-2 focus:ring-[#0D3B46] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent dark:text-[#092128] dark:hover:bg-accent/90 sm:w-auto"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === "create" && (
            <form onSubmit={createAdminForm.handleSubmit(onCreateAdminSubmit)} className="admin-card overflow-hidden">
              <div className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center gap-2 border-b pb-2 dark:border-white/10">
                  <Shield className="h-5 w-5 text-primary dark:text-accent" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create New Admin Account</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</label>
                    <input
                      type="text"
                      {...createAdminForm.register("name")}
                      className="admin-input rounded-md px-3 py-2 text-sm"
                      placeholder="Jane Doe"
                    />
                    {createAdminForm.formState.errors.name && (
                      <span className="text-xs text-red-500">{createAdminForm.formState.errors.name.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email Address</label>
                    <input
                      type="email"
                      {...createAdminForm.register("email")}
                      className="admin-input rounded-md px-3 py-2 text-sm"
                      placeholder="jane.doe@example.com"
                    />
                    {createAdminForm.formState.errors.email && (
                      <span className="text-xs text-red-500">{createAdminForm.formState.errors.email.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
                    <div className="relative">
                      <input
                        type={showCreatePassword ? "text" : "password"}
                        {...createAdminForm.register("password")}
                        className="admin-input rounded-md px-3 py-2 pr-10 text-sm w-full"
                        placeholder="Minimum 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {createAdminForm.formState.errors.password && (
                      <span className="text-xs text-red-500">{createAdminForm.formState.errors.password.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showCreateConfirmPassword ? "text" : "password"}
                        {...createAdminForm.register("confirmPassword")}
                        className="admin-input rounded-md px-3 py-2 pr-10 text-sm w-full"
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showCreateConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {createAdminForm.formState.errors.confirmPassword && (
                      <span className="text-xs text-red-500">{createAdminForm.formState.errors.confirmPassword.message}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="admin-table-header flex justify-end border-t border-slate-200 px-4 py-4 dark:border-white/10 sm:px-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-[#0D3B46] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D3B46]/90 focus:outline-none focus:ring-2 focus:ring-[#0D3B46] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent dark:text-[#092128] dark:hover:bg-accent/90 sm:w-auto"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Create Admin
                </button>
              </div>
            </form>
          )}

          {activeTab === "list" && (
            <div className="admin-card overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary dark:text-accent" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Administrators</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Manage access for all admin accounts in the system.
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="admin-table-header text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 sm:px-6">Name</th>
                      <th className="px-4 py-3 sm:px-6">Email</th>
                      <th className="px-4 py-3 sm:px-6">Status</th>
                      <th className="px-4 py-3 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {admins.map((admin) => {
                      const isMasterAdmin = admin.isMasterAdmin === true;
                      const isCurrentUser = admin.email === currentUserEmail;
                      
                      return (
                        <tr key={admin._id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${!admin.isActive ? "opacity-60 bg-slate-50/50 dark:bg-white/[0.02]" : ""}`}>
                          <td className="px-4 py-3 sm:px-6 font-medium text-slate-900 dark:text-white">
                            {admin.name}
                            {isCurrentUser && <span className="ml-2 text-xs text-primary dark:text-accent">(You)</span>}
                          </td>
                          <td className="px-4 py-3 sm:px-6">{admin.email}</td>
                          <td className="px-4 py-3 sm:px-6">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              admin.isActive 
                                ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" 
                                : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                            }`}>
                              {admin.isActive ? "Active" : "Deactivated"}
                            </span>
                          </td>
                          <td className="px-4 py-3 sm:px-6">
                            <div className="flex justify-end gap-2">
                              {/* Cannot toggle master admin or yourself */}
                              {!isMasterAdmin && !isCurrentUser && (
                                <>
                                  <button
                                    onClick={() => toggleAdminStatus(admin._id, admin.isActive)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                                    title={admin.isActive ? "Deactivate User" : "Activate User"}
                                  >
                                    <Power className={`h-4 w-4 ${admin.isActive ? "text-amber-500" : "text-green-500"}`} />
                                  </button>
                                  <button
                                    onClick={() => deleteAdmin(admin._id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                    title="Delete User"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {isMasterAdmin && (
                                <div className="flex items-center">
                                  <span className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Protected
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {admins.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          No administrators found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
