import { SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading admin page" className="content-fade-in space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonLine className="h-7 w-56" />
          <SkeletonLine className="w-72 max-w-full" />
        </div>
        <SkeletonButton className="h-11 w-full sm:w-40" />
      </div>

      <SkeletonCard className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-10 rounded-lg" />
          ))}
        </div>
      </SkeletonCard>

      <SkeletonCard className="overflow-hidden p-0">
        <div className="hidden md:block">
          <div className="grid grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-[#092128]">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLine key={index} className="w-24" />
            ))}
          </div>
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-4 px-4 py-4">
                {Array.from({ length: 5 }).map((__, index) => (
                  <SkeletonLine key={index} className={index === 4 ? "ml-auto w-16" : "w-full"} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 p-3 md:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
