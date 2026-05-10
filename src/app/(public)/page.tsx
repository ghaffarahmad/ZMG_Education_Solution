import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpenCheck,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  FileSearch,
  FileText,
  GraduationCap,
  IdCard,
  Landmark,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import {
  NoticeCardSkeleton,
  SkeletonBlock,
  SkeletonButton,
  SkeletonCard,
  SkeletonLine,
} from "@/components/ui/Skeleton";
import { MaskedStudentNamePreview } from "@/components/public/MaskedStudentNamePreview";
import { NoticeCard } from "@/components/public/NoticeCard";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { cn } from "@/lib/utils";
import { getCleanPublicNotices, PUBLIC_NOTICE_FALLBACK_TITLE } from "@/lib/publicNoticeDisplay";
import { createSeoMetadata, pageSeo } from "@/lib/seo";

export const metadata = createSeoMetadata(pageSeo.home);

interface PublicNotice {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  priority: "normal" | "important" | "urgent";
  imageUrl?: string;
  createdAt: string;
  linkUrl?: string;
  linkLabel?: string;
}

async function getHomepageNotices(): Promise<PublicNotice[]> {
  try {
    await connectToDatabase();
    const notices = await Notice.find({ status: "published", showOnHomepage: true })
      .sort({ pinToTop: -1, createdAt: -1 })
      .limit(12);
    const publicNotices = JSON.parse(JSON.stringify(notices)) as PublicNotice[];
    return getCleanPublicNotices(publicNotices, 6);
  } catch (error) {
    console.error("Error fetching homepage notices:", error);
    return [];
  }
}

const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923143061669").replace(/[^0-9]/g, "");
const whatsappUrl = `https://wa.me/${whatsappNumber}`;

const supportCards = [
  {
    icon: Landmark,
    title: "Karachi Board Support",
    description: "Admission Support, Board Support, Enrollment Card Access, Admit Card Access, and student record assistance.",
    highlights: ["9th & 10th", "First Year & Second Year", "Fee Verification"],
  },
  {
    icon: Building2,
    title: "Ziauddin Board Support",
    description: "Board Support for Matric, Intermediate, combined groups, Student Document Portal updates, and document access.",
    highlights: ["Matric", "Intermediate", "Combined Groups"],
  },
  {
    icon: GraduationCap,
    title: "AIOU University Program Support",
    description: "Support for AIOU university-related admission guidance and portal-related document updates for ADC, BS, and BBA students.",
    highlights: ["ADC", "BS", "BBA"],
  },
  {
    icon: IdCard,
    title: "Enrollment Card Access",
    description: "Secure access guidance for verified enrollment cards through the Student Document Portal.",
    highlights: ["Secure Portal", "Record Review", "Student Access"],
  },
  {
    icon: FileText,
    title: "Admit Card Access",
    description: "Admit Card Access support with availability checks, record status, and portal-based updates.",
    highlights: ["Availability", "Download Ready", "Status Updates"],
  },
  {
    icon: CreditCard,
    title: "Fee Verification",
    description: "Clear fee status guidance and record verification support for students and parents.",
    highlights: ["Fee Status", "Record Match", "Clear Guidance"],
  },
];

const processCards = [
  {
    icon: Search,
    title: "Verify Record",
    description: "Students enter CNIC / B-Form and Date of Birth for secure record verification.",
  },
  {
    icon: ShieldCheck,
    title: "Check Status",
    description: "The portal shows available notices, document status, and Fee Verification updates.",
  },
  {
    icon: FileSearch,
    title: "Review Documents",
    description: "Students can review Enrollment Card Access and Admit Card Access availability.",
  },
  {
    icon: Download,
    title: "Download Securely",
    description: "Available documents can be downloaded through the Student Document Portal.",
  },
];

const portalBenefits = [
  "24/7 access to published documents",
  "Fee Verification visibility",
  "Secure student record review",
  "Direct document downloads",
];

function getNoticeHref(notice?: PublicNotice) {
  return notice?.slug ? `/notices/${notice.slug}` : "/notices";
}

