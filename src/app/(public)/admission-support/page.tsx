import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  FileText,
  IdCard,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { createSeoMetadata, pageSeo } from "@/lib/seo";

export const metadata = createSeoMetadata(pageSeo.admissionSupport);

const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923143061669").replace(/[^0-9]/g, "");
const whatsappUrl = `https://wa.me/${whatsappNumber}`;

const supportFlowSteps = [
  "Share Student Details",
  "Verify Board / Program",
  "Prepare Required Documents",
  "Track Updates Through Portal",
];

const helpItems = [
  {
    icon: ClipboardCheck,
    title: "Form Filling & Submission",
    mobileDescription: "Careful help with forms, record details, and submission readiness.",
    description: "Careful support for admission forms, record details, and submission readiness.",
  },
  {
    icon: UserCheck,
    title: "Eligibility Guidance",
    mobileDescription: "Review of board, program, group, and session requirements.",
    description: "Clear review of board, program, group, and session requirements before proceeding.",
  },
  {
    icon: ShieldCheck,
    title: "Board Issue Resolution",
    mobileDescription: "Guidance for mismatches, updates, and board-related concerns.",
    description: "Guidance for record mismatches, administrative updates, and board-related concerns.",
  },
  {
    icon: IdCard,
    title: "Enrollment Card Support",
    mobileDescription: "Enrollment card access support when available in the portal.",
    description: "Support for Enrollment Card Access through the Student Document Portal when available.",
  },
  {
    icon: FileText,
    title: "Admit Card Access",
    mobileDescription: "Admit card availability checks and student record status help.",
    description: "Assistance with Admit Card Access, availability checks, and student record status.",
  },
  {
    icon: CreditCard,
    title: "Fee / Record Verification",
    mobileDescription: "Fee status, record clearance, and verification guidance.",
    description: "Guidance for fee status, record clearance, and related verification steps.",
  },
  {
    icon: FileSearch,
    title: "Student Portal Guidance",
    mobileDescription: "Help using notices, document access, and portal updates.",
    description: "Help for students and parents using notices, document access, and portal updates.",
  },
];

const processSteps = [
  {
    title: "Student Information",
    mobileDescription: "Collect and verify basic student details.",
    description: "We collect and verify basic student details.",
  },
  {
    title: "Board & Program Review",
    mobileDescription: "Confirm the right board, group, and program path.",
    description: "We confirm the correct board, group, and program requirements.",
  },
  {
    title: "Document Preparation",
    mobileDescription: "Guide required documents and record details.",
    description: "We guide required documents and record details.",
  },
  {
    title: "Portal Access",
    mobileDescription: "Access available notices, enrollment cards, and admit cards.",
    description: "Students can access available notices, enrollment cards, and admit cards through the portal.",
  },
];

const requiredDetails = [
  "Student Name & Phone",
  "Board",
  "Program / Group",
  "Session",
  "Fee Status (If Applicable)",
];

const requiredDocuments = [
  "Matric Marksheet (Original Scan)",
  "Matric Certificate (Original Scan)",
  "Passport Size Picture (Scan)",
  "Student CNIC / B-Form (Scan)",
  "Father CNIC (Scan)",
];

function WhatsAppButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/80 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:min-h-12 sm:w-auto sm:rounded-xl sm:px-5 sm:py-3 ${className}`}
    >
      {children}
    </a>
  );
}

export default function AdmissionSupportPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0D3B46_0%,#103743_50%,#071B21_100%)] py-9 text-white sm:py-20 lg:py-24">
        <div className="premium-pattern absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="absolute left-8 top-10 h-28 w-px rotate-12 bg-accent/40" aria-hidden="true" />
        <div className="absolute bottom-10 right-10 h-px w-44 -rotate-12 bg-accent/35" aria-hidden="true" />
        <div className="absolute right-[13%] top-0 h-full w-px bg-white/10" aria-hidden="true" />

        <Container className="relative">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)] lg:gap-10">
            <div className="premium-fade-up">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent sm:mb-5 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                <BadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Professional Admission Support
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
                Admission Support
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 sm:mt-6 sm:text-lg sm:leading-8">
                Simple, reliable, and professional support for admission-related processes, board documentation, and student record guidance.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:gap-3">
                <Link
                  href="/contact"
                  className="premium-soft-glow inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-black text-[#092128] shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0cf61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:min-h-12 sm:w-auto sm:rounded-xl sm:px-5 sm:py-3"
                >
                  Start Admission Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <WhatsAppButton>
                  Contact on WhatsApp
                  <MessageSquare className="ml-2 h-4 w-4" />
                </WhatsAppButton>
              </div>
            </div>

            <div className="premium-slide-in">
              <div className="premium-accent-sweep rounded-xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/25 backdrop-blur-md sm:rounded-2xl sm:p-6 lg:bg-[#071B21]/80">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 sm:gap-5 sm:pb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-accent sm:text-xs sm:tracking-[0.2em]">Support Flow</p>
                    <h2 className="mt-1.5 text-lg font-black text-white sm:mt-2 sm:text-2xl">Support Flow</h2>
                    <p className="mt-2 hidden text-sm leading-6 text-slate-300 sm:block">
                      A structured path from student details to portal-based updates.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-[#092128] shadow-lg shadow-accent/20 sm:h-12 sm:w-12 sm:rounded-2xl">
                    <ListChecks className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:mt-5 sm:gap-3">
                  {supportFlowSteps.map((step, index) => (
                    <div
                      key={step}
                      className="premium-fade-up flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 p-2.5 sm:gap-3 sm:rounded-2xl sm:p-3"
                      style={{ animationDelay: `${160 + index * 90}ms` }}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-black text-primary sm:h-10 sm:w-10 sm:rounded-xl sm:text-sm">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold leading-5 text-white sm:text-base">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="admission-help-section py-8 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent sm:text-sm sm:tracking-[0.2em]">How We Help You</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-primary dark:text-white sm:mt-3 sm:text-4xl">
              Premium support for every important admission step.
            </h2>
          </div>

          <div className="grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {helpItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={`premium-card-line premium-reveal admission-surface-card group rounded-xl p-4 transition-all duration-300 hover:-translate-y-2 sm:rounded-2xl sm:p-6 ${index === 6 ? "lg:col-span-3" : ""}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="admission-icon-box mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl">
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white sm:text-xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:hidden">{item.mobileDescription}</p>
                  <p className="mt-3 hidden leading-7 text-slate-600 dark:text-slate-300 sm:block">{item.description}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-8 dark:bg-[#071B21] sm:py-16 lg:py-20">
        <Container>
          <div className="mb-6 max-w-3xl sm:mb-10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent sm:text-sm sm:tracking-[0.2em]">Admission Timeline</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-primary dark:text-white sm:mt-3 sm:text-4xl">
              A professional timeline for admission support.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:mt-4 sm:text-base sm:leading-8">
              Each step keeps student details, board requirements, document preparation, and portal access organized.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 hidden h-full w-px bg-accent/40 sm:block lg:left-0 lg:top-10 lg:h-px lg:w-full" aria-hidden="true" />
            <div className="relative grid gap-3 sm:gap-5 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="premium-card-line premium-reveal admission-timeline-card rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 sm:rounded-2xl sm:p-5"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-xs font-black text-primary shadow-lg shadow-accent/20 sm:mb-5 sm:h-11 sm:w-11 sm:rounded-xl sm:text-sm">
                    {index + 1}
                  </span>
                  <h3 className="text-base font-black text-slate-950 dark:text-white sm:text-lg">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:hidden">{step.mobileDescription}</p>
                  <p className="mt-3 hidden leading-7 text-slate-600 dark:text-slate-300 sm:block">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="admission-checklist-section py-8 sm:py-16 lg:py-20">
        <Container>
          <div className="admission-shell grid gap-5 rounded-xl p-4 sm:gap-8 sm:rounded-2xl sm:p-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:p-8">
            <div className="premium-reveal">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary dark:text-accent sm:mb-5 sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Required Information
              </div>
              <h2 className="text-2xl font-black tracking-tight text-primary dark:text-white sm:text-4xl">
                A clean document checklist before you begin.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:mt-4 sm:text-base sm:leading-8">
                Keeping these details ready helps us review the support request with fewer delays and clearer communication.
              </p>
            </div>

            <div className="premium-reveal admission-checklist-card overflow-hidden rounded-xl sm:rounded-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-primary px-4 py-3.5 text-white dark:border-white/10 sm:px-5 sm:py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent sm:text-xs sm:tracking-[0.18em]">Student Record File</p>
                  <h3 className="mt-1 text-sm font-black sm:text-base">Required Documents Checklist</h3>
                </div>
                <ClipboardCheck className="h-5 w-5 shrink-0 text-accent sm:h-6 sm:w-6" />
              </div>
              <div className="grid gap-0 sm:grid-cols-2">
                <div className="flex flex-col border-slate-200 dark:border-white/10 sm:border-r">
                  {requiredDetails.map((item, i) => (
                    <div key={item} className={`flex items-center gap-2.5 border-b border-slate-200 px-4 py-2.5 dark:border-white/10 sm:gap-3 sm:px-5 sm:py-3 ${i === requiredDetails.length - 1 ? 'sm:border-b-0' : ''}`}>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent sm:h-5 sm:w-5" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  {requiredDocuments.map((item, i) => (
                    <div key={item} className={`flex items-center gap-2.5 border-b border-slate-200 px-4 py-2.5 dark:border-white/10 sm:gap-3 sm:px-5 sm:py-3 ${i === requiredDocuments.length - 1 ? 'border-b-0' : ''}`}>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent sm:h-5 sm:w-5" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-24 pt-2 sm:pb-16 lg:pb-20">
        <Container>
          <div className="premium-pattern premium-accent-sweep overflow-hidden rounded-xl border border-white/10 bg-[#092128] p-4 text-white shadow-2xl shadow-primary/20 sm:rounded-2xl sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent sm:mb-4 sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Z.M.G Education Solution
                </div>
                <h2 className="text-2xl font-black tracking-tight sm:text-4xl">Ready to begin?</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:mt-4 sm:text-base sm:leading-8">
                  Contact Z.M.G Education Solution for reliable admission support, student record guidance, and portal-based document access.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <WhatsAppButton className="premium-soft-glow bg-accent text-primary hover:bg-[#f0cf61]">
                  Contact on WhatsApp
                  <MessageSquare className="ml-2 h-4 w-4" />
                </WhatsAppButton>
                <Link
                  href="/student-portal"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 sm:min-h-12 sm:w-auto sm:rounded-xl sm:px-5 sm:py-3"
                >
                  Open Student Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
