import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function ProviderReviews() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/reviews");
  const provider = await db.providerProfile.findUnique({ where: { userId: session.user.id } });
  const reviews = provider
    ? await db.review.findMany({ where: { providerId: provider.id, status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, include: { author: true } })
    : [];

  return (
    <DashboardShell title="Reviews" nav={PROVIDER_NAV} active="/provider/reviews" user={session.user}>
      <div className="mb-5 card max-w-[640px]">
        <span className="font-display text-[28px] font-semibold" style={{ color: "var(--forest)" }}>★ {provider?.ratingAverage.toFixed(1) ?? "0.0"}</span>
        <span className="ml-2 text-[14px]" style={{ color: "var(--slate)" }}>{provider?.ratingCount ?? 0} reviews</span>
      </div>
      {reviews.length === 0 ? (
        <div className="card text-[15px]" style={{ color: "var(--slate)" }}>No reviews yet.</div>
      ) : (
        <div className="space-y-3 max-w-[640px]">
          {reviews.map((r) => (
            <div key={r.id} className="card">
              <div className="text-[15px]" style={{ color: "var(--emerald)" }}>{"★".repeat(r.rating)}<span style={{ color: "var(--line)" }}>{"★".repeat(5 - r.rating)}</span></div>
              {r.comment && <p className="mt-1 text-[14px]" style={{ color: "var(--ink)" }}>{r.comment}</p>}
              <p className="mt-1 text-[12px]" style={{ color: "var(--slate)" }}>{r.author.name ?? "Customer"} · {r.createdAt.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
