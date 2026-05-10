import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SkeletonBlock, SkeletonButton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";

export default function NoticeDetailLoading() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section className="bg-[linear-gradient(135deg,#0D3B46_0%,#103743_48%,#071B21_100%)] py-12 text-white sm:py-16">
        <Container>
          <Link
            href="/notices"
            className="mb-8 inline-flex min-h-10 items-center rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notice Board
          </Link>
          <div className="max-w-5xl space-y-5">
            <div className="flex flex-wrap gap-3">
              <SkeletonBlock className="h-8 w-36 rounded-full bg-white/15" />
              <SkeletonBlock className="h-8 w-28 rounded-full bg-white/15" />
            </div>
            <SkeletonLine className="h-11 w-full max-w-4xl bg-white/15 sm:h-16" />
            <SkeletonLine className="h-11 w-4/5 max-w-3xl bg-white/15 sm:h-16" />
            <SkeletonLine className="w-52 bg-white/15" />
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <SkeletonCard className="p-5 sm:p-8">
              <SkeletonBlock className="aspect-video w-full rounded-2xl" />
              <SkeletonBlock className="mt-8 h-28 rounded-2xl" />
              <div className="mt-8 space-y-3">
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-5/6" />
                <SkeletonLine className="w-2/3" />
              </div>
              <SkeletonButton className="mt-10 h-12 w-full sm:w-44" />
            </SkeletonCard>
            <SkeletonCard className="h-fit p-5">
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
              <SkeletonLine className="mt-5 h-6 w-44" />
              <div className="mt-5 space-y-3">
                <SkeletonBlock className="h-20 rounded-2xl" />
                <SkeletonBlock className="h-20 rounded-2xl" />
                <SkeletonBlock className="h-20 rounded-2xl" />
              </div>
            </SkeletonCard>
          </div>
        </Container>
      </section>
    </div>
  );
}
