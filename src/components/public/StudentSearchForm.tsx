"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoaderCircle, Search, ShieldCheck } from "lucide-react";

const searchSchema = z.object({
  cnicOrBform: z.string().min(13, "Must be at least 13 characters").max(15, "Invalid format"),
  dob: z.string().min(1, "Date of Birth is required"),
});

type SearchValues = z.infer<typeof searchSchema>;

interface StudentSearchFormProps {
  onSearch: (data: SearchValues) => void | Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function StudentSearchForm({ onSearch, isLoading, error }: StudentSearchFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
  });

  const dobValue = watch("dob");

  return (
    <form onSubmit={handleSubmit(onSearch)} className="space-y-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary dark:bg-accent/10 dark:text-accent">
          <Search className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verify Your Record</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Enter your details to securely access your documents</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">CNIC or B-Form Number</label>
          <div className="relative">
            <input
              {...register("cnicOrBform")}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                value = value.substring(0, 13);
                let formattedValue = "";
                if (value.length > 0) {
                  formattedValue = value.substring(0, 5);
                  if (value.length > 5) {
                    formattedValue += "-" + value.substring(5, 12);
                    if (value.length > 12) {
                      formattedValue += "-" + value.substring(12, 13);
                    }
                  }
                }
                e.target.value = formattedValue;
                register("cnicOrBform").onChange(e);
              }}
              inputMode="numeric"
              placeholder="e.g. 42101-1234567-1"
              className="min-h-[3.5rem] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base font-medium text-slate-900 transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-[#0C2A33]"
            />
          </div>
          {errors.cnicOrBform && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.cnicOrBform.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
          <div className="relative">
            <input
              type="date"
              {...register("dob")}
              className={`min-h-[3.5rem] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base font-medium transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-white/5 dark:focus:bg-[#0C2A33] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert ${
                !dobValue ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
              }`}
            />
          </div>
          {errors.dob && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.dob.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="premium-soft-glow group relative mt-2 flex min-h-[3.5rem] w-full items-center justify-center overflow-hidden rounded-xl bg-primary px-4 py-3 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#124C5A] disabled:opacity-50 dark:bg-accent dark:text-primary dark:hover:bg-[#f0cf61]"
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
        {isLoading ? (
          <>
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            Verifying Securely...
          </>
        ) : (
          <>
            Search Record
            <Search className="ml-2 h-4 w-4" />
          </>
        )}
      </button>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10"
        >
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800 dark:text-red-200">Verification Failed</h3>
              <p className="mt-1 text-sm leading-relaxed text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            <strong>Security Note:</strong> Your details are encrypted. We use this information strictly for identity verification. No personal data is shared.
          </p>
        </div>
      </div>
    </form>
  );
}
