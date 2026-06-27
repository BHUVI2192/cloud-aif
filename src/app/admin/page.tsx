import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin");

  const [
    pendingProviders,
    openRequests,
    openComplaints,
    pendingReviews,
    totalUsers,
    totalProviders,
    approvedProviders,
    completedRequests,
    recentProviders,
    recentRequests,
  ] = await Promise.all([
    db.providerProfile.count({ where: { status: { in: ["PENDING_VERIFICATION", "UNDER_REVIEW", "NEEDS_MORE_INFO"] } } }),
    db.serviceRequest.count({ where: { status: { in: ["SUBMITTED", "MATCHING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"] } } }),
    db.complaint.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.review.count({ where: { status: "PENDING_MODERATION" } }),
    db.user.count(),
    db.providerProfile.count(),
    db.providerProfile.count({ where: { status: "APPROVED" } }),
    db.serviceRequest.count({ where: { status: "COMPLETED" } }),
    db.providerProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, displayName: true, status: true, primaryCategory: { select: { name: true } }, createdAt: true },
    }),
    db.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true, category: { select: { name: true } } },
    }),
  ]);

  const statCards = [
    { label: "Awaiting Review", value: pendingProviders, href: "/admin/providers", icon: "👤", color: pendingProviders > 0 ? "#e65c00" : "#14331f", bg: pendingProviders > 0 ? "#fff4ed" : "#f2f7f3", border: pendingProviders > 0 ? "#ffd9b8" : "#d0e4d8" },
    { label: "Open Requests", value: openRequests, href: "/admin/requests", icon: "📋", color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Open Complaints", value: openComplaints, href: "/admin/complaints", icon: "⚠", color: openComplaints > 0 ? "#a32d2d" : "#14331f", bg: openComplaints > 0 ? "#fdf2f2" : "#f2f7f3", border: openComplaints > 0 ? "#fbd5d5" : "#d0e4d8" },
    { label: "Reviews to Moderate", value: pendingReviews, href: "/admin/reviews", icon: "⭐", color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Approved Providers", value: approvedProviders, href: "/admin/providers", icon: "✅", color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Completed Requests", value: completedRequests, href: "/admin/requests", icon: "🎯", color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Total Users", value: totalUsers, href: "/admin/users", icon: "👥", color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Total Providers", value: totalProviders, href: "/admin/providers", icon: "🏢", color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
  ] as const;

  const statusColors: Record<string, string> = {
    DRAFT: "#94a3b8",
    PENDING_VERIFICATION: "#e65c00",
    UNDER_REVIEW: "#2563eb",
    NEEDS_MORE_INFO: "#d97706",
    APPROVED: "#16a34a",
    REJECTED: "#dc2626",
    SUSPENDED: "#9333ea",
    SUBMITTED: "#2563eb",
    MATCHING: "#d97706",
    ASSIGNED: "#7c3aed",
    ACCEPTED: "#0891b2",
    IN_PROGRESS: "#e65c00",
    COMPLETED: "#16a34a",
    CANCELLED: "#6b7280",
  };

  const firstName = session.user.name?.split(" ")[0] ?? "Admin";

  return (
    <DashboardShell title="" nav={ADMIN_NAV} active="/admin" user={session.user}>
      {/* Welcome Banner */}
      <div className="mb-8 rounded-2xl p-7" style={{ background: "linear-gradient(120deg, var(--forest) 0%, #1a4a2a 100%)" }}>
        <p className="text-[13px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--sage)" }}>Cloud AIF Admin</p>
        <h1 className="text-[28px] font-display font-bold text-white mb-1">Welcome back, {firstName} 👋</h1>
        <p className="text-[14px]" style={{ color: "#c6d6cb" }}>
          {pendingProviders > 0
            ? `You have ${pendingProviders} provider application${pendingProviders > 1 ? "s" : ""} awaiting review.`
            : "All provider applications are up to date."}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map(({ label, value, href, icon, color, bg, border }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: border, background: bg }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[22px]">{icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color }}>View →</span>
            </div>
            <div className="font-display text-[36px] font-bold leading-none mb-1" style={{ color }}>{value}</div>
            <div className="text-[13px] font-medium" style={{ color: "var(--slate)" }}>{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Provider Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold" style={{ color: "var(--forest)" }}>Recent Provider Applications</h2>
            <Link href="/admin/providers" className="text-[13px] font-medium" style={{ color: "var(--emerald)" }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {recentProviders.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--slate)" }}>No providers yet.</p>
            ) : (
              recentProviders.map((p) => (
                <Link key={p.id} href={`/admin/providers/${p.id}`} className="flex items-center justify-between rounded-xl border px-4 py-3 transition hover:bg-mist" style={{ borderColor: "var(--line)" }}>
                  <div>
                    <div className="text-[14px] font-semibold" style={{ color: "var(--forest)" }}>{p.displayName}</div>
                    <div className="text-[12px]" style={{ color: "var(--slate)" }}>{p.primaryCategory?.name ?? "—"} · {p.createdAt.toLocaleDateString()}</div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full capitalize" style={{ background: (statusColors[p.status] ?? "#6b7280") + "22", color: statusColors[p.status] ?? "#6b7280" }}>
                    {p.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Service Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold" style={{ color: "var(--forest)" }}>Recent Service Requests</h2>
            <Link href="/admin/requests" className="text-[13px] font-medium" style={{ color: "var(--emerald)" }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--slate)" }}>No requests yet.</p>
            ) : (
              recentRequests.map((r) => (
                <Link key={r.id} href={`/request/${r.id}`} className="flex items-center justify-between rounded-xl border px-4 py-3 transition hover:bg-mist" style={{ borderColor: "var(--line)" }}>
                  <div>
                    <div className="text-[14px] font-semibold" style={{ color: "var(--forest)" }}>{r.title}</div>
                    <div className="text-[12px]" style={{ color: "var(--slate)" }}>{r.category?.name ?? "—"} · {r.createdAt.toLocaleDateString()}</div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full capitalize" style={{ background: (statusColors[r.status] ?? "#6b7280") + "22", color: statusColors[r.status] ?? "#6b7280" }}>
                    {r.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
