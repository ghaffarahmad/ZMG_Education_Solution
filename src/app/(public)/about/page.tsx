import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookOpen, ShieldCheck, Target } from "lucide-react";
import { connection } from "next/server";
import { DirectorSection } from "@/components/about/DirectorSection";
import { AnimatedAboutStats } from "@/components/public/AnimatedAboutStats";
import { normalizeAboutStats, type AboutStat } from "@/lib/aboutStats";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { createSeoMetadata, pageSeo } from "@/lib/seo";

export const metadata = createSeoMetadata(pageSeo.about);

async function getAboutStats(): Promise<AboutStat[]> {
  try {
    await connectToDatabase();
    const settings = await Setting.findOne().sort({ updatedAt: -1, _id: -1 }).select("aboutStats");
    return normalizeAboutStats(settings?.aboutStats);
  } catch (error) {
    console.error("Error fetching About stats:", error);
    return normalizeAboutStats(undefined);
  }
}

export default async function AboutPage() {
  await connection();
  const aboutStats = await getAboutStats();

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F4] pt-10 pb-12 text-slate-900 dark:bg-[#092128] dark:text-white sm:pt-24 sm:pb-20">
      <Container>
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-20">
          <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:mb-6 md:text-5xl">
            About <span className="text-primary dark:text-accent">Z.M.G Education Solution</span>
          </h1>
          <p className="text-base leading-7 text-slate-600 sm:text-lg sm:leading-relaxed">
            We are a dedicated educational support service focused on simplifying the admission and documentation process for students across various boards and universities.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-12 grid grid-cols-1 items-center gap-8 sm:mb-24 lg:grid-cols-2 lg:gap-12">
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-slate-100 sm:-inset-4 sm:-rotate-2" />
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl sm:rounded-3xl sm:p-8 md:p-12">
              <h3 className="mb-4 flex items-center text-xl font-bold text-slate-900 sm:mb-6 sm:text-2xl">
                <Target className="mr-2.5 h-5 w-5 text-accent sm:mr-3 sm:h-6 sm:w-6" />
                Our Mission
              </h3>
              <p className="mb-4 text-sm leading-7 text-slate-600 sm:mb-6 sm:text-base sm:leading-relaxed">
                Our mission is to provide seamless, transparent, and efficient support for students navigating the complexities of board admissions and university enrollments. We believe that administrative hurdles should never stand in the way of a student&apos;s education.
              </p>
              <p className="text-sm leading-7 text-slate-600 sm:text-base sm:leading-relaxed">
                By digitizing document access and providing expert guidance, we ensure that every student has the support they need to succeed in their academic journey without the stress of missing deadlines or lost paperwork.
              </p>
            </div>
          </div>
          <div className="order-1 space-y-5 lg:order-2 lg:space-y-6">
            <SectionHeading 
              title="Simplifying Educational Administration" 
              alignment="left"
              className="mb-0"
            />
            <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
              {[
                { title: "Digital Convenience", desc: "Access your crucial documents anytime through our secure portal." },
                { title: "Expert Guidance", desc: "Navigating complex board requirements with professional support." },
                { title: "Transparent Processing", desc: "Clear tracking of your fee status and document availability." }
              ].map((item, idx) => (
                <div key={idx} className="flex rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                  <ShieldCheck className="mr-3 h-5 w-5 flex-shrink-0 text-primary sm:mr-4 sm:h-6 sm:w-6" />
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What We Support */}
        <div className="mb-12 sm:mb-24">
          <SectionHeading 
            title="What We Support" 
            subtitle="Our expertise covers major educational boards and university programs in the region."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-shadow sm:p-8 sm:hover:shadow-md">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 sm:mb-6 sm:h-16 sm:w-16">
                <BookOpen className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
              <h4 className="mb-2 text-lg font-bold text-slate-900 sm:mb-3 sm:text-xl">Karachi Board</h4>
              <p className="text-sm leading-6 text-slate-600 sm:text-base">Complete support for matriculation and intermediate programs under BSEK and BIEK.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-shadow sm:p-8 sm:hover:shadow-md">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 sm:mb-6 sm:h-16 sm:w-16">
                <BookOpen className="h-6 w-6 text-accent sm:h-8 sm:w-8" />
              </div>
              <h4 className="mb-2 text-lg font-bold text-slate-900 sm:mb-3 sm:text-xl">Ziauddin Board</h4>
              <p className="text-sm leading-6 text-slate-600 sm:text-base">Specialized assistance for students enrolled in Ziauddin Examination Board programs.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-shadow sm:p-8 sm:hover:shadow-md">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 sm:mb-6 sm:h-16 sm:w-16">
                <BookOpen className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
              </div>
              <h4 className="mb-2 text-lg font-bold text-slate-900 sm:mb-3 sm:text-xl">AIOU Programs</h4>
              <p className="text-sm leading-6 text-slate-600 sm:text-base">Guidance for Allama Iqbal Open University admissions including BS, ADC, and BBA.</p>
            </div>
          </div>
        </div>

        <DirectorSection />

        {/* Trust Blocks */}
        <div className="premium-accent-sweep rounded-2xl border border-[#D4AF37]/25 bg-[#092128] p-3 shadow-[0_24px_80px_rgb(13_59_70/0.22)] sm:rounded-3xl sm:p-5 md:p-8 dark:border-[#E5C354]/20 dark:bg-[#071B21] dark:shadow-black/25">
          <div className="rounded-[1.1rem] border border-white/10 bg-[linear-gradient(135deg,rgb(255_255_255/0.08),rgb(255_255_255/0.02))] p-2 backdrop-blur sm:rounded-2xl sm:p-3">
            <AnimatedAboutStats stats={aboutStats} />
          </div>
        </div>
      </Container>
    </div>
  );
}
