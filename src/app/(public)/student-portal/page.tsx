"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudentSearchForm } from "@/components/public/StudentSearchForm";
import { Container } from "@/components/ui/Container";

const noRecordMessage = "No record found with the provided details. Please check your CNIC and Date of Birth.";

interface StudentSearchResponse {
  success?: boolean;
  message?: string;
}

export default function StudentPortalPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (data: Record<string, string>) => {
    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/student/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => null)) as StudentSearchResponse | null;

      if (!res.ok || !json?.success) {
        setError(json?.message || noRecordMessage);
        setIsVerifying(false);
        return;
      }

      router.push("/student-portal/dashboard");
    } catch {
      setError("Unable to verify this record right now. Please try again.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-[#F7F7F4] dark:bg-[#092128] py-6 sm:py-10 lg:py-12">
      {/* Theme-Aware Premium Background */}
      <div className="premium-pattern absolute inset-0 opacity-40 dark:opacity-30" aria-hidden="true"></div>
      
      {/* Clean Theme-Aware Accent Blurs (Not Yellow/Muddy) */}
      <div className="absolute -top-[20%] -right-[10%] h-[50vh] w-[50vh] rounded-full bg-primary/5 dark:bg-accent/10 blur-[100px]" aria-hidden="true"></div>
      <div className="absolute -bottom-[20%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-primary/5 dark:bg-accent/5 blur-[100px]" aria-hidden="true"></div>

      <Container className="relative z-10 w-full">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_minmax(360px,0.85fr)] lg:gap-14">
          
          {/* Left Side: Information */}
          <div className="premium-fade-up text-center lg:text-left text-slate-900 dark:text-white">
            <div className="mb-3 lg:mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 dark:border-accent/40 dark:bg-accent/10 px-3 py-1 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.18em] text-primary dark:text-accent">
              <svg className="h-3 w-3 lg:h-3.5 lg:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Secure Document Portal
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-primary dark:text-white">
              Access Your Student Records
            </h1>
            <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-600 dark:text-slate-350 sm:text-sm lg:mx-0 lg:mt-4 lg:max-w-none lg:text-base">
              A centralized, highly secure platform for students to access, verify, and instantly download their official educational documents.
            </p>
            
            <div className="mt-6 hidden gap-3 lg:grid lg:grid-cols-1 lg:gap-4">
              {[
                { 
                  icon: <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
                  text: "Verify Fee Submissions & Status" 
                },
                { 
                  icon: <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>, 
                  text: "Download Official Enrollment Cards" 
                },
                { 
                  icon: <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, 
                  text: "Access Examination Admit Cards" 
                }
              ].map((feature, idx) => (
                <div key={idx} className="premium-slide-in flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:border-accent/40 dark:hover:bg-white/10" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-accent dark:text-primary dark:shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 sm:text-sm">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="premium-slide-in">
            <div className="relative mx-auto w-full max-w-sm">
              {/* Form Shadow & Glow */}
              <div className="absolute -inset-1 rounded-[1.5rem] bg-gradient-to-br from-slate-200/50 via-transparent to-primary/5 blur-xl dark:from-accent/20 dark:to-[#25D366]/10"></div>
              
              <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C2A33]">
                {/* A subtle top highlight in the card */}
                <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 dark:via-accent dark:opacity-70"></div>
                
                <div className="p-5 sm:p-6">
                  <StudentSearchForm onSearch={handleSearch} isLoading={isVerifying} error={error} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
