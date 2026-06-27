"use client";
import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silent — bell should never break the page
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  }

  useEffect(() => {
    fetchNotifications();
    // Poll every 60s — free, no WebSocket needed
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function typeIcon(type: string) {
    const icons: Record<string, string> = {
      REQUEST_ASSIGNED: "🔔",
      REQUEST_ACCEPTED: "✅",
      REQUEST_STATUS_CHANGED: "🔄",
      VERIFICATION_UPDATE: "📋",
      REVIEW_RECEIVED: "⭐",
      COMPLAINT_UPDATE: "⚠️",
      SYSTEM_ANNOUNCEMENT: "📢",
    };
    return icons[type] ?? "🔔";
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative grid h-9 w-9 place-items-center rounded-lg transition-colors"
        style={{ color: "var(--slate)", background: open ? "var(--mist)" : "transparent" }}
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
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--line)", top: "100%" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--line)" }}>
            <span className="text-[14px] font-semibold" style={{ color: "var(--forest)" }}>Notifications</span>
            {notifications.some((n) => !n.readAt) && (
              <button
                className="text-[12px] font-medium"
                style={{ color: "var(--brand)" }}
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[13px]" style={{ color: "var(--slate)" }}>
                <div className="text-2xl mb-2">🔔</div>
                You&apos;re all caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-3 px-4 py-3 border-b transition-colors"
                  style={{
                    borderColor: "var(--line)",
                    background: n.readAt ? "transparent" : "var(--mist)",
                  }}
                >
                  <div className="text-xl shrink-0 mt-0.5">{typeIcon(n.type)}</div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold leading-tight" style={{ color: "var(--forest)" }}>
                      {n.title}
                    </div>
                    <div className="text-[12px] mt-0.5 leading-snug" style={{ color: "var(--slate)" }}>
                      {n.body}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "var(--stone)" }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  {!n.readAt && (
                    <div className="shrink-0 mt-1.5 h-2 w-2 rounded-full" style={{ background: "var(--brand)" }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
