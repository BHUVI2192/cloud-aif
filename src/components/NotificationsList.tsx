"use client";
import { useEffect, useState } from "react";
import { Check, Clock } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      );
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchNotifications();
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-[14px]">Loading notifications...</p>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="space-y-4">
      {notifications.length > 0 && hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={markAllRead}
            className="btn btn-ghost text-[13px] flex items-center gap-1.5 !py-2 px-4 border border-outline-variant hover:border-primary transition"
          >
            <Check className="h-4 w-4 text-emerald-600" />
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="card text-center py-16 text-slate space-y-3">
          <div className="text-4xl">🔔</div>
          <h3 className="text-[16px] font-bold text-forest">You're all caught up!</h3>
          <p className="text-[13px] text-slate max-w-sm mx-auto">
            When you receive updates about your service requests or account status, they will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start gap-4 transition duration-200 border-l-4 ${
                n.readAt
                  ? "border-l-outline-variant bg-white opacity-80"
                  : "border-l-primary bg-surface shadow-sm"
              }`}
            >
              <div className="text-2xl shrink-0 mt-0.5 bg-surface-container h-10 w-10 rounded-xl flex items-center justify-center border border-outline-variant">
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-[15px] text-forest leading-snug">{n.title}</h4>
                  {!n.readAt && (
                    <span className="shrink-0 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-slate leading-relaxed">{n.body}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-stone pt-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
