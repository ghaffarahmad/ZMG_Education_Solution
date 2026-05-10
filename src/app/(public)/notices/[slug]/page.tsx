import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { createNoIndexMetadata, createSeoMetadata } from "@/lib/seo";

async function getNotice(slug: string) {
  try {
    await connectToDatabase();
    const notice = await Notice.findOne({ slug, status: "published" });
    if (!notice) return null;
    return JSON.parse(JSON.stringify(notice));
  } catch (error) {
    console.error("Error fetching notice:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const notice = await getNotice(slug);

  if (!notice) {
    return createNoIndexMetadata("Notice Not Found | Z.M.G Education Solution");
  }

  return createSeoMetadata({
    title: `${notice.title} | Z.M.G Education Solution`,
    description: notice.shortDescription,
    path: `/notices/${notice.slug}`,
    image: notice.imageUrl,
  });
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const notice = await getNotice(slug);

  if (!notice) {
    notFound();
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-black text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200">
            <AlertCircle className="mr-2 h-4 w-4" /> Urgent Notice
          </span>
        );
      case "important":
        return (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-black text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/15 dark:text-amber-200">
            <AlertTriangle className="mr-2 h-4 w-4" /> Important
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-black text-primary dark:border-accent/35 dark:bg-accent/15 dark:text-accent">
            <ShieldCheck className="mr-2 h-4 w-4" /> Official Notice
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0D3B46_0%,#103743_48%,#071B21_100%)] py-12 text-white sm:py-16">
        <div className="premium-pattern absolute inset-0 opacity-55" aria-hidden="true" />
        <Container className="relative">
          <Link
            href="/notices"
            className="mb-8 inline-flex min-h-10 items-center rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:border-accent/80 hover:bg-white/15"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notice Board
          </Link>

          <div className="max-w-5xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {getPriorityBadge(notice.priority)}
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-black uppercase tracking-[0.16em] text-slate-100">
                <Tag className="mr-1.5 h-3.5 w-3.5 text-accent" />
                {notice.category.replace("_", " ")}
              </span>
            </div>

            <h1 className="max-w-5xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {notice.title}
            </h1>

            <div className="mt-6 flex items-center text-sm font-bold text-slate-300">
              <Calendar className="mr-2 h-4 w-4 text-accent" />
              Published: {new Date(notice.createdAt).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="premium-card-line rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_22px_80px_rgb(13_59_70/0.08)] dark:border-white/10 dark:bg-[#0C2A33] sm:p-8">
              {notice.imageUrl ? (
                <div className="relative mx-auto mb-8 aspect-video max-h-[460px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#F7F7F4] dark:border-white/10 dark:bg-[#092128]">
                  <Image
                    src={notice.imageUrl}
                    alt={notice.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-contain p-3"
                    preload
                  />
                </div>
              ) : (
                <div className="premium-pattern mb-8 flex aspect-video max-h-[360px] w-full items-center justify-center rounded-2xl bg-primary">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-accent">
                    <FileText className="h-10 w-10" />
                  </div>
                </div>
              )}

              <p className="mb-8 rounded-2xl border-l-4 border-accent bg-[#F7F7F4] p-5 text-lg font-bold leading-relaxed text-slate-700 dark:bg-[#092128] dark:text-slate-200 md:text-xl">
                {notice.shortDescription}
              </p>

              <div className="prose prose-slate mb-12 max-w-none whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                {notice.fullContent}
              </div>

              {notice.linkUrl && (
                <div className="premium-pattern mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-primary p-6 text-white sm:flex-row sm:items-center md:p-8">
                  <div>
                    <h3 className="text-xl font-black text-white">Take Action</h3>
                    <p className="mt-2 leading-7 text-slate-200">Please visit the provided link for more details or to complete your process.</p>
                  </div>
                  <a
                    href={notice.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-soft-glow inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-black text-primary transition-all hover:-translate-y-0.5 hover:bg-[#f0cf61] sm:w-auto"
                  >
                    {notice.linkLabel || "Open External Link"}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              )}
            </article>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgb(13_59_70/0.08)] dark:border-white/10 dark:bg-[#0C2A33]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">Notice Details</h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Category", notice.category.replace("_", " ")],
                  ["Priority", notice.priority],
                  ["Published", new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-[#F7F7F4] p-4 dark:border-white/10 dark:bg-[#092128]">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">{label}</p>
                    <p className="mt-1 font-bold capitalize text-slate-800 dark:text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}
