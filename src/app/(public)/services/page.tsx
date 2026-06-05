import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  FileText,
  GraduationCap,
  IdCard,
  Landmark,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { createSeoMetadata, pageSeo } from "@/lib/seo";

export const metadata = createSeoMetadata(pageSeo.services);

const whatsappNumber = "923143061669";
const whatsappUrl = `https://wa.me/${whatsappNumber}`;

const trustChips = ["Karachi Board", "Ziauddin Board", "AIOU", "Student Portal", "Secure Document Access"];

const serviceCards = [
  {
    id: "karachi-board",
    icon: Landmark,
    title: "Karachi Board Support",
    mobileDescription:
      "Admission, record, enrollment card, and admit card help for 9th to Intermediate students.",
    description:
      "Support for 9th, 10th, and Intermediate students including admission guidance, enrollment card access, admit card access, and student record assistance.",
    highlights: ["9th & 10th", "First Year & Second Year", "Enrollment Card Access", "Admit Card Access"],
  },
  {
    id: "ziauddin-board",
    icon: Building2,
    title: "Ziauddin Board Support",
    mobileDescription:
      "Matric and Intermediate support for groups, portal updates, enrollment, and admit cards.",
    description:
      "Support for Matric and Intermediate students including combined groups, admission support, enrollment card access, admit card access, and portal assistance.",
    highlights: ["Matric", "Intermediate", "Combined Groups", "Student Portal Updates"],
  },
  {
    id: "aiou-university-support",
    icon: GraduationCap,
    title: "AIOU University Program Support",
    mobileDescription:
      "Admission, record, and portal document support for ADC, BS, and BBA students.",
    description:
      "Support for AIOU university-related admission guidance, student record assistance, and portal-related document updates for ADC, BS, and BBA students.",
    highlights: ["ADC", "BS", "BBA"],
  },
];

const detailedServices = [
  {
    id: "karachi-board",
    badge: "Karachi Board",
    icon: Landmark,
    title: "Karachi Board Support",
    mobileDescription:
      "Admission records, enrollment/admit card access, and fee verification guidance.",
    description:
      "Focused Board Support for students and parents who need admission direction, student record assistance, Enrollment Card Access, Admit Card Access, and Fee Verification guidance.",
    chips: [
      "9th",
      "10th",
      "Science Group",
      "General Science",
      "First Year",
      "Second Year",
      "Pre-Medical",
      "Pre-Engineering",
      "Commerce",
      "Humanities",
    ],
    panelTitle: "Board Support Desk",
    panelDescription:
      "A clear flow for admission records, student document requests, and portal updates related to Karachi Board students.",
    panelItems: ["Student record review", "Enrollment Card Access", "Admit Card Access", "Fee Verification"],
    tone: "from-[#0D3B46] to-[#071B21]",
  },
  {
    id: "ziauddin-board",
    badge: "Ziauddin Board",
    icon: Building2,
    title: "Ziauddin Board Support",
    mobileDescription:
      "Group guidance, portal updates, and parent-friendly document support.",
    description:
      "Professional support for Ziauddin Board pathways, including group guidance, Student Document Portal updates, and parent-friendly communication.",
    chips: [
      "9th",
      "10th",
      "First Year",
      "Second Year",
      "Combined Pre-Medical",
      "Combined Pre-Engineering",
      "Combined Commerce",
      "Combined Humanities",
      "Combined General Science",
    ],
    panelTitle: "Program Review Panel",
    panelDescription:
      "A premium review panel for board, group, program, record, and student portal needs.",
    panelItems: ["Board Support", "Combined group review", "Portal assistance", "Document updates"],
    tone: "from-[#103743] to-[#092128]",
  },
  {
    id: "aiou-university-support",
    badge: "AIOU",
    icon: BookOpenCheck,
    title: "AIOU University Program Support",
    mobileDescription:
      "Admission, record, and portal support for ADC, BS, and BBA.",
    description:
      "Support for AIOU university-related admission guidance, student record assistance, and portal-related document updates for ADC, BS, and BBA students.",
    chips: ["ADC", "BS", "BBA"],
    panelTitle: "University Program Desk",
    panelDescription:
      "A focused support path for AIOU university program records and portal-related document updates.",
    panelItems: ["ADC record assistance", "BS guidance", "BBA guidance", "Portal updates"],
    tone: "from-[#0D3B46] to-[#123F4A]",
  },
];

