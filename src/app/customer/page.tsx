import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { CUSTOMER_NAV } from "@/lib/nav";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUS_BADGE_STYLE: Record<string, string> = {
  DRAFT: "badge-draft",
  SUBMITTED: "badge-submitted",
  MATCHING: "badge-matching",
  ASSIGNED: "badge-assigned",
  ACCEPTED: "badge-accepted",
  IN_PROGRESS: "badge-progress",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
  EXPIRED: "badge-expired",
  DISPUTED: "badge-disputed",
};

export default async function CustomerDashboard() {
  // Enforce customer role and get authenticated session
  const session = await requireRoleOrRedirect(["CUSTOMER"], "/customer");

  // Check if user has customer or provider profile. If neither, redirect to role selection
  const [customerProfile, providerProfile] = await Promise.all([
    db.customerProfile.findUnique({ where: { userId: session.user.id } }),
    db.providerProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!customerProfile && !providerProfile) {
    redirect("/choose-role");
  }

  if (!customerProfile && providerProfile) {
    redirect("/provider");
  }

  // Fetch customer's requests
  const requests = await db.serviceRequest.findMany({
    where: {
      customerId: session.user.id,
      deletedAt: null,
    },
    include: {
      category: true,
      subservice: true,
      serviceArea: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <DashboardShell
      title="My Service Requests"
      nav={CUSTOMER_NAV}
      active="/customer"
      user={session.user}
    >
      {requests.length === 0 ? (
        <div className="card text-center py-12 px-6">
          <div
            className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full text-[26px]"
            style={{ background: "var(--mist)", color: "var(--brand)" }}
          >
            👋
          </div>
          <h2 className="text-[22px] font-semibold" style={{ color: "var(--forest)" }}>
            Welcome to Cloud AIF!
          </h2>
          <p className="mx-auto mb-6 mt-2 max-w-[28em] text-[15px]" style={{ color: "var(--slate)" }}>
            You haven&apos;t created any service requests yet. Tell us what you need and we will match you with a verified provider in Shivamogga.
          </p>
          <Link href="/services" className="btn btn-primary inline-flex justify-center">
            Request a Service
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-[15px]" style={{ color: "var(--slate)" }}>
              Manage and track the progress of your service requests.
            </p>
            <Link href="/services" className="btn btn-primary !py-2 !text-[13px]">
              + New Request
            </Link>
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block card !p-0 overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
                  <th className="px-5 py-3.5 text-left">Service details</th>
                  <th className="text-left">Locality</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Date requested</th>
                  <th className="px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                    <td className="px-5 py-4">
                      <div className="font-semibold" style={{ color: "var(--forest)" }}>
                        {r.title}
                      </div>
                      <div className="text-[12px] mt-0.5" style={{ color: "var(--slate)" }}>
                        {r.category.name} {r.subservice ? `· ${r.subservice.name}` : ""}
                      </div>
                    </td>
                    <td style={{ color: "var(--slate)" }}>
                      {r.serviceArea?.name ?? r.locality ?? "Shivamogga"}
                    </td>
                    <td>
                      <span className={`badge capitalize ${STATUS_BADGE_STYLE[r.status] || ""}`}>
                        {r.status.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </td>
                    <td style={{ color: "var(--slate)" }}>
                      {r.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 text-right">
                      <Link
                        className="btn btn-ghost !py-1.5 !px-3.5 !text-[13px]"
                        href={`/request/${r.id}`}
                      >
                        Track Progress
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Cards Stack */}
          <div className="space-y-4 md:hidden">
            {requests.map((r) => (
              <div key={r.id} className="card p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-slate-900 truncate">
                      {r.title}
                    </h3>
                    <p className="text-[12px] text-slate-500 truncate mt-0.5">
                      {r.category.name} {r.subservice ? `· ${r.subservice.name}` : ""}
                    </p>
                  </div>
                  <span className={`badge shrink-0 capitalize ${STATUS_BADGE_STYLE[r.status] || ""}`}>
                    {r.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[13px] border-t border-b border-line py-3" style={{ color: "var(--slate)" }}>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">Locality</span>
                    <span className="font-semibold text-slate-800">{r.serviceArea?.name ?? r.locality ?? "Shivamogga"}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">Requested on</span>
                    <span className="font-semibold text-slate-800">
                      {r.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <Link
                  className="btn btn-ghost w-full !text-[13px] justify-center py-2.5"
                  href={`/request/${r.id}`}
                >
                  Track Progress →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
