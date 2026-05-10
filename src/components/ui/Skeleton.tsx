import * as React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function SkeletonBlock({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton-shimmer skeleton-surface rounded-lg", className)}
      {...props}
    />
  );
}

export function SkeletonLine({ className, ...props }: SkeletonProps) {
  return <SkeletonBlock className={cn("h-3.5 rounded-full", className)} {...props} />;
}

export function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return <SkeletonBlock className={cn("h-11 w-11 rounded-full", className)} {...props} />;
}

export function SkeletonButton({ className, ...props }: SkeletonProps) {
  return <SkeletonBlock className={cn("h-11 rounded-xl", className)} {...props} />;
}

export function SkeletonCard({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c2a33] sm:p-5",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="space-y-4">
          <SkeletonBlock className="h-28 rounded-xl" />
          <div className="space-y-2.5">
            <SkeletonLine className="w-3/4" />
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-2/3" />
          </div>
        </div>
      )}
    </div>
  );
}

export function PageSectionSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading page content"
      className={cn("space-y-5 p-4 sm:space-y-6 sm:p-6", className)}
      {...props}
    >
      <div className="space-y-3">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-8 w-4/5 max-w-xl" />
        <SkeletonLine className="w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </section>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
  className,
  ...props
}: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn("overflow-hidden rounded-xl border border-slate-200 dark:border-white/10", className)}
      {...props}
    >
      <div className="hidden md:block">
        <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-[#092128]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <SkeletonLine key={index} className="h-3 w-20" />
          ))}
        </div>
        <div className="divide-y divide-slate-200 bg-white dark:divide-white/10 dark:bg-[#0c2a33]">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid gap-4 px-4 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <SkeletonLine
                  key={columnIndex}
                  className={cn("h-4", columnIndex === 0 ? "w-28" : columnIndex === columns - 1 ? "ml-auto w-16" : "w-full")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-3 md:hidden">
        {Array.from({ length: Math.min(rows, 4) }).map((_, index) => (
          <StudentCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function StudentCardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <SkeletonCard className={cn("p-4", className)} {...props}>
      <div className="flex items-start gap-3">
        <SkeletonAvatar className="h-10 w-10 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="h-4 w-3/4" />
              <SkeletonLine className="w-1/2" />
            </div>
            <SkeletonBlock className="h-7 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-14 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <SkeletonButton className="h-10" />
            <SkeletonButton className="h-10" />
            <SkeletonButton className="h-10" />
          </div>
        </div>
      </div>
    </SkeletonCard>
  );
}

export function NoticeCardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <SkeletonCard className={cn("overflow-hidden p-0", className)} {...props}>
      <SkeletonBlock className="h-36 rounded-none sm:aspect-video sm:h-auto" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex gap-2">
          <SkeletonBlock className="h-7 w-24 rounded-full" />
          <SkeletonBlock className="h-7 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-5 w-5/6" />
          <SkeletonLine className="h-5 w-2/3" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-3/4" />
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/10">
          <SkeletonLine className="w-28" />
          <SkeletonButton className="h-9 w-24" />
        </div>
      </div>
    </SkeletonCard>
  );
}

export function DocumentCardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <SkeletonCard className={cn("p-4 sm:p-5", className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <SkeletonAvatar className="h-12 w-12 rounded-xl" />
        <SkeletonBlock className="h-8 w-32 rounded-full" />
      </div>
      <div className="mt-5 space-y-2">
        <SkeletonLine className="h-5 w-2/3" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-4/5" />
      </div>
      <div className="mt-5 space-y-2">
        <SkeletonBlock className="h-20 rounded-xl" />
        <SkeletonBlock className="h-16 rounded-xl" />
      </div>
      <SkeletonButton className="mt-5 h-11 w-full" />
    </SkeletonCard>
  );
}
