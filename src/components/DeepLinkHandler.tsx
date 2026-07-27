"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { App } from "@capacitor/app";

export default function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    // Listen for deep link events when the app is opened via a verified App Link
    App.addListener("appUrlOpen", (event: any) => {
      try {
        const url = new URL(event.url);
        // Navigate internally within the app's webview using pathname and search queries
        const path = url.pathname + url.search;
        router.push(path);
      } catch (err) {
        console.error("[Deep Link Parse Error]:", err);
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [router]);

  return null;
}
