"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, Bell, MessageSquare, LayoutDashboard, Settings, LogOut, X, Globe2, GraduationCap, User } from "lucide-react";
import Image from "next/image";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Notices", href: "/admin/notices", icon: Bell },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Academic Settings", href: "/admin/academic-settings", icon: GraduationCap },
  { name: "Profile", href: "/admin/profile", icon: User },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

type AdminSidebarProps = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isDesktopCollapsed?: boolean;
  restoreFocusRef?: React.RefObject<HTMLElement | null>;
};

export function AdminSidebar({ isOpen, setIsOpen, isDesktopCollapsed = false, restoreFocusRef }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const sidebarContent = (isMobileView: boolean) => {
    const collapsed = !isMobileView && isDesktopCollapsed;
    
    return (
    <>
      <div className={`flex h-14 shrink-0 items-center border-b border-slate-200 dark:border-white/10 sm:h-16 ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className={`flex min-w-0 items-center ${collapsed ? '' : 'gap-2'}`}>
          <div className="relative h-10 w-10 shrink-0">
            <Image src="/lightlogo1.png" alt="Logo" fill className="block object-contain dark:hidden" />
            <Image src="/darklogo1.png" alt="Logo" fill className="hidden object-contain dark:block" />
          </div>
          <span className={`text-base font-bold text-[var(--primary)] dark:text-white sm:text-lg overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Admin Panel</span>
        </Link>
        {isMobileView && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-accent"
            aria-label="Close admin menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                onClick={() => setIsOpen(false)}
                className={`flex min-h-10 items-center rounded-lg transition-colors ${collapsed ? 'justify-center p-2.5 mx-auto' : 'px-3 py-2.5'} text-sm font-medium ${
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-sm dark:bg-accent dark:text-[#092128]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${collapsed ? 'mr-0' : 'mr-3'} ${isActive ? "text-[var(--accent)] dark:text-[#092128]" : "text-gray-400 dark:text-gray-500"}`} />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`space-y-2 border-t border-slate-200 dark:border-white/10 ${collapsed ? 'p-2' : 'p-4'}`}>
        <Link
          href="/"
          title={collapsed ? "View Public Website" : undefined}
          onClick={() => setIsOpen(false)}
          className={`flex min-h-10 w-full items-center rounded-lg text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-accent ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`}
        >
          <Globe2 className={`h-5 w-5 flex-shrink-0 opacity-70 transition-all duration-300 ${collapsed ? 'mr-0' : 'mr-3'}`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>View Public Website</span>
        </Link>
        <button
          type="button"
          title={collapsed ? "Logout" : undefined}
          onClick={handleLogout}
          className={`flex min-h-10 w-full items-center rounded-lg text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:text-red-300 dark:hover:bg-red-500/10 ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`}
        >
          <LogOut className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${collapsed ? 'mr-0' : 'mr-3'}`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Logout</span>
        </button>
      </div>
    </>
  );
  };

  return (
    <>
      <aside className={`hidden h-dvh sticky top-0 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#092128] transition-[width] duration-300 md:flex ${isDesktopCollapsed ? 'w-[72px]' : 'w-64'}`}>
        {sidebarContent(false)}
      </aside>
      <MobileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel="Admin navigation"
        restoreFocusRef={restoreFocusRef}
        className="w-[84vw] max-w-[21.5rem]"
      >
        <div id="admin-mobile-sidebar" className="flex min-h-0 flex-1 flex-col">
          {sidebarContent(true)}
        </div>
      </MobileDrawer>
    </>
  );
}