function FeaturedNoticeCard({ notice }: { notice?: PublicNotice }) {
  const hasNotice = Boolean(notice);
  const title = notice?.title || PUBLIC_NOTICE_FALLBACK_TITLE;
  const description = notice?.shortDescription || "Clean, published student notices will be shown here as soon as they are available.";
  const createdAt = notice?.createdAt ? new Date(notice.createdAt) : null;

  return (
    <article className="premium-card-line premium-reveal flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgb(13_59_70/0.1)] dark:border-white/10 dark:bg-[#0C2A33] dark:shadow-black/20 sm:p-6 lg:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent sm:text-xs sm:tracking-[0.22em]">
            Latest Notice
          </p>
          <h3 className="mt-2 text-xl font-black leading-tight text-slate-950 dark:text-white sm:text-3xl">
            {title}
          </h3>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-primary shadow-[0_12px_30px_rgb(212_175_55/0.18)] dark:text-accent sm:h-[3.25rem] sm:w-[3.25rem] sm:rounded-2xl">
          <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
      </div>

      <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-7">
        {description}
      </p>

      <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-7">
        <div className="flex min-w-0 items-center text-xs font-bold text-slate-500 dark:text-slate-300">
          <Calendar className="mr-1.5 h-4 w-4 shrink-0 text-accent" />
          <span className="truncate">
            {createdAt
              ? createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : "Student notice board"}
          </span>
        </div>

        <Link
          href={getNoticeHref(notice)}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-primary dark:bg-accent dark:text-primary dark:hover:bg-[#f0cf61] sm:w-auto"
        >
          {hasNotice ? "Open Notice" : "View Notices"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function PortalActionsPanel() {
  const actions = [
    { title: "Verify Student Record", href: "/student-portal", icon: ShieldCheck },
    { title: "View Notice Board", href: "/notices", icon: Bell },
    { title: "Admission Support", href: "/admission-support", icon: GraduationCap },
  ];

  return (
    <aside className="premium-reveal rounded-2xl border border-slate-200 bg-[#F7F7F4] p-4 shadow-[0_14px_44px_rgb(13_59_70/0.08)] dark:border-white/10 dark:bg-[#092128] sm:p-5 lg:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent sm:text-xs sm:tracking-[0.2em]">
        Important Updates
      </p>
      <h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white sm:text-xl">Portal Actions</h3>
      <div className="mt-4 grid gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-primary shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/70 hover:bg-accent/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate">{action.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function LatestNoticesSectionSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading latest notices"
      className="border-b border-slate-200 bg-white py-8 dark:border-white/10 dark:bg-[#071B21] sm:py-16 lg:py-20"
    >
      <Container>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between lg:mb-9">
          <div className="max-w-3xl space-y-3">
            <SkeletonLine className="h-4 w-32" />
            <SkeletonLine className="h-8 w-72 max-w-full" />
            <SkeletonLine className="w-full max-w-xl" />
          </div>
          <SkeletonButton className="h-11 w-36" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-5">
          <SkeletonCard className="p-4 sm:p-6 lg:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <SkeletonLine className="h-4 w-28" />
                <SkeletonLine className="h-8 w-5/6" />
              </div>
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            </div>
            <div className="mt-5 space-y-2">
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-4/5" />
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SkeletonLine className="w-32" />
              <SkeletonButton className="h-10 w-full sm:w-32" />
            </div>
          </SkeletonCard>
          <SkeletonCard className="bg-[#F7F7F4] dark:bg-[#092128]">
            <SkeletonLine className="h-4 w-28" />
            <SkeletonLine className="mt-3 h-6 w-36" />
            <div className="mt-4 grid gap-2.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-12 rounded-xl" />
              ))}
            </div>
          </SkeletonCard>
        </div>

        <div className="mt-5 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3 lg:gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <NoticeCardSkeleton key={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

async function LatestNoticesSection() {
  const notices = await getHomepageNotices();
  const featuredNotice = notices[0];
  const remainingNotices = notices.slice(1, 4);

  return (
    <section className="border-b border-slate-200 bg-white py-8 dark:border-white/10 dark:bg-[#071B21] sm:py-16 lg:py-20">
      <Container>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between lg:mb-9">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent sm:text-sm sm:tracking-[0.2em]">Latest Updates</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-primary dark:text-white sm:mt-3 sm:text-4xl">
              Latest Notices & Updates
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:mt-4 sm:text-base sm:leading-8">
              Stay informed with important announcements, fee schedules, and board updates.
            </p>
          </div>
          <Link
            href="/notices"
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-black text-primary shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 dark:border-white/10 dark:bg-white/10 dark:text-white sm:min-h-11 sm:px-4 sm:text-sm"
          >
            View All Notices
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-5">
          <FeaturedNoticeCard notice={featuredNotice} />
          <PortalActionsPanel />
        </div>

        {remainingNotices.length > 0 && (
          <div className="mt-5 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3 lg:gap-5">
            {remainingNotices.map((notice) => (
              <NoticeCard key={notice._id} notice={notice} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section
        data-floating-whatsapp-safe-zone
        className="relative overflow-hidden bg-[linear-gradient(135deg,#0D3B46_0%,#103743_48%,#071B21_100%)] py-8 text-white sm:py-20 lg:py-24"
      >
        <div className="premium-pattern absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="absolute left-6 top-12 h-28 w-px rotate-12 bg-accent/40" aria-hidden="true" />
        <div className="absolute bottom-10 right-10 h-px w-44 -rotate-12 bg-accent/35" aria-hidden="true" />

        <Container className="relative">
          <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1.04fr)_minmax(340px,0.96fr)] lg:gap-10">
            <div className="premium-fade-up max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent sm:mb-5 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Secure Digital Access
              </div>
              <h1 className="text-[2rem] font-black leading-[1.1] tracking-tight text-white min-[390px]:text-[2.1rem] sm:text-5xl lg:text-7xl">
                <span className="sm:hidden">Student Document Portal</span>
                <span className="hidden sm:inline">Student Admission & Document Support Portal</span>
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:hidden">
                Admission support, board support, enrollment cards, admit cards, notices, and secure student document access.
              </p>
              <p className="mt-6 hidden max-w-3xl text-lg leading-8 text-slate-200 sm:block">
                Access enrollment cards, admit cards, notices, Admission Support, Board Support, and AIOU University Program Support through a secure digital portal.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 sm:mt-8 sm:gap-2.5">
                {["Karachi Board", "Ziauddin Board", "AIOU", "Student Portal", "Secure Document Access"].map((chip, index) => (
                  <span
                    key={chip}
                    className="premium-fade-up inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/10 px-3 text-xs font-bold text-slate-100 backdrop-blur sm:min-h-9 sm:px-3.5 sm:text-sm"
                    style={{ animationDelay: `${120 + index * 70}ms` }}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:gap-3">
                <Link
                  href="/student-portal"
                  className="premium-soft-glow inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-[#092128] shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0cf61] sm:min-h-12 sm:px-5 sm:py-3"
                >
                  Open Student Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/notices"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/80 hover:bg-white/15 sm:min-h-12 sm:px-5 sm:py-3"
                >
                  View Notices
                  <Bell className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="premium-slide-in">
              <div className="premium-accent-sweep rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-6">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 sm:gap-5 sm:pb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent sm:text-xs sm:tracking-[0.2em]">Student Document Portal</p>
                    <h2 className="mt-1.5 text-xl font-black text-white sm:mt-2 sm:text-2xl">Verify Record</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">Secure access via CNIC / B-Form and Date of Birth.</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-[#092128] sm:h-12 sm:w-12 sm:rounded-2xl">
                    <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                <MaskedStudentNamePreview />

                <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
                  {[
                    ["Admit Card Access", "Available", FileText],
                    ["Fee Verification", "Clear", CreditCard],
                  ].map(([title, status, Icon]) => (
                    <div key={title as string} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/10 p-3 sm:rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent sm:h-10 sm:w-10 sm:rounded-xl">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </span>
                        <span className="text-sm font-bold text-white">{title as string}</span>
                      </div>
                      <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-black text-primary">{status as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Suspense fallback={<LatestNoticesSectionSkeleton />}>
        <LatestNoticesSection />
      </Suspense>

      <section className="bg-[#F2F5F1] py-8 dark:bg-[#092128] sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent sm:text-sm sm:tracking-[0.2em]">Support Cards</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-primary dark:text-white sm:mt-3 sm:text-4xl">
              Premium support services in one place.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:mt-4 sm:text-base sm:leading-8">
              Professional guidance for Board Support, Admission Support, document access, and Student Document Portal updates.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {supportCards.map((card, index) => {
              const Icon = card.icon;
              const isCompactMobile = index >= 3;

              return (
                <article
                  key={card.title}
                  className={cn(
                    "premium-card-line premium-reveal group h-full rounded-2xl border border-slate-200 bg-white shadow-[0_16px_55px_rgb(13_59_70/0.09)] transition-all duration-300 hover:-translate-y-2 hover:border-accent/70 hover:shadow-[0_28px_90px_rgb(13_59_70/0.16)] dark:border-white/10 dark:bg-[#0C2A33] dark:shadow-black/20 sm:flex sm:flex-col sm:p-6",
                    isCompactMobile
                      ? "grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-3.5"
                      : "flex flex-col p-4"
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary shadow-[0_10px_28px_rgb(13_59_70/0.08)] transition-transform duration-300 group-hover:scale-110 dark:border-accent/20 dark:bg-accent/15 dark:text-accent sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl",
                      isCompactMobile ? "h-10 w-10" : "mb-4 h-11 w-11"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", !isCompactMobile && "sm:h-7 sm:w-7")} />
                  </div>
                  <div className="min-w-0 sm:flex sm:flex-1 sm:flex-col">
                    <h3 className="text-base font-black text-slate-950 dark:text-white sm:text-xl">{card.title}</h3>
                    <p
                      className={cn(
                        "mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:mt-3 sm:block sm:text-base sm:leading-7",
                        isCompactMobile && "hidden"
                      )}
                    >
                      {card.description}
                    </p>
                    <div className={cn("mt-3 grid gap-2 sm:mt-6", isCompactMobile && "mt-2 flex flex-wrap gap-1.5 sm:grid sm:gap-2")}>
                      {card.highlights.map((item, itemIndex) => (
                        <div
                          key={item}
                          className={cn(
                            "items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200 sm:flex sm:rounded-xl sm:py-2 sm:text-sm",
                            isCompactMobile && itemIndex > 0 ? "hidden sm:flex" : "flex"
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-8 dark:bg-[#071B21] sm:py-16 lg:py-20">
        <Container>
          <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent sm:text-sm sm:tracking-[0.2em]">Portal Process</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-primary dark:text-white sm:mt-3 sm:text-4xl">
              How the Student Document Portal works.
            </h2>
          </div>

          <div className="relative grid gap-4 lg:grid-cols-4 lg:gap-5">
            <div className="absolute left-0 top-10 hidden h-px w-full bg-accent/35 lg:block" aria-hidden="true" />
            {processCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="premium-reveal relative rounded-2xl border border-slate-200 bg-[#F7F7F4] p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 dark:border-white/10 dark:bg-[#0C2A33] sm:p-5"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary shadow-lg shadow-accent/20 sm:mb-5 sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="mb-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-accent sm:mb-2 sm:text-xs sm:tracking-[0.18em]">Step {index + 1}</div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white sm:text-lg">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:mt-3 sm:text-base sm:leading-7">{card.description}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-[#0D3B46] py-8 text-white dark:bg-[#071B21] sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10">
            <div className="premium-reveal">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent sm:mb-5 sm:gap-2 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                <BookOpenCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Student Portal Advantage
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                No more waiting for documents on WhatsApp
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 sm:mt-5 sm:text-base sm:leading-8">
                Students can verify their record, check document status, and download available enrollment or admit cards directly from the secure portal.
              </p>
              <div className="mt-5 grid gap-2.5 sm:mt-7 sm:grid-cols-2 sm:gap-3">
                {portalBenefits.map((item, index) => (
                  <div
                    key={item}
                    className="premium-reveal flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 sm:rounded-2xl sm:p-4"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary sm:h-9 sm:w-9 sm:rounded-xl">
                      <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <span className="text-sm font-bold text-white sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/student-portal"
                className="premium-soft-glow mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0cf61] sm:mt-8 sm:min-h-12 sm:px-5 sm:py-3"
              >
                Open Student Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="premium-reveal hidden lg:block">
              <div className="premium-accent-sweep rounded-2xl border border-white/10 bg-[#071B21]/70 p-6 shadow-2xl shadow-black/25">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="text-xs font-mono text-slate-400">portal.zmgeducation.com</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">Fee Verification</div>
                      <div className="text-xs text-slate-400">Clear record status</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white">Board Admit Card</div>
                        <div className="text-xs text-slate-400">Ready for download</div>
                      </div>
                    </div>
                    <span className="rounded-xl bg-accent px-3 py-2 text-xs font-black text-primary">Download</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8 pb-20 sm:py-16 sm:pb-16 lg:py-20">
        <Container>
          <div className="premium-pattern overflow-hidden rounded-2xl border border-white/10 bg-[#092128] p-4 text-white shadow-2xl shadow-primary/20 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent sm:mb-4 sm:gap-2 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Z.M.G Education Solution
                </div>
                <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
                  Need help with admission or student documents?
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 sm:mt-4 sm:text-base sm:leading-8">
                  Contact Z.M.G Education Solution for Board Support, Enrollment Card Access, Admit Card Access, Fee Verification, and Student Document Portal assistance.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3 lg:justify-end">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-soft-glow inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0cf61] sm:min-h-12 sm:px-5 sm:py-3"
                >
                  Contact on WhatsApp
                  <MessageSquare className="ml-2 h-4 w-4" />
                </a>
                <Link
                  href="/student-portal"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 sm:min-h-12 sm:px-5 sm:py-3"
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
