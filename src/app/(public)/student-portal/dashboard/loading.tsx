import { Container } from "@/components/ui/Container";
import { StudentDashboardSkeleton } from "@/components/student-portal/StudentDashboardSkeleton";

export default function StudentPortalDashboardLoading() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] py-6 sm:py-10 md:py-16">
      <Container>
        <StudentDashboardSkeleton />
      </Container>
    </div>
  );
}
