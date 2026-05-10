"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_VISIBILITY_THRESHOLD = 350;
const WHATSAPP_URL =
  "https://wa.me/923143061669?text=Assalam%20o%20Alaikum%2C%20I%20need%20help%20regarding%20Z.M.G%20Education%20services.";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SCROLL_VISIBILITY_THRESHOLD);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  const handleScrollToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      onClick={handleScrollToTop}
      className={cn(
        "scroll-to-top-action fixed bottom-[calc(env(safe-area-inset-bottom)+18px)] left-[calc(env(safe-area-inset-left)+16px)] z-40 flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#D4AF37] bg-[#0D3B46] text-[#D4AF37] shadow-[0_14px_34px_rgb(13_59_70/0.25)] ring-1 ring-white/10 transition-[opacity,transform,box-shadow] duration-300 ease-out hover:shadow-[0_18px_42px_rgb(13_59_70/0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F7F4] active:scale-95 motion-reduce:transition-none dark:bg-[#0D3B46] dark:text-[#D4AF37] dark:shadow-black/30 dark:focus-visible:ring-offset-[#092128] sm:bottom-6 sm:left-6 sm:h-[52px] sm:w-[52px]",
        isVisible
          ? "opacity-100 pointer-events-auto translate-y-0 hover:-translate-y-1 focus-visible:-translate-y-1"
          : "opacity-0 pointer-events-none translate-y-3"
      )}
    >
      <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
    </button>
  );
}

function FloatingWhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Z.M.G Education on WhatsApp"
      className="floating-whatsapp-action group fixed bottom-[calc(env(safe-area-inset-bottom)+18px)] right-[calc(env(safe-area-inset-right)+16px)] z-40 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_36px_rgb(15_23_42/0.28)] ring-1 ring-white/35 transition-[box-shadow,background-color] duration-300 ease-out hover:bg-[#20bd5a] hover:shadow-[0_20px_46px_rgb(15_23_42/0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F7F4] dark:shadow-black/35 dark:focus-visible:ring-offset-[#092128] sm:bottom-6 sm:right-6 sm:h-[58px] sm:w-[58px]"
    >
      <span className="relative z-10 flex h-full w-full items-center justify-center rounded-full">
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-[#D4AF37]/35 bg-[#0D3B46] px-3 py-1.5 text-xs font-bold text-[#F7F7F4] opacity-0 shadow-lg shadow-slate-950/15 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:-translate-y-0.5 group-focus-visible:opacity-100 dark:border-[#E5C354]/40 sm:block"
      >
        Need Help?
      </span>
    </a>
  );
}

export function FloatingActions() {
  return (
    <>
      <ScrollToTopButton />
      <FloatingWhatsAppButton />
    </>
  );
}
