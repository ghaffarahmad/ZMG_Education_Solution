"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
  programInterest: z.string().optional(),
  board: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Message sent successfully! We will contact you soon.");
        reset();
      } else {
        toast.error(result.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
          <input
            {...register("name")}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, '');
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
          <input
            {...register("phone")}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+\-\s()]/g, '');
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="0300 1234567"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interested Program</label>
          <input
            {...register("programInterest")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g. BS, Pre-Medical, 9th"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Board / University</label>
          <select
            {...register("board")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Select an option</option>
            <option value="Karachi Board">Karachi Board</option>
            <option value="Ziauddin Board">Ziauddin Board</option>
            <option value="AIOU">AIOU</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
        <textarea
          {...register("message")}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="How can we help you?"
        />
        {errors.message && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[var(--primary)] hover:bg-[#124C5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? (
          "Sending..."
        ) : (
          <>
            Send Message
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