const helpCards = [
  {
    icon: ClipboardCheck,
    title: "Admission Guidance",
    mobileDescription: "Direction for admission details, forms, and record readiness.",
    description: "Step-by-step direction for admission-related details, forms, and student record readiness.",
  },
  {
    icon: IdCard,
    title: "Enrollment Card Access",
    mobileDescription: "Help checking enrollment card availability and access.",
    description: "Assistance with enrollment card availability and access through the Student Document Portal.",
  },
  {
    icon: FileText,
    title: "Admit Card Access",
    mobileDescription: "Support for admit card status and document updates.",
    description: "Support for admit card availability, access status, and document-related updates.",
  },
  {
    icon: UserCheck,
    title: "Student Record Verification",
    mobileDescription: "Guidance for identity, board, and program record alignment.",
    description: "Guidance for student identity details, board details, program details, and record alignment.",
  },
  {
    icon: CreditCard,
    title: "Fee Status Guidance",
    mobileDescription: "Clear help with fee status and related record checks.",
    description: "Clear support for fee status questions and record-related verification steps.",
  },
  {
    icon: FileSearch,
    title: "Portal Updates",
    mobileDescription: "Student Portal help for notices, documents, and records.",
    description: "Student Portal guidance for notices, document updates, and available student records.",
  },
  {
    icon: ListChecks,
    title: "Board / Program Information",
    mobileDescription: "Information for Karachi Board, Ziauddin Board, and AIOU support.",
    description: "Professional information support for Karachi Board, Ziauddin Board, and AIOU University Program Support.",
  },
];

const trustItems = [
  "Clear guidance",
  "Secure student portal",
  "Board-focused support",
  "Document access convenience",
  "Parent-friendly communication",
  "Reliable updates",
];

const heroStats = [
  { value: "3", label: "Support pathways" },
  { value: "24/7", label: "Portal availability" },
  { value: "Reliable", label: "Guidance" },
];

function PrimaryCta({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="premium-soft-glow inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-black text-[#092128] shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0cf61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:min-h-12 sm:w-auto sm:rounded-xl sm:px-5 sm:py-3"
    >
      {children}
    </Link>
  );
}

function WhatsAppCta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

