"use client";

import { useCallback } from "react";
import { useReportWebVitals } from "next/web-vitals";

export default function WebVitals() {
  const handleReport = useCallback(
    (metric: { name: string; value: number; rating: string; id: string }) => {
      // Only log Core Web Vitals in development to avoid console noise in production
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[CWV] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`
        );
      }
    },
    []
  );

  useReportWebVitals(handleReport);

  return null;
}
