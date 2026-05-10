"use client";

import { useRef, useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function FloatingWhatsApp() {
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [isBlockedByHero, setIsBlockedByHero] = useState(false);
  const [isHiddenByPageMarker, setIsHiddenByPageMarker] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.whatsappNumber) {
            setWhatsappNumber(data.data.whatsappNumber);
          }
        }
      } catch {
        console.error("Failed to fetch WhatsApp number");
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const blockingSection = document.querySelector<HTMLElement>("[data-floating-whatsapp-safe-zone]");
    const button = buttonRef.current;
    if (!blockingSection || !button) return;

    let frame: number | null = null;

    const updateBlockedState = () => {
      frame = null;
      const sectionRect = blockingSection.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const isOverlapping = !(
        buttonRect.left > sectionRect.right ||
        buttonRect.right < sectionRect.left ||
        buttonRect.top > sectionRect.bottom ||
        buttonRect.bottom < sectionRect.top
      );

      setIsBlockedByHero(isOverlapping);
    };

    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateBlockedState);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    let frame: number | null = null;

    const updateHiddenState = () => {
      frame = null;
      setIsHiddenByPageMarker(Boolean(document.querySelector("[data-hide-floating-whatsapp]")));
    };

    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateHiddenState);
    };

    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleUpdate();

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  // Use a default number if setting is not available
  const finalNumber = whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923143061669";
  const whatsappUrl = `https://wa.me/${finalNumber.replace(/[^0-9]/g, "")}`;
  const isHidden = isBlockedByHero || isHiddenByPageMarker;

  return (
    <Link
      ref={buttonRef}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "floating-whatsapp group fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] right-[calc(env(safe-area-inset-right)+0.75rem)] z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] p-2.5 text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/30 transition-all duration-300 hover:bg-[#20bd5a] sm:bottom-5 sm:right-5 sm:h-14 sm:w-14 sm:p-4 sm:hover:scale-105",
        isHidden && "pointer-events-none translate-y-3 opacity-0"
      )}
      aria-hidden={isHidden}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5 sm:h-7 sm:w-7" />
      <span className="pointer-events-none absolute right-full mr-4 hidden whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm text-gray-800 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 sm:block">
        Need Help? Chat with us
      </span>
    </Link>
  );
}
