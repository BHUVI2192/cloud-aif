"use client";
import Link from "next/link";
import { useState } from "react";
import SignOutButton from "./SignOutButton";
import NotificationBell from "./NotificationBell";
import {
  Home,
  FileText,
  PlusCircle,
  Users,
  Layout,
  User,
  Calendar,
  Image as ImageIcon,
  Star,
  Shield,
  Settings,
  Grid,
  List,
  AlertCircle,
  Activity,
  Menu,
  ArrowLeft,
  X
} from "lucide-react";

const NAV_ICONS: Record<string, React.ReactNode> = {
  Overview: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Requests: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  "My Requests": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  "New Request": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Providers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Services: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Availability: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Portfolio: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Reviews: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Verification: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  backHref,
}: {
  title: string;
  nav: { label: string; href: string }[];
  active: string;
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role: string; image?: string | null };
  backHref?: string;
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
    return [
      { label: "My Requests", href: "/customer" },
      { label: "New Request", href: "/services" },
    ];
  };

  const bottomShortcuts = getBottomShortcuts();
  const hasMoreMenu = nav.length > bottomShortcuts.length;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)] bg-surface text-on-surface">
      {/* 🖥 Persistent Desktop Sidebar */}
      <aside className="hidden md:flex flex-col border-r p-5 sticky top-0 h-screen overflow-y-auto bg-white border-outline-variant">
        <Link href={homeHref} className="mb-6 flex items-center gap-2.5 font-inter text-[18px] font-bold text-primary">
          <span className="grid h-8 w-8 place-items-center rounded bg-primary text-white text-[15px] font-extrabold">C</span>
          Cloud AIF
        </Link>

        <nav className="space-y-1 flex-1">
          {nav.map((n) => {
            const isCurrent = active === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                prefetch={true}
                className={`flex items-center gap-2.5 rounded px-3 py-2.5 text-[14px] font-semibold transition-colors duration-150 min-h-[44px] ${
                  isCurrent
                    ? "bg-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
                }`}
              >
                <span className="shrink-0">{NAV_ICONS[n.label] ?? "•"}</span>
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-outline-variant pt-4 space-y-3">
          <div className="flex items-center gap-3">
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-outline-variant"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold truncate text-on-surface">{user.name ?? user.email}</div>
              <div className="text-[11px] font-medium text-on-surface-variant capitalize">{user.role.replace(/_/g, " ").toLowerCase()}</div>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* 📱 Mobile Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 md:hidden bg-white/95 backdrop-blur border-outline-variant shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          {backHref ? (
            <Link
              href={backHref}
              className="grid h-11 w-11 place-items-center rounded hover:bg-surface-container active:scale-95 text-primary"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : null}
          <span className="text-[16px] font-bold truncate text-on-surface">
            {title}
          </span>
        </div>
        <NotificationBell />
      </header>

      {/* 📱 Mobile Fixed Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t md:hidden bg-white border-outline-variant pb-[env(safe-area-inset-bottom)] shadow-lg">
        {bottomShortcuts.map((s) => {
          const isCurrent = active === s.href;
          return (
            <Link
              key={s.href}
              href={s.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] text-[11px] font-bold transition-all ${
                isCurrent ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className={`inline-flex items-center justify-center px-3 py-1 rounded transition-colors ${
                isCurrent ? "bg-primary/10 text-primary" : ""
              }`}>
                {NAV_ICONS[s.label] ?? NAV_ICONS.Overview}
              </span>
              <span className="truncate mt-0.5 max-w-[80px]">{s.label}</span>
            </Link>
          );
        })}

        {hasMoreMenu && (
          <button
            type="button"
            onClick={() => setShowMobileDrawer(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] text-[11px] font-bold transition-all ${
              showMobileDrawer ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded transition-colors ${
              showMobileDrawer ? "bg-primary/10 text-primary" : ""
            }`}>
              {NAV_ICONS.Menu}
            </span>
            <span className="truncate mt-0.5">More</span>
          </button>
        )}
      </div>

      {/* 📱 Mobile "More" Navigation Drawer Modal */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:hidden" onClick={() => setShowMobileDrawer(false)}>
          <div
            className="w-full max-h-[80vh] rounded-t-2xl p-5 overflow-y-auto space-y-4 bg-white animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <span className="text-[15px] font-bold text-on-surface">Navigation</span>
              <button onClick={() => setShowMobileDrawer(false)} className="p-2 rounded text-on-surface-variant hover:bg-surface-container min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nav.map((n) => {
                const isCurrent = active === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    prefetch={true}
                    onClick={() => setShowMobileDrawer(false)}
                    className={`flex items-center gap-3 rounded p-3 text-[14px] font-bold border transition-colors min-h-[48px] ${
                      isCurrent
                        ? "bg-primary text-white border-primary"
                        : "bg-surface text-on-surface border-outline-variant hover:border-primary"
                    }`}
                  >
                    <span className="shrink-0">{NAV_ICONS[n.label] ?? "•"}</span>
                    <span className="truncate">{n.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-outline-variant pt-4 space-y-3">
              <div className="flex items-center gap-3">
                {user.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-outline-variant" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold truncate text-on-surface">{user.name ?? user.email}</div>
                  <div className="text-[11px] font-medium text-on-surface-variant capitalize">{user.role.replace(/_/g, " ").toLowerCase()}</div>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}

      {/* 🖥 Main Content Area */}
      <main className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 min-w-0 max-w-7xl w-full mx-auto">
        <div className="mb-6 hidden md:flex items-center justify-between">
          <h1 className="text-[26px] font-bold tracking-tight text-on-surface">{title}</h1>
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
