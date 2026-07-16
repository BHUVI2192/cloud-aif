import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import Link from "next/link";
import {
  UserCheck,
  FileText,
  AlertTriangle,
  Star,
  CheckCircle,
  Target,
  Users,
  Building,
  AlertCircle
} from "lucide-react";

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
    stuckRequests,
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
    db.serviceRequest.findMany({
      where: { needsAdminAttention: true, status: { in: ["SUBMITTED", "MATCHING"] } },
      orderBy: { lastMatchedAt: "asc" },
      take: 10,
      select: { id: true, title: true, status: true, matchAttempts: true, lastMatchedAt: true, locality: true, category: { select: { name: true } } },
    }),
  ]);

  const statCards = [
    { label: "Awaiting Review", value: pendingProviders, href: "/admin/providers", icon: <UserCheck className="w-5 h-5" style={{ color: pendingProviders > 0 ? "#e65c00" : "var(--brand)" }} />, color: pendingProviders > 0 ? "#e65c00" : "#14331f", bg: pendingProviders > 0 ? "#fff4ed" : "#f2f7f3", border: pendingProviders > 0 ? "#ffd9b8" : "#d0e4d8" },
    { label: "Open Requests", value: openRequests, href: "/admin/requests", icon: <FileText className="w-5 h-5 text-brand" />, color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Open Complaints", value: openComplaints, href: "/admin/complaints", icon: <AlertTriangle className="w-5 h-5" style={{ color: openComplaints > 0 ? "#a32d2d" : "var(--brand)" }} />, color: openComplaints > 0 ? "#a32d2d" : "#14331f", bg: openComplaints > 0 ? "#fdf2f2" : "#f2f7f3", border: openComplaints > 0 ? "#fbd5d5" : "#d0e4d8" },
    { label: "Reviews to Moderate", value: pendingReviews, href: "/admin/reviews", icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500 stroke-none" />, color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Approved Providers", value: approvedProviders, href: "/admin/providers", icon: <CheckCircle className="w-5 h-5 text-brand" />, color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Completed Requests", value: completedRequests, href: "/admin/requests", icon: <Target className="w-5 h-5 text-brand" />, color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Total Users", value: totalUsers, href: "/admin/users", icon: <Users className="w-5 h-5 text-brand" />, color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
    { label: "Total Providers", value: totalProviders, href: "/admin/providers", icon: <Building className="w-5 h-5 text-brand" />, color: "#14331f", bg: "#f2f7f3", border: "#d0e4d8" },
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
      <div className="mb-6 rounded-2xl p-5 md:p-7" style={{ background: "linear-gradient(120deg, var(--forest) 0%, #0c234a 100%)" }}>
        <p className="text-[12px] font-semibold uppercase tracking-widest mb-1 text-sage" style={{ color: "var(--sage)" }}>Cloud AIF Admin</p>
        <h1 className="text-[24px] md:text-[28px] font-display font-bold text-white mb-1">Welcome back, {firstName} 👋</h1>
        <p className="text-[13px] md:text-[14px]" style={{ color: "#cbd5e1" }}>
          {pendingProviders > 0
            ? `You have ${pendingProviders} provider application${pendingProviders > 1 ? "s" : ""} awaiting review.`
            : "All provider applications are up to date."}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 mb-8">
        {statCards.map(({ label, value, href, icon, color, bg, border }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border p-4 md:p-5 transition hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
            style={{ borderColor: border, background: bg }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[20px]">{icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.04)", color }}>View</span>
            </div>
            <div>
              <div className="font-display text-[28px] md:text-[36px] font-bold leading-none mb-0.5" style={{ color }}>{value}</div>
              <div className="text-[12px] font-medium text-slate" style={{ color: "var(--slate)" }}>{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Provider Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-forest">Recent Provider Applications</h2>
            <Link href="/admin/providers" className="text-[12.5px] font-bold text-emerald">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentProviders.length === 0 ? (
              <p className="text-[13px] text-slate">No providers yet.</p>
            ) : (
              recentProviders.map((p) => (
                <Link key={p.id} href={`/admin/providers/${p.id}`} className="flex items-center justify-between rounded-xl border px-4 py-3 transition hover:bg-mist" style={{ borderColor: "var(--line)" }}>
                  <div>
                    <div className="text-[13.5px] font-semibold text-forest">{p.displayName}</div>
                    <div className="text-[11.5px] text-slate">{p.primaryCategory?.name ?? "—"} · {p.createdAt.toLocaleDateString()}</div>
                  </div>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: (statusColors[p.status] ?? "#6b7280") + "22", color: statusColors[p.status] ?? "#6b7280" }}>
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
            <h2 className="text-[16px] font-semibold text-forest">Recent Service Requests</h2>
            <Link href="/admin/requests" className="text-[12.5px] font-bold text-emerald">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-[13px] text-slate">No requests yet.</p>
            ) : (
              recentRequests.map((r) => (
                <Link key={r.id} href={`/request/${r.id}`} className="flex items-center justify-between rounded-xl border px-4 py-3 transition hover:bg-mist" style={{ borderColor: "var(--line)" }}>
                  <div>
                    <div className="text-[13.5px] font-semibold text-forest">{r.title}</div>
                    <div className="text-[11.5px] text-slate">{r.category?.name ?? "—"} · {r.createdAt.toLocaleDateString()}</div>
                  </div>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: (statusColors[r.status] ?? "#6b7280") + "22", color: statusColors[r.status] ?? "#6b7280" }}>
                    {r.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ⚠ Needs Admin Attention — auto-matcher couldn't fill these */}
      {stuckRequests.length > 0 && (
        <div className="mt-6 rounded-2xl border p-5 bg-red-50/50" style={{ borderColor: "#fbd5d5" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <h2 className="text-[16px] font-semibold text-rose-800">
              Needs Your Attention ({stuckRequests.length})
            </h2>
            <span className="ml-auto text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-rose-700">
              No matching provider
            </span>
          </div>
          <p className="text-[13px] mb-4 text-rose-800/90 leading-relaxed">
            These requests were submitted by customers but no matching provider was found after multiple attempts.
            Please manually assign a provider or contact the customer.
          </p>
          <div className="space-y-2">
            {stuckRequests.map((r) => (
              <Link
                key={r.id}
                href={`/request/${r.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border px-4 py-3 transition hover:bg-red-50 bg-white"
                style={{ borderColor: "#fbd5d5" }}
              >
                <div>
                  <div className="text-[13.5px] font-semibold text-rose-900">{r.title}</div>
                  <div className="text-[11.5px] mt-0.5 text-rose-800/80">
                    {r.category?.name} · {r.locality ?? "Shivamogga"} · {r.matchAttempts} match attempt{r.matchAttempts !== 1 ? "s" : ""} failed
                    {r.lastMatchedAt && ` · Last tried ${new Date(r.lastMatchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                  </div>
                </div>
                <span className="text-[11.5px] font-bold px-3 py-1.5 rounded-lg bg-red-50 text-rose-700 border border-red-100 text-center shrink-0">
                  Assign Manually →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
