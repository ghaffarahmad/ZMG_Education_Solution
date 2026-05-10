"use client";

import { useEffect, useState, type FocusEvent } from "react";
import Link from "next/link";
import { AlertCircle, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCleanPublicNotices, PUBLIC_NOTICE_FALLBACK_TITLE } from "@/lib/publicNoticeDisplay";

interface TickerNotice {
  _id: string;
  title: string;
  slug: string;
  priority?: "normal" | "important" | "urgent";
  linkUrl?: string;
  linkLabel?: string;
}

interface ResolvedTickerNotice extends TickerNotice {
  href: string;
  isExternal: boolean;
}

function fallbackNoticeHref(notice: TickerNotice) {
  const slug = notice.slug.trim();
  return slug ? `/notices/${encodeURIComponent(slug)}` : "/notices";
}

function isLocalhostUrl(url: URL) {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
}

function resolveTickerNotice(notice: TickerNotice): ResolvedTickerNotice {
  const fallbackHref = fallbackNoticeHref(notice);
  const linkUrl = notice.linkUrl?.trim();

  if (linkUrl) {
    if (linkUrl.startsWith("/") && !linkUrl.startsWith("//")) {
      return { ...notice, href: linkUrl, isExternal: false };
    }

    if (linkUrl.startsWith("https://")) {
      try {
        const externalUrl = new URL(linkUrl);

        if (!isLocalhostUrl(externalUrl)) {
          return { ...notice, href: externalUrl.toString(), isExternal: true };
        }
      } catch {
        // Fall back to the notice page when a custom URL is not usable.
      }
    }
  }

  return { ...notice, href: fallbackHref, isExternal: false };
}

function PriorityIcon({ priority }: { priority?: TickerNotice["priority"] }) {
  if (priority === "urgent") {
    return <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-300 sm:h-4 sm:w-4" />;
  }

  if (priority === "important") {
    return <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-300 sm:h-4 sm:w-4" />;
  }

  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent sm:h-2 sm:w-2" aria-hidden="true" />;
}

function TickerAction({ notice, className }: { notice: ResolvedTickerNotice; className?: string }) {
  const label = "Read More";
  const classes = cn(
    "pointer-events-auto z-20 inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-1 text-[10px] font-extrabold leading-none text-accent transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:h-8 sm:border sm:border-accent/75 sm:bg-accent sm:px-2.5 sm:text-xs sm:text-primary sm:shadow-sm sm:shadow-black/10 sm:hover:bg-white sm:hover:text-primary",
    className
  );

  if (notice.isExternal) {
    return (
      <a
        href={notice.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={`${label} for ${notice.title} (opens in a new tab)`}
      >
        <span className="sm:hidden">Open</span>
        <span className="hidden sm:inline">{label}</span>
        <ChevronRight className="ml-0.5 h-2.5 w-2.5 shrink-0 sm:ml-1 sm:h-3.5 sm:w-3.5" />
      </a>
    );
  }

  return (
    <Link href={notice.href} className={classes} aria-label={`${label} for ${notice.title}`}>
      <span className="sm:hidden">Open</span>
      <span className="hidden sm:inline">{label}</span>
      <ChevronRight className="ml-0.5 h-2.5 w-2.5 shrink-0 sm:ml-1 sm:h-3.5 sm:w-3.5" />
    </Link>
  );
}

function TickerMessage({ notice, isPaused }: { notice: ResolvedTickerNotice; isPaused: boolean }) {
  return (
    <div
      className="pointer-events-auto relative flex h-6 min-w-0 flex-1 items-center overflow-hidden rounded-md border border-white/10 bg-white/10 shadow-inner shadow-black/10 sm:h-8"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={cn(
          "animate-marquee flex min-w-max items-center whitespace-nowrap pl-2 text-[11px] text-white sm:pl-3 sm:text-sm",
          isPaused && "pause"
        )}
      >
        {[0, 1].map((index) => (
          <span key={index} className="flex items-center gap-1.5 pr-7 font-semibold leading-5 sm:gap-2 sm:pr-12">
            <PriorityIcon priority={notice.priority} />
            <span>{notice.title}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function NoticeTicker() {
  const [notices, setNotices] = useState<TickerNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchTickerNotices = async () => {
      try {
        const res = await fetch("/api/notices/public?ticker=true");
        if (res.ok) {
          const data = await res.json();
          setNotices(getCleanPublicNotices(data.data || []));
        }
      } catch (error) {
        console.error("Failed to fetch ticker notices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickerNotices();
  }, []);

  useEffect(() => {
    if (notices.length <= 1 || isPaused) return;

    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      setActiveIndex((currentIndex) => (currentIndex + 1) % notices.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [isPaused, notices.length]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocusTarget = event.relatedTarget;

    if (!(nextFocusTarget instanceof Node) || !event.currentTarget.contains(nextFocusTarget)) {
      setIsPaused(false);
    }
  };

  const fallbackNotice: ResolvedTickerNotice = {
    _id: "latest-notices-fallback",
    title: PUBLIC_NOTICE_FALLBACK_TITLE,
    slug: "",
    priority: "normal",
    href: "/notices",
    isExternal: false,
  };
  const resolvedNotices = notices.length > 0 ? notices.map(resolveTickerNotice) : [fallbackNotice];
  const activeNotice = loading ? fallbackNotice : resolvedNotices[activeIndex % resolvedNotices.length] || fallbackNotice;

  return (
    <div
      className="pointer-events-auto relative z-40 w-screen max-w-full overflow-hidden border-b border-white/10 bg-primary text-white shadow-sm"
      role="region"
      aria-label="Latest updates"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={handleBlur}
    >
      <div className="relative mx-auto grid min-h-8 w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 px-2 py-1 sm:min-h-10 sm:gap-3 sm:px-6 lg:px-8">
        <div className="relative z-10 inline-flex h-5 shrink-0 items-center rounded-md border border-accent/35 bg-accent/15 px-1.5 text-[8px] font-black uppercase tracking-[0.1em] text-accent shadow-sm shadow-black/10 sm:h-8 sm:border-white/20 sm:bg-accent sm:px-2.5 sm:text-[11px] sm:text-primary">
          <Zap className="mr-1.5 hidden h-3.5 w-3.5 shrink-0 sm:block" />
          <span>Latest</span>
        </div>

        <TickerMessage notice={activeNotice} isPaused={isPaused} />

        <TickerAction notice={activeNotice} />
      </div>
    </div>
  );
}
