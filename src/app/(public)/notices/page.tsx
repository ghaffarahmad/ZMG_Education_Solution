import { Bell, FileText, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { NoticesClient } from "./NoticesClient";
import { createSeoMetadata, pageSeo } from "@/lib/seo";

export const metadata = createSeoMetadata(pageSeo.notices);

const noticeDeskItems = [
  { label: "Search notices", icon: Search },
  { label: "Read official details", icon: FileText },
  { label: "Secure access guidance", icon: ShieldCheck },
];

async function getPublishedNotices() {
  try {
    await connectToDatabase();
    const notices = await Notice.find({ status: "published" })
      .sort({ pinToTop: -1, createdAt: -1 });
    return JSON.parse(JSON.stringify(notices));
  } catch (error) {
    console.error("Error fetching notices:", error);
    return [];
  }
}

export default async function NoticesPage() {
  const notices = await getPublishedNotices();

  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0D3B46_0%,#103743_48%,#071B21_100%)] py-10 text-white sm:py-20 lg:py-24">
        <div className="premium-pattern absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="absolute left-6 top-12 h-28 w-px rotate-12 bg-accent/40" aria-hidden="true" />
        <div className="absolute bottom-10 right-10 h-px w-44 -rotate-12 bg-accent/35" aria-hidden="true" />

        <Container className="relative">
          <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)] lg:gap-10">
            <div className="premium-fade-up max-w-4xl">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent sm:mb-5 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Official Updates
              </div>
              <h1 className="text-[2rem] font-black tracking-tight text-white min-[390px]:text-[2.15rem] sm:text-5xl lg:text-7xl">
                Notice Board
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:mt-6 sm:text-lg sm:leading-8">
                Stay informed with professional announcements for Admission Support, Board Support, Fee Verification, Enrollment Card Access, Admit Card Access, and Student Document Portal updates.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-2.5">
                {["Admission Support", "Board Support", "Fee Verification", "Student Portal"].map((chip, index) => (
                  <span
                    key={chip}
                    className="premium-fade-up inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/10 px-3 text-xs font-bold text-slate-100 backdrop-blur sm:min-h-9 sm:px-3.5 sm:text-sm"
                    style={{ animationDelay: `${120 + index * 70}ms` }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="premium-slide-in">
              <div className="premium-accent-sweep rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-6">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 sm:gap-5 sm:pb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent sm:text-xs sm:tracking-[0.2em]">Live Notice Desk</p>
                    <h2 className="mt-1.5 text-xl font-black text-white sm:mt-2 sm:text-2xl">{notices.length} Published Updates</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Search, filter, and open important updates in one place.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary sm:h-12 sm:w-12 sm:rounded-2xl">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
                  {noticeDeskItems.map((item) => {
                    const Icon = item.icon;

                    return (
                    <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 sm:rounded-2xl">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent sm:h-10 sm:w-10 sm:rounded-xl">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>
                      <span className="text-sm font-bold text-white">{item.label}</span>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-16 lg:py-20">
        <Container>
          <NoticesClient initialNotices={notices} />
        </Container>
      </section>
    </div>
  );
}
