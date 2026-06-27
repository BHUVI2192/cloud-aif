import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

const STEPS = ["DRAFT", "PENDING_VERIFICATION", "UNDER_REVIEW", "APPROVED"];

export default async function VerificationStatus() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/verification-status");
  const provider = await db.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: { documents: true, verifications: { orderBy: { reviewedAt: "desc" }, take: 5, include: { reviewer: true } } },
  });
  if (!provider) return null;

  const currentIdx = STEPS.indexOf(provider.status === "NEEDS_MORE_INFO" ? "UNDER_REVIEW" : provider.status);

  return (
    <DashboardShell title="Verification status" nav={PROVIDER_NAV} active="/provider/verification-status" user={session.user}>
      <div className="card mb-6 max-w-[640px]">
        <span className="badge capitalize">{provider.status.replace(/_/g, " ").toLowerCase()}</span>
        <div className="mt-6 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center text-center">
              <div className="grid h-9 w-9 place-items-center rounded-full text-[14px] font-semibold" style={i <= currentIdx ? { background: "var(--brand)", color: "#fff" } : { background: "var(--mist)", color: "var(--slate)" }}>{i + 1}</div>
              <span className="mt-2 text-[11px] capitalize" style={{ color: "var(--slate)" }}>{s.replace(/_/g, " ").toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-6 max-w-[640px]">
        <h2 className="mb-3 text-[18px]">Documents</h2>
        {provider.documents.length === 0 ? (
          <p className="text-[14px]" style={{ color: "var(--slate)" }}>No documents uploaded yet.</p>
        ) : (
          <ul className="space-y-2 text-[14px]">
            {provider.documents.map((d) => (
              <li key={d.id} className="flex justify-between border-b pb-2 last:border-0" style={{ borderColor: "var(--line)" }}>
                <span className="capitalize" style={{ color: "var(--forest)" }}>{d.type.replace(/_/g, " ").toLowerCase()}</span>
                <span className="badge capitalize">{d.status.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {provider.verifications.length > 0 && (
        <div className="card max-w-[640px]">
          <h2 className="mb-3 text-[18px]">Review history</h2>
          <ul className="space-y-3 text-[14px]">
            {provider.verifications.map((v) => (
              <li key={v.id}>
                <span className="capitalize" style={{ color: "var(--forest)" }}>{v.decision.replace(/_/g, " ").toLowerCase()}</span>
                <span style={{ color: "var(--slate)" }}> · {v.reviewedAt.toLocaleDateString()}</span>
                {v.notes && <p style={{ color: "var(--slate)" }}>{v.notes}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}
