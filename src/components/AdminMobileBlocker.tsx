"use client";
import { useEffect, useState } from "react";

export default function AdminMobileBlocker({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkViewport = () => {
      // Standalone PWA mode or screen width less than 768px (mobile viewport)
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      const smallScreen = window.innerWidth < 768;
      setIsMobile(standalone || smallScreen);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="text-center font-semibold text-[15px]" style={{ color: "var(--forest)" }}>
          Checking authorization...
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#fdf2f2] text-rose-600 text-[26px] mb-4">
          ⚠️
        </div>
        <h1 className="text-[22px] font-display font-semibold italic text-[#0d2215]">
          Desktop Access Required
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed max-w-[22em]" style={{ color: "var(--slate)" }}>
          The administrator dashboard is restricted and optimized for desktop management. It cannot be accessed inside the mobile app container.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="btn btn-primary mt-6 !text-[13px] !py-2 px-5"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
