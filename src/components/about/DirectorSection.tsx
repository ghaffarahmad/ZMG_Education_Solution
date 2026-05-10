"use client";

import Image from "next/image";
import { Quote } from "lucide-react";

const DIRECTOR_IMAGE_SRC = "/images/about/founder-director.webp";

export function DirectorSection() {
  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-white shadow-xl shadow-slate-950/10 sm:mb-24 sm:rounded-3xl dark:border-[#D4AF37]/25 dark:bg-[#092128] dark:shadow-black/25">
      <div className="grid items-stretch gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative min-h-[240px] overflow-hidden bg-[#092128] min-[390px]:min-h-[260px] sm:min-h-[500px] lg:min-h-full">
          <div className="absolute inset-3 rounded-[1.25rem] border border-[#D4AF37]/30 sm:inset-4 sm:rounded-[1.65rem]" />
          <Image
            src={DIRECTOR_IMAGE_SRC}
            alt="Director Sir Ghaffar Ahmad Khan"
            fill
            sizes="(max-width: 1024px) 100vw, 44vw"
            priority={false}
            className="object-cover object-[center_top] sm:object-[center_30%]"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#092128]/80 to-transparent sm:h-28" />
        </div>

        <div className="relative flex min-w-0 flex-col justify-center px-4 py-6 sm:px-10 sm:py-12 md:py-14 lg:px-14">
          <div className="absolute right-8 top-8 hidden h-20 w-20 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 lg:block" />

          <div className="mb-3 inline-flex w-fit items-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0D3B46] sm:mb-5 sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-[0.22em] dark:text-[#E5C354]">
            Leadership
          </div>

          <h2 className="max-w-2xl text-2xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
            Meet Our Director
          </h2>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#0D3B46] sm:mt-4 sm:text-lg sm:leading-7 dark:text-[#D4AF37]">
            Guiding Students with Trust, Clarity, and Commitment
          </p>

          <div className="mt-5 flex gap-3 sm:mt-8 sm:gap-4">
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D3B46] text-[#D4AF37] shadow-lg shadow-slate-950/15 sm:h-11 sm:w-11 dark:bg-white/10">
              <Quote className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <p className="min-w-0 max-w-2xl text-sm leading-6 text-slate-600 sm:text-lg sm:leading-8 dark:text-[#CBD5E1]">
              At Z.M.G Education Solution, our mission is to make academic processes easier, faster, and more reliable for students and families. From admissions support to student document access, we are committed to providing trusted guidance with professionalism, transparency, and care. Our goal is to help every student move forward with confidence.
            </p>
          </div>

          <div className="mt-5 border-l-4 border-[#D4AF37] pl-3 sm:mt-8 sm:pl-5">
            <p className="text-sm font-semibold text-slate-900 sm:text-lg dark:text-white">Dedicated to student success.</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-sm sm:tracking-[0.18em] dark:text-[#CBD5E1]">
              Director Sir Ghaffar Ahmad Khan
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
