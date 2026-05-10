"use client";

import { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { NoticeCard } from "@/components/public/NoticeCard";

interface Notice {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  priority: "normal" | "important" | "urgent";
  imageUrl?: string;
  createdAt: string;
  linkUrl?: string;
  linkLabel?: string;
}

interface NoticesClientProps {
  initialNotices: Notice[];
}

const CATEGORIES = [
  { value: "all", label: "All Notices" },
  { value: "general", label: "General" },
  { value: "admission", label: "Admission Support" },
  { value: "admit_card", label: "Admit Card Access" },
  { value: "enrollment", label: "Enrollment Card Access" },
  { value: "fee", label: "Fee Verification" },
  { value: "board_update", label: "Board Support" },
  { value: "aiou", label: "AIOU" },
];

export function NoticesClient({ initialNotices }: NoticesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredNotices = initialNotices.filter((notice) => {
    const normalizedSearch = searchQuery.toLowerCase();
    const matchesSearch =
      notice.title.toLowerCase().includes(normalizedSearch) ||
      notice.shortDescription.toLowerCase().includes(normalizedSearch);
    const matchesCategory = activeCategory === "all" || notice.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const activeLabel = CATEGORIES.find((category) => category.value === activeCategory)?.label || "All Notices";

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="premium-card-line rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_70px_rgb(13_59_70/0.08)] dark:border-white/10 dark:bg-[#0C2A33] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search notices by keyword..."
              className="min-h-10 w-full rounded-xl border border-slate-200 bg-[#F7F7F4] py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-[#092128] dark:text-white dark:focus:bg-white/10 sm:min-h-12 sm:py-3 sm:pl-12 sm:pr-4 sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent sm:left-4 sm:h-5 sm:w-5" />
            <select
              className="min-h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-[#F7F7F4] py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-[#092128] dark:text-white dark:focus:bg-white/10 sm:min-h-12 sm:py-3 sm:pl-12 sm:pr-4 sm:text-base"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2.5 border-t border-slate-200 pt-3 dark:border-white/10 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 sm:text-sm">
            Showing <span className="text-primary dark:text-accent">{filteredNotices.length}</span> of{" "}
            <span className="text-primary dark:text-accent">{initialNotices.length}</span> notices
            <span className="text-slate-400"> / {activeLabel}</span>
          </div>
          {(searchQuery || activeCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="inline-flex min-h-9 w-fit items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-black text-primary transition-all hover:border-accent hover:bg-accent/10 dark:border-white/10 dark:text-accent dark:hover:bg-accent/15 sm:min-h-10 sm:text-sm"
            >
              Clear filters
              <X className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-4 dark:border-white/10 sm:gap-2 sm:pb-5">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => setActiveCategory(category.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-black transition-all duration-300 sm:px-4 sm:py-2 sm:text-sm ${
              activeCategory === category.value
                ? "border-primary bg-primary text-white shadow-lg shadow-primary/15 dark:border-accent dark:bg-accent dark:text-primary"
                : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-accent"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {filteredNotices.map((notice) => (
            <NoticeCard key={notice._id} notice={notice} />
          ))}
        </div>
      ) : (
        <div className="premium-card-line rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm dark:border-white/15 dark:bg-[#0C2A33] sm:p-16">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent sm:h-16 sm:w-16 sm:rounded-2xl">
            <Search className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <h3 className="mb-2 text-lg font-black text-slate-950 dark:text-white sm:text-xl">No notices found</h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-slate-500 dark:text-slate-300 sm:text-base sm:leading-7">
            We could not find any notices matching your search or selected category. Try adjusting your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-black text-white transition-all hover:bg-[#124C5A] dark:bg-accent dark:text-primary sm:mt-6 sm:min-h-11"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
