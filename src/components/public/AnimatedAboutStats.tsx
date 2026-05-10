"use client";

import { useEffect, useRef, useState } from "react";
import type { AboutStat } from "@/lib/aboutStats";

interface AnimatedAboutStatsProps {
  stats: AboutStat[];
}

const COUNT_UP_DURATION = 1500;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function AnimatedStatValue({
  value,
  suffix,
  shouldStart,
  prefersReducedMotion,
}: AboutStat & { shouldStart: boolean; prefersReducedMotion: boolean }) {
  const finalValue = Math.round(value);
  const [displayValue, setDisplayValue] = useState(0);
  const visibleValue = prefersReducedMotion ? finalValue : shouldStart ? displayValue : 0;

  useEffect(() => {
    if (!shouldStart || prefersReducedMotion) return;

    let frameId = 0;
    const startTime = performance.now();

    const tick = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / COUNT_UP_DURATION, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(finalValue * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [finalValue, prefersReducedMotion, shouldStart]);

  return (
    <>
      <span>{visibleValue}</span>
      {suffix && <span>{suffix}</span>}
    </>
  );
}

export function AnimatedAboutStats({ stats }: AnimatedAboutStatsProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [shouldStart, setShouldStart] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || shouldStart) return;

    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [prefersReducedMotion, shouldStart]);

  return (
    <div ref={sectionRef} className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
      {stats.map((stat, index) => (
        <article
          key={`${stat.label}-${index}`}
          className="premium-reveal rounded-xl border border-white/10 bg-white/[0.07] p-3 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] transition-transform duration-300 sm:p-5 md:p-6 md:hover:-translate-y-1"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div
            className="mb-1.5 tabular-nums text-2xl font-black leading-none tracking-normal text-[#D4AF37] drop-shadow-[0_8px_22px_rgb(212_175_55/0.16)] sm:mb-2 sm:text-4xl dark:text-[#E5C354]"
            aria-label={`${Math.round(stat.value)}${stat.suffix} ${stat.label}`}
          >
            <AnimatedStatValue {...stat} shouldStart={shouldStart} prefersReducedMotion={prefersReducedMotion} />
          </div>
          <div className="mx-auto h-px w-10 rounded-full bg-[#D4AF37]/60" aria-hidden="true" />
          <div className="mt-2 text-[10px] font-black uppercase leading-4 tracking-[0.12em] text-slate-100 sm:text-xs sm:leading-5 sm:tracking-[0.16em]">
            {stat.label}
          </div>
        </article>
      ))}
    </div>
  );
}
