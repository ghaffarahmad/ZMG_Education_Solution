import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SkeletonBlock, SkeletonButton, SkeletonLine } from "@/components/ui/Skeleton";

export function StudentPortalVerifySkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] py-6 sm:py-10 md:py-16">
      <Container>
        <div
          aria-busy="true"
          aria-label="Loading student verification form"
          className="mx-auto w-full max-w-md content-soft-rise"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <SkeletonLine className="h-7 w-52 max-w-full" />
              <SkeletonLine className="mt-3 h-4 w-64 max-w-full" />
            </div>

            <div className="space-y-5">
              <div>
                <SkeletonLine className="mb-2 h-4 w-36" />
                <SkeletonBlock className="h-12 w-full rounded-xl" />
              </div>

              <div>
                <SkeletonLine className="mb-2 h-4 w-28" />
                <SkeletonBlock className="h-12 w-full rounded-xl" />
              </div>

              <SkeletonButton className="h-12 w-full rounded-xl" />
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div className="mx-auto max-w-sm space-y-2">
                <SkeletonLine className="mx-auto h-3 w-full" />
                <SkeletonLine className="mx-auto h-3 w-11/12" />
                <SkeletonLine className="mx-auto h-3 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
