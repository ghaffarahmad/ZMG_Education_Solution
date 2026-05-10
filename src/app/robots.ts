import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
      disallow: ["/admin", "/api/admin", "/api/student", "/student-portal/dashboard"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
