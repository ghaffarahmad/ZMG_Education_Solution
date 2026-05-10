import { createSeoMetadata, pageSeo } from "@/lib/seo";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { Wrench } from "lucide-react";

export const metadata = createSeoMetadata(pageSeo.studentPortal);

export default async function StudentPortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let isMaintenance = false;
  let maintenanceMsg = "The portal is currently undergoing maintenance. Please check back later.";

  try {
    await connectToDatabase();
    const settings = await Setting.findOne().sort({ updatedAt: -1, _id: -1 }).select("maintenanceMode maintenanceMessage");
    if (settings?.maintenanceMode) {
      isMaintenance = true;
      if (settings.maintenanceMessage) {
        maintenanceMsg = settings.maintenanceMessage;
      }
    }
  } catch (error) {
    console.error("Failed to check maintenance mode:", error);
  }

  if (isMaintenance) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 text-accent shadow-sm">
          <Wrench className="h-12 w-12" />
        </div>
        <h1 className="mb-4 text-3xl font-black tracking-tight text-primary dark:text-white sm:text-5xl">Portal Under Maintenance</h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {maintenanceMsg}
        </p>
      </div>
    );
  }

  return children;
}
