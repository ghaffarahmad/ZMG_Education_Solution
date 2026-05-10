import Link from "next/link";
import Image from "next/image";
import { AlertCircle, AlertTriangle, ArrowRight, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoticeCardProps {
  notice: {
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
  };
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200";
      case "important":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/15 dark:text-amber-200";
      default:
        return "border-accent/30 bg-accent/10 text-primary dark:border-accent/35 dark:bg-accent/15 dark:text-accent";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />;
      case "important":
        return <AlertTriangle className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />;
      default:
        return null;
    }
  };

  return (
    <article className="premium-card-line premium-reveal group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_14px_45px_rgb(13_59_70/0.07)] transition-all duration-300 sm:rounded-2xl sm:shadow-[0_20px_70px_rgb(13_59_70/0.08)] sm:hover:-translate-y-2 sm:hover:border-accent/70 sm:hover:shadow-[0_28px_90px_rgb(13_59_70/0.16)] dark:border-white/10 dark:bg-[#0C2A33] dark:shadow-black/20">
      {notice.imageUrl ? (
        <div className="relative h-36 w-full overflow-hidden bg-[#F7F7F4] min-[390px]:h-40 sm:h-auto sm:aspect-video dark:bg-[#092128]">
          <Image
            src={notice.imageUrl}
            alt={notice.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-2 transition-transform duration-500 sm:p-3 sm:group-hover:scale-[1.025]"
          />
        </div>
      ) : (
        <div className="premium-pattern flex h-32 w-full items-center justify-center overflow-hidden border-b border-slate-200 bg-primary sm:h-auto sm:aspect-video dark:border-white/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-accent shadow-lg shadow-black/10 backdrop-blur sm:h-16 sm:w-16 sm:rounded-2xl">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:mb-4 sm:gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.16em] dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            {notice.category.replace("_", " ")}
          </span>
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.16em]", getPriorityClasses(notice.priority))}>
            {getPriorityIcon(notice.priority)}
            {notice.priority}
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-black leading-tight text-slate-950 transition-colors sm:mb-3 sm:text-xl sm:group-hover:text-primary dark:text-white dark:sm:group-hover:text-accent">
          <Link href={`/notices/${notice.slug}`} className="focus:outline-none">
            {notice.title}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-600 sm:mb-6 sm:line-clamp-3 dark:text-slate-300">
          {notice.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-3 sm:pt-4 dark:border-white/10">
          <div className="flex min-w-0 items-center text-xs font-bold text-slate-500 dark:text-slate-300">
            <Calendar className="mr-1.5 h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" />
            <span className="truncate">
              {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>

          <Link
            href={`/notices/${notice.slug}`}
            className="inline-flex min-h-8 shrink-0 items-center justify-center rounded-lg bg-primary px-2.5 text-xs font-black text-white transition-all duration-300 sm:min-h-9 sm:rounded-xl sm:px-3 sm:text-sm sm:group-hover:bg-accent sm:group-hover:text-primary dark:bg-accent dark:text-primary"
          >
            {notice.linkLabel || "Read More"}
            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 sm:group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
