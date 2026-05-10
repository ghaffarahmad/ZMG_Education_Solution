"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";

const noticeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  shortDescription: z.string().min(10, "Short description is required"),
  fullContent: z.string().min(20, "Full content is required"),
  category: z.enum(["admission", "admit_card", "enrollment", "fee", "board_update", "aiou", "general"]),
  priority: z.enum(["normal", "important", "urgent"]),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  linkLabel: z.string().optional(),
  status: z.enum(["draft", "published"]),
  pinToTop: z.boolean().default(false),
  showInTicker: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;
type NoticeFormInput = z.input<typeof noticeSchema>;

function NoticeFormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading notice details" className="content-fade-in max-w-4xl space-y-5 pb-12 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <SkeletonBlock className="h-10 w-10 rounded-lg" />
        <div className="min-w-0 space-y-2">
          <SkeletonLine className="h-7 w-40" />
          <SkeletonLine className="w-64 max-w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-5 lg:col-span-2 lg:space-y-6">
          <SkeletonCard className="space-y-5 p-4 sm:space-y-6 sm:p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonLine className="w-32" />
                <SkeletonBlock className={index === 3 ? "h-44 rounded-lg" : "h-10 rounded-lg"} />
              </div>
            ))}
          </SkeletonCard>
        </div>

        <div className="space-y-6">
          <SkeletonCard className="space-y-5 p-4 sm:space-y-6 sm:p-6">
            <SkeletonLine className="h-5 w-36" />
            <SkeletonBlock className="h-10 rounded-lg" />
            <SkeletonBlock className="h-10 rounded-lg" />
            <SkeletonBlock className="h-10 rounded-lg" />
          </SkeletonCard>
          <SkeletonCard className="space-y-5 p-4 sm:space-y-6 sm:p-6">
            <SkeletonLine className="h-5 w-40" />
            <SkeletonBlock className="aspect-video rounded-lg" />
          </SkeletonCard>
          <SkeletonButton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function EditNoticePage() {
  const router = useRouter();
  const params = useParams();
  const noticeId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const form = useForm<NoticeFormInput, undefined, NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      fullContent: "",
      category: "general",
      priority: "normal",
      status: "draft",
      pinToTop: false,
      showInTicker: false,
      showOnHomepage: false,
      imageUrl: "",
      linkUrl: "",
      linkLabel: "",
    },
  });

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`/api/admin/notices/${noticeId}`);
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          const notice = data.data;
          form.reset({
            title: notice.title,
            slug: notice.slug,
            shortDescription: notice.shortDescription,
            fullContent: notice.fullContent,
            category: notice.category,
            priority: notice.priority,
            status: notice.status,
            pinToTop: notice.pinToTop,
            showInTicker: notice.showInTicker,
            showOnHomepage: notice.showOnHomepage,
            imageUrl: notice.imageUrl || "",
            linkUrl: notice.linkUrl || "",
            linkLabel: notice.linkLabel || "",
          });
          if (notice.imageUrl) {
            setUploadedImage(notice.imageUrl);
          }
        } else {
          toast.error("Failed to load notice details");
          router.push("/admin/notices");
        }
      } catch (error) {
        toast.error("An error occurred while fetching the notice");
        router.push("/admin/notices");
      } finally {
        setIsLoading(false);
      }
    };

    if (noticeId) {
      fetchNotice();
    }
  }, [noticeId, form, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setUploadedImage(data.url);
        form.setValue("imageUrl", data.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    form.setValue("slug", slug, { shouldValidate: true });
  };

  const onSubmit = async (data: NoticeFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/notices/${noticeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Notice updated successfully");
        router.push("/admin/notices");
      } else {
        toast.error(result.message || "Failed to update notice");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <NoticeFormSkeleton />;
  }

  return (
    <div className="content-fade-in max-w-4xl space-y-5 pb-12 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/admin/notices" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-accent">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Edit Notice</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Update your announcement or notice details.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
          {/* Main Content Form */}
          <div className="space-y-5 lg:col-span-2 lg:space-y-6">
            <div className="admin-card space-y-5 p-4 sm:space-y-6 sm:p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Notice Title *</label>
                <input
                  {...form.register("title")}
                  onChange={(e) => {
                    form.register("title").onChange(e);
                  }}
                  className="admin-input min-h-10 w-full rounded-lg px-4 py-2.5 transition-shadow"
                  placeholder="e.g. Admission Forms for 2024 Available"
                />
                {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Slug URL *</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">/notices/</span>
                  <input
                    {...form.register("slug")}
                    className="admin-input min-h-10 w-full rounded-lg px-4 py-2.5 font-mono text-sm transition-shadow"
                    placeholder="admission-forms-2024"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => generateSlug(form.getValues("title"))}
                    className="min-h-10 shrink-0"
                  >
                    Generate
                  </Button>
                </div>
                {form.formState.errors.slug && <p className="text-red-500 text-xs mt-1">{form.formState.errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Short Description *</label>
                <textarea
                  {...form.register("shortDescription")}
                  rows={2}
                  className="admin-input w-full resize-none rounded-lg px-4 py-2.5 transition-shadow"
                  placeholder="Brief summary shown in the notice card..."
                />
                {form.formState.errors.shortDescription && <p className="text-red-500 text-xs mt-1">{form.formState.errors.shortDescription.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Full Content *</label>
                <textarea
                  {...form.register("fullContent")}
                  rows={10}
                  className="admin-input w-full resize-none rounded-lg px-4 py-2.5 transition-shadow"
                  placeholder="Detailed content for the notice page..."
                />
                {form.formState.errors.fullContent && <p className="text-red-500 text-xs mt-1">{form.formState.errors.fullContent.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">External Link URL (Optional)</label>
                  <input
                    {...form.register("linkUrl")}
                    className="admin-input min-h-10 w-full rounded-lg px-4 py-2.5 transition-shadow"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Link Label</label>
                  <input
                    {...form.register("linkLabel")}
                    className="admin-input min-h-10 w-full rounded-lg px-4 py-2.5 transition-shadow"
                    placeholder="e.g. Download Form"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="admin-card space-y-5 p-4 sm:space-y-6 sm:p-6">
              <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900 dark:border-white/10 dark:text-white">Publish Settings</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
                <select
                  {...form.register("status")}
                  className="admin-input min-h-10 w-full rounded-lg px-4 py-2.5"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="published">Published (Visible)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Priority</label>
                <select
                  {...form.register("priority")}
                  className="admin-input min-h-10 w-full rounded-lg px-4 py-2.5"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Category</label>
                <select
                  {...form.register("category")}
                  className="admin-input min-h-10 w-full rounded-lg px-4 py-2.5"
                >
                  <option value="general">General</option>
                  <option value="admission">Admission</option>
                  <option value="admit_card">Admit Card</option>
                  <option value="enrollment">Enrollment</option>
                  <option value="fee">Fee Update</option>
                  <option value="board_update">Board Update</option>
                  <option value="aiou">AIOU</option>
                </select>
              </div>
            </div>

            <div className="admin-card space-y-5 p-4 sm:space-y-6 sm:p-6">
              <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900 dark:border-white/10 dark:text-white">Visibility Placement</h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" {...form.register("pinToTop")} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Pin to Top of Notice Board</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" {...form.register("showInTicker")} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Show in Header Ticker</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" {...form.register("showOnHomepage")} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Show on Homepage</span>
                </label>
              </div>
            </div>

            <div className="admin-card space-y-5 p-4 sm:space-y-6 sm:p-6">
              <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900 dark:border-white/10 dark:text-white">Notice Image (Optional)</h3>
              
              <div className="space-y-4">
                {uploadedImage ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-[#F7F7F4]">
                    <Image
                      src={uploadedImage}
                      alt="Notice banner"
                      fill
                      sizes="(max-width: 1024px) 100vw, 320px"
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        form.setValue("imageUrl", "");
                      }}
                      className="absolute top-2 right-2 bg-white/90 text-red-600 p-1.5 rounded-md hover:bg-white text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-colors hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    )}
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
                      {isUploading ? "Uploading..." : "Click or drag to upload"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP (Max 2MB)</span>
                  </div>
                )}
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-300">
                  Recommended image size: 1200 x 675 px or 16:9 ratio. Supported formats: JPG, PNG, WebP. Avoid very tall images for notice cards.
                </p>
                {/* Hidden input to sync with react-hook-form */}
                <input type="hidden" {...form.register("imageUrl")} />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full h-12 text-base shadow-lg" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating Notice...</>
              ) : (
                "Update Notice"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
