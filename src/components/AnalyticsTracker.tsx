"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    // Avoid double logging for identical route loads
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Don't track admin pages or API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const trackVisit = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer 
              ? new URL(document.referrer).hostname 
              : "direct",
          }),
        });
      } catch (err) {
        console.error("Failed to track analytics:", err);
      }
    };

    // Delay slightly to allow page title and state to stabilize
    const timer = setTimeout(trackVisit, 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
