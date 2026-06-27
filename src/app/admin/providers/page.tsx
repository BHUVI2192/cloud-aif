import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProviders() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/providers");
  const providers = await db.providerProfile.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: true, primaryCategory: true },
  });

  return (
    <DashboardShell title="Providers" nav={ADMIN_NAV} active="/admin/providers" user={session.user}>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead><tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
            <th className="px-4 py-3 text-left">Provider</th><th className="text-left">Category</th><th className="text-left">Status</th><th className="text-right px-4">Action</th>
          </tr></thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3">
                  <div className="font-semibold" style={{ color: "var(--forest)" }}>{p.displayName}</div>
                  <div className="text-[12px]" style={{ color: "var(--slate)" }}>{p.user.email}</div>
                </td>
                <td style={{ color: "var(--slate)" }}>{p.primaryCategory?.name ?? "—"}</td>
                <td><span className="badge capitalize">{p.status.replace(/_/g, " ").toLowerCase()}</span></td>
                <td className="px-4 text-right"><Link className="btn btn-ghost !py-1.5 !text-[13px]" href={`/admin/providers/${p.id}`}>Review</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
