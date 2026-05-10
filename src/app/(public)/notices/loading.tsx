import { Container } from "@/components/ui/Container";
import { NoticeCardSkeleton, SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";

export default function NoticesLoading() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section className="bg-[linear-gradient(135deg,#0D3B46_0%,#103743_48%,#071B21_100%)] py-10 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)] lg:gap-10">
            <div className="space-y-4">
              <SkeletonBlock className="h-9 w-40 rounded-full bg-white/15" />
              <SkeletonLine className="h-12 w-72 bg-white/15 sm:h-16" />
              <SkeletonLine className="w-full max-w-3xl bg-white/15" />
              <SkeletonLine className="w-4/5 max-w-2xl bg-white/15" />
              <div className="flex flex-wrap gap-2 pt-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-9 w-32 rounded-full bg-white/15" />
                ))}
              </div>
            </div>
            <SkeletonCard className="border-white/15 bg-white/10">
              <SkeletonLine className="h-4 w-36 bg-white/15" />
              <SkeletonLine className="mt-3 h-7 w-48 bg-white/15" />
              <div className="mt-5 grid gap-3">
                <SkeletonBlock className="h-14 rounded-xl bg-white/15" />
                <SkeletonBlock className="h-14 rounded-xl bg-white/15" />
                <SkeletonBlock className="h-14 rounded-xl bg-white/15" />
              </div>
            </SkeletonCard>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-16 lg:py-20">
        <Container>
          <SkeletonCard className="mb-5 p-3 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
              <SkeletonBlock className="h-12 rounded-xl" />
              <SkeletonBlock className="h-12 rounded-xl" />
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <SkeletonLine className="w-48" />
              <SkeletonButton className="h-10 w-32" />
            </div>
          </SkeletonCard>
          <div className="mb-5 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-9 w-28 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <NoticeCardSkeleton key={index} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
