import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProviderReviewActions from "@/components/ProviderReviewActions";

export const dynamic = "force-dynamic";

export default async function AdminProviderDetail({ params }: { params: { id: string } }) {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], `/admin/providers/${params.id}`);
  const provider = await db.providerProfile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      primaryCategory: true,
      documents: true,
      subservices: { include: { subservice: true } },
      serviceAreas: { include: { serviceArea: true } },
      verifications: { orderBy: { reviewedAt: "desc" }, include: { reviewer: true } },
    },
  });
  if (!provider) notFound();

  const rows: [string, string][] = [
    ["Legal name", provider.legalName],
    ["Email", provider.user.email],
    ["Work type", provider.workType.toLowerCase()],
    ["Primary category", provider.primaryCategory?.name ?? "—"],
    ["Experience", `${provider.experienceYears} years`],
    ["Languages", provider.languages.join(", ") || "—"],
    ["Service radius", provider.serviceRadiusKm ? `${provider.serviceRadiusKm} km` : "—"],
    ["Completeness", `${provider.completenessScore}%`],
  ];

  return (
    <DashboardShell title="Provider review" nav={ADMIN_NAV} active="/admin/providers" user={session.user}>
      <Link href="/admin/providers" className="text-[14px]" style={{ color: "var(--emerald)" }}>← All providers</Link>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <div className="card">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl font-display font-semibold text-white" style={{ background: "var(--brand)" }}>{provider.displayName.charAt(0)}</div>
              <div>
                <h2 className="text-[22px]">{provider.displayName}</h2>
                <span className="badge capitalize">{provider.status.replace(/_/g, " ").toLowerCase()}</span>
              </div>
            </div>
            <dl className="space-y-3">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b pb-3 text-[14px] last:border-0" style={{ borderColor: "var(--line)" }}>
                  <dt style={{ color: "var(--slate)" }}>{k}</dt>
                  <dd className="text-right capitalize" style={{ color: "var(--forest)" }}>{v}</dd>
                </div>
              ))}
            </dl>
            {provider.bio && <p className="mt-4 text-[14px]" style={{ color: "var(--slate)" }}>{provider.bio}</p>}
          </div>

          <div className="card">
            <h2 className="mb-3 text-[18px]">Documents</h2>
            {provider.documents.length === 0 ? (
              <p className="text-[14px]" style={{ color: "var(--slate)" }}>No documents uploaded.</p>
            ) : (
              <ul className="space-y-2 text-[14px]">
                {provider.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between border-b pb-2 last:border-0" style={{ borderColor: "var(--line)" }}>
                    <div className="flex flex-col">
                      <span className="capitalize font-semibold" style={{ color: "var(--forest)" }}>{d.type.replace(/_/g, " ").toLowerCase()}</span>
                      {d.fileName && <span className="text-[12px]" style={{ color: "var(--slate)" }}>{d.fileName}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] hover:underline"
                        style={{ color: "var(--brand)" }}
                      >
                        View File ↗
                      </a>
                      <span className="badge capitalize">{d.status.toLowerCase()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[12px]" style={{ color: "var(--slate)" }}>Document files are stored privately and never exposed on public routes.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-3 text-[18px]">Decision</h2>
            <ProviderReviewActions providerId={provider.id} currentStatus={provider.status} />
          </div>
          <div className="card">
            <h2 className="mb-3 text-[18px]">Services & areas</h2>
            <div className="mb-3 flex flex-wrap gap-2">
              {provider.subservices.map((s) => <span key={s.id} className="badge">{s.subservice.name}</span>)}
            </div>
            <div className="flex flex-wrap gap-2">
              {provider.serviceAreas.map((s) => <span key={s.id} className="badge">{s.serviceArea.name}</span>)}
            </div>
          </div>
          {provider.verifications.length > 0 && (
            <div className="card">
              <h2 className="mb-3 text-[18px]">Review history</h2>
              <ul className="space-y-2 text-[13px]">
                {provider.verifications.map((v) => (
                  <li key={v.id}>
                    <span className="capitalize" style={{ color: "var(--forest)" }}>{v.decision.replace(/_/g, " ").toLowerCase()}</span>
                    <span style={{ color: "var(--slate)" }}> · {v.reviewer.name ?? "Admin"} · {v.reviewedAt.toLocaleDateString()}</span>
                    {v.notes && <p style={{ color: "var(--slate)" }}>{v.notes}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
