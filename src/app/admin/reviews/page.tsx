import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AdminReviews() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/reviews");
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: true, provider: true },
  });

  return (
    <DashboardShell title="Reviews" nav={ADMIN_NAV} active="/admin/reviews" user={session.user}>
      {reviews.length === 0 ? (
        <div className="card text-[15px]" style={{ color: "var(--slate)" }}>No reviews yet.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between">
                <div className="text-[15px]" style={{ color: "var(--emerald)" }}>{"★".repeat(r.rating)}<span style={{ color: "var(--line)" }}>{"★".repeat(5 - r.rating)}</span></div>
                <span className="badge capitalize">{r.status.replace(/_/g, " ").toLowerCase()}</span>
              </div>
              {r.comment && <p className="mt-1 text-[14px]" style={{ color: "var(--ink)" }}>{r.comment}</p>}
              <p className="mt-1 text-[12px]" style={{ color: "var(--slate)" }}>{r.author.name ?? "Customer"} → {r.provider.displayName} · {r.createdAt.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
