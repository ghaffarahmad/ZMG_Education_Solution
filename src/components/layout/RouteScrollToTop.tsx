"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RouteScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Scroll admin main container to top if it exists
    const adminMain = document.getElementById("admin-main-scroll");
    if (adminMain) {
      adminMain.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  return null;
}
