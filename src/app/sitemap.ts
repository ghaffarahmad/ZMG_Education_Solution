import type { MetadataRoute } from "next";
import { absoluteUrl, publicSitemapPaths } from "@/lib/seo";

const sitemapConfig: Record<(typeof publicSitemapPaths)[number], { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/about": { changeFrequency: "monthly", priority: 0.8 },
  "/services": { changeFrequency: "monthly", priority: 0.9 },
  "/admission-support": { changeFrequency: "monthly", priority: 0.9 },
  "/notices": { changeFrequency: "daily", priority: 0.8 },
  "/contact": { changeFrequency: "monthly", priority: 0.7 },
  "/student-portal": { changeFrequency: "weekly", priority: 0.9 },
  "/privacy": { changeFrequency: "yearly", priority: 0.3 },
  "/terms": { changeFrequency: "yearly", priority: 0.3 },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicSitemapPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: sitemapConfig[path].changeFrequency,
    priority: sitemapConfig[path].priority,
  }));
}
