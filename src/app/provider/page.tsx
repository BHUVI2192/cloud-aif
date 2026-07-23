import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import Link from "next/link";
import { redirect } from "next/navigation";
import { withTiming } from "@/lib/timing";
import { getProviderRoiMetrics } from "@/lib/attribution";
import ProviderRoiCard from "@/components/ProviderRoiCard";
import ProfileCompletenessCard from "@/components/ProfileCompletenessCard";
import ProviderScorecardCard from "@/components/ProviderScorecardCard";

export const dynamic = "force-dynamic";

export default async function ProviderHome() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider");
  
  const { result: [provider, customer], durationMs } = await withTiming(() =>
    Promise.all([
      db.providerProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          documents: { select: { status: true } },
          portfolio: { select: { id: true } },
          availability: { select: { id: true } },
          _count: {
            select: {
              assignments: true,
              reviewsRecv: true,
            },
          },
        },
      }),
      db.customerProfile.findUnique({ where: { userId: session.user.id } }),
    ])
  );

  if (process.env.NODE_ENV !== "production" && durationMs > 150) {
    console.warn(`[RSC SLOW FETCH ${durationMs}ms]: /provider`);
  }

  if (!provider && !customer) {
    redirect("/choose-role");
  }

  if (!provider && customer) {
    redirect("/customer");
  }

  const [pending, accepted] = provider
    ? await Promise.all([
        db.providerAssignment.count({ where: { providerId: provider.id, status: "PENDING" } }),
        db.providerAssignment.count({ where: { providerId: provider.id, status: "ACCEPTED" } }),
      ])
    : [0, 0];

  const reviews = provider?._count.reviewsRecv ?? 0;

  const stats = [
    ["Verification", provider?.status.replace(/_/g, " ").toLowerCase() ?? "—"],
    ["New leads", String(pending)],
    ["Active jobs", String(accepted)],
    ["Rating", provider ? `★ ${provider.ratingAverage.toFixed(1)} (${reviews})` : "—"],
  ];

  const roiMetrics = provider ? await getProviderRoiMetrics(provider.id) : null;

  return (
    <DashboardShell title="Overview" nav={PROVIDER_NAV} active="/provider" user={session.user}>
      <div className="card mb-6 flex flex-col sm:flex-row items-center gap-5 bg-white" style={{ border: "1px solid var(--line)" }}>
        {provider?.profileImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={provider.profileImage}
            alt="Profile Avatar"
            className="w-16 h-16 rounded-full object-cover border-2"
            style={{ borderColor: "var(--brand)" }}
          />
        )}
        <div className="text-center sm:text-left">
          <h2 className="text-[20px] font-bold" style={{ color: "var(--forest)" }}>Welcome back, {provider?.displayName || session.user.name}!</h2>
          <p className="text-[14px]" style={{ color: "var(--slate)" }}>Manage your jobs, view client requests, and edit your business profile details.</p>
        </div>
      </div>

      {/* Quick Actions Navigation Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link
          href="/provider/requests"
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-outline-variant bg-white hover:border-primary active:scale-95 transition-all text-center shadow-sm"
        >
          <span className="text-xl mb-1">📋</span>
          <span className="text-[12px] font-extrabold text-forest uppercase tracking-wider">Job Leads</span>
        </Link>
        <Link
          href="/provider/profile"
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-outline-variant bg-white hover:border-primary active:scale-95 transition-all text-center shadow-sm"
        >
          <span className="text-xl mb-1">💼</span>
          <span className="text-[12px] font-extrabold text-forest uppercase tracking-wider">My Profile</span>
        </Link>
        <Link
          href="/provider/schedule"
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-outline-variant bg-white hover:border-primary active:scale-95 transition-all text-center shadow-sm"
        >
          <span className="text-xl mb-1">📅</span>
          <span className="text-[12px] font-extrabold text-forest uppercase tracking-wider">My Schedule</span>
        </Link>
      </div>

      {provider && (
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <ProfileCompletenessCard profile={provider as any} />
          <ProviderScorecardCard
            ratingAverage={provider.ratingAverage}
            ratingCount={reviews}
            leadResponseRate={provider.leadResponseRate}
            jobsCompleted={provider.jobsCompleted}
          />
        </div>
      )}

      {roiMetrics && (
        <div className="mb-6">
          <ProviderRoiCard metrics={roiMetrics} />
        </div>
      )}

      {!provider?.verifiedBadge && (
        <div className="card mb-6" style={{ background: "var(--mist)", borderColor: "var(--sage)" }}>
          <p className="text-[15px] font-semibold" style={{ color: "var(--forest)" }}>Your profile is {provider?.status.replace(/_/g, " ").toLowerCase()}.</p>
          <p className="mt-1 text-[14px]" style={{ color: "var(--slate)" }}>You&apos;ll start receiving leads once an admin approves your verification.</p>
          <Link href="/provider/verification-status" className="btn btn-primary mt-3">Check status</Link>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="card">
            <div className="text-[13px]" style={{ color: "var(--slate)" }}>{k}</div>
            <div className="mt-1 font-display text-[24px] font-semibold capitalize" style={{ color: "var(--forest)" }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link className="btn btn-primary" href="/provider/requests">View requests</Link>
        <Link className="btn btn-ghost" href="/provider/profile">Edit profile</Link>
        <a
          href="/api/provider/export-statement"
          download
          className="btn btn-secondary text-xs !py-2.5 !px-4 bg-emerald-50 text-emerald-900 border-emerald-300 font-bold"
        >
          📄 Download Bank & Tax Statement (CSV)
        </a>
      </div>
    </DashboardShell>
  );
}
