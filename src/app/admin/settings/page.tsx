"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Phone,
  MapPin,
  Share2,
  MessageSquare,
  Search,
  ShieldAlert,
  Save,
  Loader2,
  BarChart3,
} from "lucide-react";
import { SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";
import { DEFAULT_ABOUT_STATS, normalizeAboutStats } from "@/lib/aboutStats";

const settingsSchema = z.object({
  websiteName: z.string().min(1, "Website name is required"),
  shortWebsiteDescription: z.string().optional(),
  footerDescription: z.string().optional(),
  logoText: z.string().optional(),
  logoImageUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  aboutStats: z.array(z.object({
    value: z.coerce.number().min(0, "Value must be zero or greater"),
    suffix: z.string().max(16, "Suffix must be 16 characters or fewer").optional(),
    label: z.string().min(1, "Label is required").max(60, "Label must be 60 characters or fewer"),
  })).length(4, "Exactly four About stats are required"),
  phoneNumber: z.string().optional(),
  alternatePhoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  emailAddress: z.string().optional(),
  officeAddress: z.string().optional(),
  officeTiming: z.string().optional(),
  contactPersonName: z.string().optional(),
  googleMapEmbedUrl: z.string().optional(),
  googleMapShareLink: z.string().optional(),
  mapLatitude: z.string().optional(),
  mapLongitude: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portalWelcomeMessage: z.string().optional(),
  studentPortalNotice: z.string().optional(),
  admitCardLockedMessage: z.string().optional(),
  documentNotAvailableMessage: z.string().optional(),
  feeClearanceMessage: z.string().optional(),
  studentInactiveMessage: z.string().optional(),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type SettingsFormInput = z.input<typeof settingsSchema>;
type SettingsFieldName = Exclude<keyof SettingsFormInput, "aboutStats">;

const TABS = [
  { id: "general", label: "General", icon: LayoutDashboard },
  { id: "aboutStats", label: "About Page Stats", icon: BarChart3 },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "location", label: "Location & Map", icon: MapPin },
  { id: "social", label: "Social Links", icon: Share2 },
  { id: "portal", label: "Portal Messages", icon: MessageSquare },
  { id: "seo", label: "SEO", icon: Search },
  { id: "maintenance", label: "Maintenance", icon: ShieldAlert },
];

function SettingsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading settings" className="content-fade-in mx-auto max-w-6xl space-y-5 pb-10 sm:space-y-6">
      <div className="space-y-2">
        <SkeletonLine className="h-7 w-56" />
        <SkeletonLine className="w-72 max-w-full" />
      </div>
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="w-full md:w-64">
          <div className="-mx-3 flex gap-2 overflow-hidden px-3 pb-2 md:mx-0 md:flex-col md:px-0 md:pb-0">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 min-w-36 rounded-full md:w-full md:rounded-lg" />
            ))}
          </div>
        </div>
        <SkeletonCard className="flex-1 overflow-hidden p-0">
          <div className="space-y-6 p-4 sm:p-6">
            <SkeletonLine className="h-6 w-44" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonLine className="w-28" />
                  <SkeletonBlock className="h-10 rounded-md" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <SkeletonLine className="w-36" />
              <SkeletonBlock className="h-24 rounded-md" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SkeletonBlock className="h-10 rounded-md" />
              <SkeletonBlock className="h-10 rounded-md" />
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-200 px-4 py-4 dark:border-white/10 sm:px-6">
            <SkeletonButton className="h-10 w-full sm:w-36" />
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormInput, undefined, SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      websiteName: "Z.M.G Education Solution",
      shortWebsiteDescription: "",
      footerDescription: "",
      logoText: "ZMG",
      logoImageUrl: "",
      faviconUrl: "",
      primaryColor: "#0D3B46",
      accentColor: "#D4AF37",
      aboutStats: DEFAULT_ABOUT_STATS.map((stat) => ({ ...stat })),
      phoneNumber: "",
      alternatePhoneNumber: "",
      whatsappNumber: "",
      emailAddress: "",
      officeAddress: "",
      officeTiming: "",
      contactPersonName: "",
      googleMapEmbedUrl: "",
      googleMapShareLink: "",
      mapLatitude: "",
      mapLongitude: "",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      youtubeUrl: "",
      linkedinUrl: "",
      portalWelcomeMessage: "",
      studentPortalNotice: "",
      admitCardLockedMessage: "",
      documentNotAvailableMessage: "",
      feeClearanceMessage: "",
      studentInactiveMessage: "",
      maintenanceMode: false,
      maintenanceMessage: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            // Reset form with fetched data
            form.reset({
              ...data.data,
              aboutStats: normalizeAboutStats(data.data.aboutStats),
            });
          }
        } else {
          toast.error("Failed to load settings");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while loading settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.data) {
          form.reset({
            ...result.data,
            aboutStats: normalizeAboutStats(result.data.aboutStats),
          });
        }
        toast.success("Settings saved successfully!");
      } else {
        toast.error(result.message || "Failed to save settings");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const renderInputField = (
    name: SettingsFieldName,
    label: string,
    type: string = "text",
    placeholder?: string
  ) => {
    const { register, formState: { errors } } = form;
    return (
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
        {type === "textarea" ? (
          <textarea
            {...register(name)}
            className="admin-input min-h-20 rounded-md px-3 py-2 text-sm sm:min-h-[100px]"
            placeholder={placeholder}
          />
        ) : type === "checkbox" ? (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register(name)}
              className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary dark:border-white/30 dark:bg-white/10"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">Enable</span>
          </div>
        ) : (
          <input
            type={type}
            {...register(name)}
            className="admin-input rounded-md px-3 py-2 text-sm"
            placeholder={placeholder}
          />
        )}
        {errors[name] && (
          <span className="text-xs text-red-500">{errors[name]?.message as string}</span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="content-fade-in mx-auto max-w-6xl space-y-5 pb-10 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">Manage all your dynamic website settings here.</p>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="admin-card overflow-hidden">
            <div className="p-4 sm:p-6">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 dark:border-white/10 dark:text-white">General Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("websiteName", "Website Name")}
                    {renderInputField("logoText", "Logo Text")}
                    {renderInputField("primaryColor", "Primary Color", "color")}
                    {renderInputField("accentColor", "Accent Color", "color")}
                  </div>
                  {renderInputField("shortWebsiteDescription", "Short Description", "textarea", "Appears in various places on the site")}
                  {renderInputField("footerDescription", "Footer Description", "textarea", "Appears in the footer")}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("logoImageUrl", "Logo Image URL", "url")}
                    {renderInputField("faviconUrl", "Favicon URL", "url")}
                  </div>
                </div>
              )}

              {activeTab === "aboutStats" && (
                <div className="space-y-6">
                  <h2 className="border-b pb-2 text-lg font-semibold text-slate-900 dark:text-white">About Page Stats</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    These four stats appear in the premium stats card on the public About page.
                  </p>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {DEFAULT_ABOUT_STATS.map((defaultStat, index) => {
                      const errors = form.formState.errors.aboutStats?.[index];

                      return (
                        <div key={defaultStat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            Stat {index + 1}
                          </h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                            <div className="flex flex-col space-y-1">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Label</label>
                              <input
                                type="text"
                                {...form.register(`aboutStats.${index}.label`)}
                                className="admin-input rounded-md px-3 py-2 text-sm"
                                placeholder={defaultStat.label}
                              />
                              {errors?.label && <span className="text-xs text-red-500">{errors.label.message}</span>}
                            </div>
                            <div className="flex flex-col space-y-1">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Suffix</label>
                              <input
                                type="text"
                                {...form.register(`aboutStats.${index}.suffix`)}
                                className="admin-input rounded-md px-3 py-2 text-sm"
                                placeholder={defaultStat.suffix || "None"}
                              />
                              {errors?.suffix && <span className="text-xs text-red-500">{errors.suffix.message}</span>}
                            </div>
                          </div>
                          <div className="mt-4 flex flex-col space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Value</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              {...form.register(`aboutStats.${index}.value`, { valueAsNumber: true })}
                              className="admin-input rounded-md px-3 py-2 text-sm"
                              placeholder={String(defaultStat.value)}
                            />
                            {errors?.value && <span className="text-xs text-red-500">{errors.value.message}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 dark:border-white/10 dark:text-white">Contact Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("phoneNumber", "Phone Number")}
                    {renderInputField("alternatePhoneNumber", "Alternate Phone Number")}
                    {renderInputField("whatsappNumber", "WhatsApp Number", "text", "e.g., +923143061669")}
                    {renderInputField("emailAddress", "Email Address", "email")}
                    {renderInputField("contactPersonName", "Contact Person Name")}
                  </div>
                  {renderInputField("officeAddress", "Office Address", "textarea")}
                  {renderInputField("officeTiming", "Office Timings")}
                </div>
              )}

              {activeTab === "location" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 dark:border-white/10 dark:text-white">Location & Map</h2>
                  {renderInputField("googleMapEmbedUrl", "Google Map Embed URL", "url")}
                  {renderInputField("googleMapShareLink", "Google Map Share Link", "url")}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("mapLatitude", "Latitude")}
                    {renderInputField("mapLongitude", "Longitude")}
                  </div>
                </div>
              )}

              {activeTab === "social" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 dark:border-white/10 dark:text-white">Social Media Links</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("facebookUrl", "Facebook URL", "url")}
                    {renderInputField("instagramUrl", "Instagram URL", "url")}
                    {renderInputField("tiktokUrl", "TikTok URL", "url")}
                    {renderInputField("youtubeUrl", "YouTube URL", "url")}
                    {renderInputField("linkedinUrl", "LinkedIn URL", "url")}
                  </div>
                </div>
              )}

              {activeTab === "portal" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 dark:border-white/10 dark:text-white">Portal Messages</h2>
                  {renderInputField("portalWelcomeMessage", "Portal Welcome Message")}
                  {renderInputField("studentPortalNotice", "Student Portal Global Notice", "textarea")}
                  {renderInputField("admitCardLockedMessage", "Admit Card Locked Message", "textarea")}
                  {renderInputField("documentNotAvailableMessage", "Document Not Available Message", "textarea")}
                  {renderInputField("feeClearanceMessage", "Fee Clearance Message", "textarea")}
                  {renderInputField("studentInactiveMessage", "Student Inactive Message", "textarea")}
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 dark:border-white/10 dark:text-white">SEO Settings</h2>
                  {renderInputField("metaTitle", "Meta Title")}
                  {renderInputField("metaDescription", "Meta Description", "textarea")}
                  {renderInputField("metaKeywords", "Meta Keywords", "textarea", "Comma separated keywords")}
                </div>
              )}

              {activeTab === "maintenance" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 dark:border-white/10 dark:text-white">Maintenance Mode</h2>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
                    {renderInputField("maintenanceMode", "Enable Maintenance Mode", "checkbox")}
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-200">
                      When enabled, students will not be able to access the portal. They will see the maintenance message instead.
                    </p>
                  </div>
                  {renderInputField("maintenanceMessage", "Maintenance Message", "textarea")}
                </div>
              )}
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
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