export default function ServicesPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0D3B46_0%,#103743_48%,#071B21_100%)] py-4 text-white sm:py-6 lg:py-8">
        <div className="premium-pattern absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="absolute left-6 top-12 h-28 w-px rotate-12 bg-accent/40 animate-pulse" aria-hidden="true" />
        <div className="absolute bottom-10 right-10 h-px w-44 -rotate-12 bg-accent/35" aria-hidden="true" />
        <div className="absolute right-[12%] top-0 h-full w-px bg-white/10" aria-hidden="true" />

        <Container className="relative">
          <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:gap-10">
            <div className="premium-fade-up">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-accent sm:mb-4 sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Premium Education Support
              </div>
              <h1 className="max-w-4xl text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Our Support Services
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:mt-4 sm:text-base sm:leading-7">
                Professional admission, board, and student document support for Karachi Board, Ziauddin Board, and AIOU university students.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                {trustChips.map((chip, index) => (
                  <span
                    key={chip}
                    className="premium-fade-up inline-flex min-h-7 items-center rounded-full border border-white/15 bg-white/10 px-2.5 text-[11px] font-bold text-slate-100 backdrop-blur sm:min-h-8 sm:px-3"
                    style={{ animationDelay: `${120 + index * 70}ms` }}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-2.5">
                <PrimaryCta href="/student-portal">
                  Open Student Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </PrimaryCta>
                <WhatsAppCta>
                  Contact on WhatsApp
                  <MessageSquare className="ml-2 h-4 w-4" />
                </WhatsAppCta>
              </div>
            </div>

            <div className="premium-slide-in hidden lg:block">
              <div className="premium-accent-sweep rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-6">
                <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Student Document Portal</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Secure support command center</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      A polished route for Board Support, student records, and document access.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-[#092128]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {heroStats.map((item, index) => (
                    <div
                      key={item.label}
                      className="premium-fade-up rounded-2xl border border-white/10 bg-white/10 p-4 text-center"
                      style={{ animationDelay: `${220 + index * 90}ms` }}
                    >
                      <p className="text-2xl font-black text-accent">{item.value}</p>
                      <p className="mt-1 text-xs font-bold leading-5 text-slate-300">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {["Admission Support", "Enrollment Card Access", "Admit Card Access", "Fee Verification"].map((item, index) => (
                    <div
                      key={item}
                      className="premium-fade-up flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#071B21]/45 p-3"
                      style={{ animationDelay: `${320 + index * 80}ms` }}
                    >
                      <span className="flex items-center gap-3 text-sm font-bold text-white">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        {item}
                      </span>
                      <ChevronRight className="h-4 w-4 text-accent" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent sm:text-sm sm:tracking-[0.2em]">Core Support Pathways</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-primary dark:text-white sm:mt-3 sm:text-4xl">
              Premium support designed for students and parents.
            </h2>
          </div>

          <div className="grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service, index) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.id}
                  className="premium-card-line premium-reveal group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-[0_14px_45px_rgb(13_59_70/0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-accent/70 hover:shadow-[0_28px_90px_rgb(13_59_70/0.16)] dark:border-white/10 dark:bg-[#0C2A33] dark:shadow-black/20 dark:hover:border-accent/70 sm:rounded-2xl sm:p-6 sm:shadow-[0_20px_70px_rgb(13_59_70/0.08)]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 dark:bg-accent/15 dark:text-accent sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl">
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white sm:text-xl">{service.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:hidden">{service.mobileDescription}</p>
                  <p className="mt-3 hidden flex-1 leading-7 text-slate-600 dark:text-slate-300 sm:block">{service.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-1">
                    {service.highlights.map((item) => (
                      <div key={item} className="flex min-h-9 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[12px] font-bold leading-4 text-slate-700 dark:bg-white/10 dark:text-slate-200 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-black text-white transition-all duration-300 hover:bg-[#124C5A] dark:bg-accent dark:text-[#092128] dark:hover:bg-[#f0cf61] sm:hidden"
                    >
                      Inquire Now
                    </a>
                    <Link
                      href={`#${service.id}`}
                      className="hidden min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white transition-all duration-300 hover:bg-[#124C5A] dark:bg-accent dark:text-[#092128] dark:hover:bg-[#f0cf61] sm:inline-flex"
                    >
                      View Details
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden min-h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-black text-primary transition-all duration-300 hover:border-accent hover:bg-accent/10 dark:border-white/10 dark:text-white dark:hover:border-accent dark:hover:bg-accent/15 sm:inline-flex"
                    >
                      Inquire Now
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-8 dark:bg-[#071B21] sm:py-16 lg:py-20">
        <Container>
          <div className="space-y-4 sm:space-y-8">
            {detailedServices.map((service, index) => {
              const Icon = service.icon;

              return (
                <section
                  key={service.id}
                  id={service.id}
                  className="premium-reveal scroll-mt-28 rounded-xl border border-slate-200 bg-[#F7F7F4] p-4 shadow-[0_14px_46px_rgb(13_59_70/0.08)] dark:border-white/10 dark:bg-[#0C2A33] sm:scroll-mt-32 sm:rounded-2xl sm:p-6 sm:shadow-[0_22px_80px_rgb(13_59_70/0.08)] lg:p-8"
                >
                  <div className={`grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:gap-7 ${index === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary dark:text-accent sm:mb-5 sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {service.badge}
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-primary dark:text-white sm:text-4xl">
                        {service.title}
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:hidden">
                        {service.mobileDescription}
                      </p>
                      <p className="mt-4 hidden max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:block">
                        {service.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 sm:mt-7 sm:gap-2.5">
                        {service.chips.map((chip) => (
                          <span
                            key={chip}
                            className="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-white px-2.5 text-[12px] font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:min-h-9 sm:px-3.5 sm:text-sm"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>

                    <aside className={`premium-accent-sweep rounded-xl border border-white/10 bg-gradient-to-br ${service.tone} p-3.5 text-white shadow-xl shadow-primary/15 sm:rounded-2xl sm:p-6 sm:shadow-2xl`}>
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-accent sm:text-xs sm:tracking-[0.2em]">Support Panel</p>
                          <h3 className="mt-1.5 text-base font-black sm:mt-2 sm:text-2xl">{service.panelTitle}</h3>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent sm:h-12 sm:w-12 sm:rounded-2xl">
                          <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                      </div>
                      <p className="mt-4 hidden leading-7 text-slate-200 sm:block">{service.panelDescription}</p>

                      <div className="mt-3 grid gap-2 sm:mt-6 sm:gap-3">
                        {service.panelItems.map((item, itemIndex) => (
                          <div key={item} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 p-2.5 sm:gap-3 sm:rounded-2xl sm:p-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-black text-primary sm:h-9 sm:w-9 sm:rounded-xl sm:text-xs">
                              {itemIndex + 1}
                            </span>
                            <span className="text-xs font-bold text-white sm:text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </aside>
                  </div>
                </section>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-6 max-w-3xl sm:mb-10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent sm:text-sm sm:tracking-[0.2em]">What We Help With</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-primary dark:text-white sm:mt-3 sm:text-4xl">
              Clear support for the tasks that matter most.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {helpCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={`premium-reveal group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/70 hover:shadow-xl hover:shadow-primary/10 dark:border-white/10 dark:bg-[#0C2A33] sm:rounded-2xl sm:p-5 ${index === 6 ? "lg:col-span-2" : ""}`}
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 dark:bg-accent/15 dark:text-accent sm:mb-4 sm:h-11 sm:w-11 sm:rounded-xl">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white sm:text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:hidden">{item.mobileDescription}</p>
                  <p className="mt-3 hidden leading-7 text-slate-600 dark:text-slate-300 sm:block">{item.description}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="hidden bg-[#0D3B46] py-14 text-white dark:bg-[#071B21] sm:py-16 lg:block lg:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div className="premium-reveal">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-accent">
                <Users className="h-4 w-4" />
                Why Students & Parents Choose Z.M.G
              </div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                A trusted support experience built around clarity.
              </h2>
              <p className="mt-4 leading-8 text-slate-200">
                Every interaction is designed to feel organized, respectful, and simple for families managing admission and student document needs.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {trustItems.map((item, index) => (
                <div
                  key={item}
                  className="premium-reveal flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                    <BadgeCheck className="h-5 w-5" />
                  </span>
                  <span className="font-bold text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8 pb-24 sm:py-16 lg:py-20">
        <Container>
          <div className="premium-pattern overflow-hidden rounded-xl border border-white/10 bg-[#092128] p-4 text-white shadow-2xl shadow-primary/20 sm:rounded-2xl sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent sm:mb-4 sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Z.M.G Education Solution
                </div>
                <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
                  Need help with admission or student documents?
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:mt-4 sm:text-base sm:leading-8">
                  Contact Z.M.G Education Solution for board support, enrollment card access, admit card access, fee verification, and student portal assistance.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <WhatsAppCta className="premium-soft-glow bg-accent text-primary hover:bg-[#f0cf61]">
                  Contact on WhatsApp
                  <MessageSquare className="ml-2 h-4 w-4" />
                </WhatsAppCta>
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
