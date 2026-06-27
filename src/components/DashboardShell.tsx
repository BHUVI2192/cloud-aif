"use client";
import Link from "next/link";
import { useState } from "react";
import SignOutButton from "./SignOutButton";
import NotificationBell from "./NotificationBell";

// Helper icons mapping for the bottom navigation bar
const NAV_ICONS: Record<string, React.ReactNode> = {
  Overview: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Requests: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Providers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Services: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "My Requests": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  "New Request": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
};

export default function DashboardShell({
  title,
  nav,
  active,
  children,
  user,
}: {
  title: string;
  nav: { label: string; href: string }[];
  active: string;
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role: string; image?: string | null };
}) {
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const homeHref =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? "/admin"
      : user.role === "PROVIDER"
      ? "/provider"
      : user.role === "CUSTOMER"
      ? "/customer"
      : "/";

  // Select core shortcuts for the bottom navigation bar to avoid crowding
  const getBottomShortcuts = () => {
    if (user.role === "PROVIDER") {
      return [
        { label: "Overview", href: "/provider" },
        { label: "Requests", href: "/provider/requests" },
        { label: "Services", href: "/provider/services" },
      ];
    }
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return [
        { label: "Overview", href: "/admin" },
        { label: "Providers", href: "/admin/providers" },
        { label: "Requests", href: "/admin/requests" },
      ];
    }
    // Customer
    return [
      { label: "My Requests", href: "/customer" },
      { label: "New Request", href: "/services" },
    ];
  };

  const bottomShortcuts = getBottomShortcuts();
  const hasMoreMenu = nav.length > bottomShortcuts.length;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      {/* 🖥 Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:block border-r p-6 min-h-screen" style={{ borderColor: "var(--line)", background: "#fff" }}>
        <Link href={homeHref} className="mb-8 flex items-center gap-2.5 font-display text-[20px] font-semibold" style={{ color: "var(--forest)" }}>
          <span className="grid h-[32px] w-[32px] place-items-center rounded-[9px] text-[16px] text-white" style={{ background: "var(--brand)" }}>C</span>
          Cloud AIF
        </Link>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition"
              style={n.href === active ? { background: "var(--mist)", color: "var(--forest)" } : { color: "var(--slate)" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t pt-5 flex items-center gap-3" style={{ borderColor: "var(--line)" }}>
          {user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border"
              style={{ borderColor: "var(--line)" }}
            />
          )}
          <div>
            <div className="text-[13px] font-semibold" style={{ color: "var(--forest)" }}>{user.name ?? user.email}</div>
            <div className="text-[12px] capitalize" style={{ color: "var(--slate)" }}>{user.role.replace(/_/g, " ").toLowerCase()}</div>
          </div>
        </div>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </aside>

      {/* 📱 Mobile Bottom Navigation Bar (Visible on Mobile Only) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex h-[64px] items-center justify-around border-t md:hidden"
        style={{ background: "#ffffff", borderColor: "var(--line)", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" }}
      >
        {bottomShortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex flex-col items-center justify-center w-16 h-full text-[10px] font-medium transition"
            style={{ color: s.href === active ? "var(--brand)" : "var(--slate)" }}
          >
            <span className="mb-0.5">{NAV_ICONS[s.label] ?? NAV_ICONS.Overview}</span>
            {s.label}
          </Link>
        ))}

        {hasMoreMenu && (
          <button
            onClick={() => setShowMobileDrawer(true)}
            className="flex flex-col items-center justify-center w-16 h-full text-[10px] font-medium transition"
            style={{ color: showMobileDrawer ? "var(--brand)" : "var(--slate)" }}
          >
            <span className="mb-0.5">{NAV_ICONS.Menu}</span>
            More
          </button>
        )}
      </div>

      {/* 📱 Mobile "More" Drawer Modal */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:hidden" onClick={() => setShowMobileDrawer(false)}>
          <div
            className="w-full max-h-[70vh] rounded-t-3xl p-6 overflow-y-auto space-y-4 animate-slide-up"
            style={{ background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-2" style={{ borderColor: "var(--line)" }}>
              <span className="text-[16px] font-bold" style={{ color: "var(--forest)" }}>All Navigation</span>
              <button onClick={() => setShowMobileDrawer(false)} className="text-[20px] font-bold" style={{ color: "var(--slate)" }}>×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-6">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setShowMobileDrawer(false)}
                  className="flex items-center gap-2 rounded-xl p-3 text-[13px] font-semibold border transition"
                  style={n.href === active ? { background: "var(--mist)", color: "var(--forest)", borderColor: "var(--brand)" } : { color: "var(--slate)", borderColor: "var(--line)" }}
                >
                  <span className="shrink-0">{NAV_ICONS[n.label] ?? "•"}</span>
                  {n.label}
                </Link>
              ))}
            </div>
            <div className="border-t pt-4 flex flex-col gap-3" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-3">
                {user.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="Profile" className="w-10 h-10 rounded-full object-cover border" style={{ borderColor: "var(--line)" }} />
                )}
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--forest)" }}>{user.name ?? user.email}</div>
                  <div className="text-[11px] capitalize" style={{ color: "var(--slate)" }}>{user.role.replace(/_/g, " ").toLowerCase()}</div>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-5 pb-24 md:p-10">
        {/* Top bar with title + notification bell */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[24px] md:text-[30px] font-display font-semibold leading-tight" style={{ color: "var(--forest)" }}>{title}</h1>
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
