import { PageSectionSkeleton, SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function PublicLoading() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section className="bg-[linear-gradient(135deg,#0D3B46_0%,#103743_48%,#071B21_100%)] py-10 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-center">
            <div className="space-y-4">
              <SkeletonBlock className="h-9 w-40 rounded-full bg-white/15" />
              <SkeletonLine className="h-10 w-4/5 max-w-2xl bg-white/15" />
              <SkeletonLine className="h-10 w-2/3 max-w-xl bg-white/15" />
              <div className="space-y-2 pt-2">
                <SkeletonLine className="w-full max-w-2xl bg-white/15" />
                <SkeletonLine className="w-4/5 max-w-xl bg-white/15" />
              </div>
              <div className="flex gap-2 pt-3">
                <SkeletonButton className="h-11 w-36 bg-white/15" />
                <SkeletonButton className="h-11 w-32 bg-white/15" />
              </div>
            </div>
            <SkeletonCard className="border-white/15 bg-white/10 p-5">
              <SkeletonLine className="h-4 w-40 bg-white/15" />
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
      <PageSectionSkeleton className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" />
    </div>
  );
}
