"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";
import { DecorativeDivider } from "@/components/ui/DecorativeDivider";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

interface PublicSettings {
  websiteName?: string;
}

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = await res.json() as { data?: PublicSettings };
          if (data.data) {
            setSettings(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings for Navbar", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json() as { isAdmin?: boolean };
          setIsAdmin(Boolean(data.isAdmin));
        }
      } catch (error) {
        console.error("Failed to check admin status", error);
      }
    };
    checkAdmin();
  }, [pathname]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    const frame = window.requestAnimationFrame(closeMobileMenu);
    return () => window.cancelAnimationFrame(frame);
  }, [closeMobileMenu, pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Admission Support", href: "/admission-support" },
    { name: "Notices", href: "/notices" },
    { name: "Contact", href: "/contact" },
  ];

  const websiteName = settings?.websiteName || "Z.M.G Education Solution";
  const logoSrc = mounted && resolvedTheme === "dark" ? "/darklogo1.png" : "/lightlogo1.png";

  return (
    <>
      <header className="sticky top-0 z-[160] h-16 w-full border-b border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#092128] md:h-20">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex h-full w-full items-center justify-between gap-3">
            {/* Logo */}
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="group flex h-full min-w-0 items-center gap-2.5 sm:gap-3 md:shrink-0">
              <Image
                key={logoSrc}
                src={logoSrc}
                alt={`${websiteName} logo`}
                width={60}
                height={60}
                priority
                className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 md:h-[60px] md:w-[60px]"
              />
              <span className="flex min-w-0 flex-col justify-center">
                <span className="max-w-[12rem] truncate text-sm font-bold leading-tight text-primary transition-colors group-hover:text-accent dark:text-white dark:group-hover:text-accent min-[390px]:max-w-[13.5rem] sm:max-w-none sm:whitespace-nowrap sm:text-base md:text-lg md:leading-none">
                  Z.M.G Education<span className="hidden sm:inline"> Solution</span>
                </span>
                <DecorativeDivider className="mt-1 w-[80%] max-w-[14rem]" />
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden h-full items-center gap-1 md:flex lg:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "inline-flex h-10 items-center rounded-md border border-transparent px-3 text-sm font-medium leading-none transition-colors",
                      isActive
                        ? "bg-slate-100 text-primary dark:bg-white/10 dark:text-accent"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-accent"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden h-full items-center gap-2 md:flex">
              <ThemeToggle />
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => router.push("/admin/dashboard")} className="h-10 whitespace-nowrap border-primary text-primary hover:bg-primary/5 dark:border-accent/60 dark:text-accent dark:hover:bg-white/10">
                  Admin Dashboard
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={() => router.push("/student-portal")} className="h-10 whitespace-nowrap">
                Student Portal
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="relative z-[130] flex h-full items-center gap-2 md:hidden">
              <ThemeToggle className="h-10 w-10 border border-slate-200 bg-slate-50 text-primary shadow-sm hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-accent dark:hover:bg-white/15" />
              <button
                ref={mobileMenuButtonRef}
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-primary shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white/10 dark:text-accent dark:hover:bg-white/15"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-site-navigation"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        ariaLabel="Website navigation"
        restoreFocusRef={mobileMenuButtonRef}
        className="w-[84vw] max-w-[22rem] bg-[#F7F7F4] dark:bg-[#092128]"
      >
        <div id="mobile-site-navigation" className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-white/10">
            <Link href="/" onClick={closeMobileMenu} className="flex min-w-0 items-center gap-2.5">
              <Image
                key={`${logoSrc}-drawer`}
                src={logoSrc}
                alt={`${websiteName} logo`}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 object-contain"
              />
              <span className="truncate text-base font-bold leading-tight text-primary dark:text-white">
                Z.M.G Education
              </span>
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-accent"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-4 py-5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex min-h-12 items-center rounded-xl px-4 py-3 text-base font-bold transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm dark:bg-accent dark:text-[#092128]"
                      : "text-primary hover:bg-white hover:text-primary dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-accent"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-slate-200 p-4 dark:border-white/10">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => {
                closeMobileMenu();
                router.push("/student-portal");
              }}
            >
              Student Portal
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center border-primary text-primary dark:border-accent/60 dark:text-accent dark:hover:bg-accent/10"
              onClick={() => {
                closeMobileMenu();
                router.push(isAdmin ? "/admin/dashboard" : "/admin/login");
              }}
            >
              {isAdmin ? "Admin Dashboard" : "Admin Login"}
            </Button>
          </div>
        </div>
      </MobileDrawer>
    </>
  );
}
