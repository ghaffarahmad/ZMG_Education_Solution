"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh overflow-x-hidden bg-gray-50 dark:bg-gray-900">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isDesktopCollapsed={isDesktopCollapsed} restoreFocusRef={menuButtonRef} />
      <div className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          isSidebarOpen={isSidebarOpen}
          isDesktopCollapsed={isDesktopCollapsed}
          menuButtonRef={menuButtonRef}
          toggleMobileSidebar={() => setIsSidebarOpen((current) => !current)}
          toggleDesktopSidebar={() => setIsDesktopCollapsed((current) => !current)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
