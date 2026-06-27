import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProviderHome() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider");
  
  const [provider, customer] = await Promise.all([
    db.providerProfile.findUnique({ where: { userId: session.user.id } }),
    db.customerProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!provider && !customer) {
    redirect("/choose-role");
  }

  if (!provider && customer) {
    redirect("/customer");
  }

  const [pending, accepted, reviews] = provider
    ? await Promise.all([
        db.providerAssignment.count({ where: { providerId: provider.id, status: "PENDING" } }),
        db.providerAssignment.count({ where: { providerId: provider.id, status: "ACCEPTED" } }),
        db.review.count({ where: { providerId: provider.id, status: "PUBLISHED" } }),
      ])
    : [0, 0, 0];

  const stats = [
    ["Verification", provider?.status.replace(/_/g, " ").toLowerCase() ?? "—"],
    ["New leads", String(pending)],
    ["Active jobs", String(accepted)],
    ["Rating", provider ? `★ ${provider.ratingAverage.toFixed(1)} (${reviews})` : "—"],
  ];

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
      <div className="mt-6 flex gap-3">
        <Link className="btn btn-primary" href="/provider/requests">View requests</Link>
        <Link className="btn btn-ghost" href="/provider/profile">Edit profile</Link>
      </div>
    </DashboardShell>
  );
}
