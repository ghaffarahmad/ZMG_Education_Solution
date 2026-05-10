import {
  DocumentCardSkeleton,
  SkeletonBlock,
  SkeletonButton,
  SkeletonCard,
  SkeletonLine,
} from "@/components/ui/Skeleton";

export function StudentDashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading verified student dashboard" className="content-fade-in space-y-5 pb-16 sm:space-y-6 sm:pb-0">
      <section className="premium-pattern overflow-hidden rounded-2xl bg-primary p-4 shadow-2xl shadow-primary/20 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <SkeletonBlock className="h-12 w-12 shrink-0 rounded-2xl bg-white/15 sm:h-14 sm:w-14" />
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonLine className="h-4 w-36 bg-white/15" />
              <SkeletonLine className="h-8 w-64 max-w-full bg-white/15 sm:h-10" />
              <SkeletonLine className="w-full max-w-lg bg-white/15" />
              <SkeletonBlock className="h-10 w-full max-w-md rounded-2xl bg-white/15 sm:rounded-full" />
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2">
              <SkeletonBlock className="h-8 w-32 rounded-full bg-white/15" />
              <SkeletonBlock className="h-8 w-36 rounded-full bg-white/15" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SkeletonButton className="h-10 w-full bg-white/15 sm:w-36" />
              <SkeletonButton className="h-10 w-full bg-white/15 sm:w-28" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-5 sm:space-y-6">
          <SkeletonCard className="p-4 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <SkeletonBlock className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <SkeletonLine className="h-6 w-48" />
                <SkeletonLine className="w-64 max-w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20 rounded-xl" />
              ))}
            </div>
          </SkeletonCard>

          <SkeletonCard className="p-4 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <SkeletonBlock className="h-11 w-11 rounded-xl" />
                <div className="space-y-2">
                  <SkeletonLine className="h-6 w-44" />
                  <SkeletonLine className="w-56" />
                </div>
              </div>
              <SkeletonButton className="hidden h-10 w-36 sm:block" />
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
            </div>
          </SkeletonCard>
        </div>

        <SkeletonCard className="p-4 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <SkeletonBlock className="h-11 w-11 rounded-xl" />
              <div className="space-y-2">
                <SkeletonLine className="h-6 w-36" />
                <SkeletonLine className="w-52" />
              </div>
            </div>
            <SkeletonBlock className="h-8 w-24 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 rounded-xl" />
            ))}
          </div>
          <SkeletonBlock className="mt-6 h-24 rounded-2xl" />
          <SkeletonBlock className="mt-5 h-28 rounded-xl" />
        </SkeletonCard>
      </div>

      <SkeletonCard className="p-4 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <SkeletonBlock className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <SkeletonLine className="h-6 w-32" />
              <SkeletonLine className="w-64 max-w-full" />
            </div>
          </div>
          <SkeletonButton className="hidden h-10 w-36 sm:block" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DocumentCardSkeleton />
          <DocumentCardSkeleton />
          <DocumentCardSkeleton />
        </div>
      </SkeletonCard>
    </div>
  );
}
