import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function ProviderSettings() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/settings");
  const provider = await db.providerProfile.findUnique({ where: { userId: session.user.id } });

  return (
    <DashboardShell title="Settings" nav={PROVIDER_NAV} active="/provider/settings" user={session.user}>
      <div className="card max-w-[560px] space-y-4">
        <div>
          <label className="label">Display name</label>
          <input className="input" defaultValue={provider?.displayName ?? ""} />
        </div>
        <div>
          <label className="label">Headline</label>
          <input className="input" defaultValue={provider?.headline ?? ""} />
        </div>
        <div>
          <label className="label">Emergency contact</label>
          <input className="input" defaultValue={provider?.emergencyContact ?? ""} />
        </div>
        <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--line)" }}>
          <div>
            <div className="text-[14px] font-semibold" style={{ color: "var(--forest)" }}>Active status</div>
            <div className="text-[13px]" style={{ color: "var(--slate)" }}>Show your profile to customers</div>
          </div>
          <span className="badge capitalize">{provider?.isActive ? "active" : "inactive"}</span>
        </div>
        <button className="btn btn-primary">Save changes</button>
        <p className="text-[12px]" style={{ color: "var(--slate)" }}>Edit handlers are stubbed in this build — wire to a PATCH route to persist.</p>
      </div>
    </DashboardShell>
  );
}
