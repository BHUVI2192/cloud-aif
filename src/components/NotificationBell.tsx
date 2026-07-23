"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface NotificationBellProps {
  href: string;
}

export default function NotificationBell({ href }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silent — bell should never break the page
    }
  }

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 60s
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href={href}
      className="relative grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-surface-container active:scale-95"
      style={{ color: "var(--slate)" }}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-white"
          style={{ background: "#e53e3e" }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
