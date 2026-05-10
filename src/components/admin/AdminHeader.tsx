"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Menu } from "lucide-react";

export function AdminHeader({
  isSidebarOpen,
  isDesktopCollapsed,
  menuButtonRef,
  toggleMobileSidebar,
  toggleDesktopSidebar,
}: {
  isSidebarOpen?: boolean;
  isDesktopCollapsed?: boolean;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
  toggleMobileSidebar?: () => void;
  toggleDesktopSidebar?: () => void;
}) {
  return (
    <header className="sticky top-0 z-[120] flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 dark:border-white/10 dark:bg-[#092128] sm:h-16 sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Mobile toggle button */}
        <button
          ref={menuButtonRef}
          onClick={toggleMobileSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-accent md:hidden"
          aria-label={isSidebarOpen ? "Close admin menu" : "Open admin menu"}
          aria-expanded={Boolean(isSidebarOpen)}
          aria-controls="admin-mobile-sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Desktop toggle button */}
        <button
          onClick={toggleDesktopSidebar}
          className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-accent"
          aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="truncate text-base font-semibold text-gray-800 dark:text-white sm:text-xl">Z.M.G Management</h2>
      </div>
      <div className="flex shrink-0 items-center">
        <ThemeToggle />
      </div>
    </header>
  );
}
