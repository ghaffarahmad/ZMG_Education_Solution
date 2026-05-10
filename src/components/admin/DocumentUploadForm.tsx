"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

const uploadSchema = z.object({
  type: z.enum(["enrollment_card", "admit_card", "other"], { message: "Document type is required" }),
  title: z.string().min(3, "Title is required"),
  file: z.any().refine((files) => files?.length === 1, "PDF file is required"),
});

export function DocumentUploadForm({ studentId, onUploadSuccess }: { studentId: string, onUploadSuccess?: () => void }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(uploadSchema),
  });

  const onSubmit = async (data: any) => {
    const file = data.file[0];
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("type", data.type);
    formData.append("title", data.title);
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/documents/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Document uploaded successfully");
        reset();
        if (onUploadSuccess) onUploadSuccess();
        router.refresh();
      } else {
        toast.error(json.message || "Failed to upload document");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4">
        <UploadCloud className="w-5 h-5 mr-2 text-[var(--primary)] dark:text-[var(--accent)]" />
        Upload New Document
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type *</label>
          <select
            {...register("type")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Type</option>
            <option value="enrollment_card">Enrollment Card</option>
            <option value="admit_card">Admit Card</option>
            <option value="other">Other Document</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message as string}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Title *</label>
          <input
            {...register("title")}
            placeholder="e.g. 9th Class Admit Card"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message as string}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PDF File *</label>
        <input
          type="file"
          accept="application/pdf"
          {...register("file")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)] file:text-white hover:file:bg-[#124C5A]"
        />
        {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file.message as string}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isUploading}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[#124C5A] disabled:opacity-50 transition-colors flex items-center"
        >
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>
    </form>
  );
}
