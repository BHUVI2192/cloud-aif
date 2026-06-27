import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import AssignmentActions from "@/components/AssignmentActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fff4ed", color: "#e65c00" },
  ACCEPTED: { bg: "#f0fdf4", color: "#16a34a" },
  DECLINED: { bg: "#fdf2f2", color: "#dc2626" },
  COMPLETED: { bg: "#f0fdf4", color: "#16a34a" },
  CANCELLED: { bg: "#f8fafc", color: "#6b7280" },
};

const URGENCY_COLORS: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low urgency", color: "#16a34a" },
  MEDIUM: { label: "Medium urgency", color: "#d97706" },
  HIGH: { label: "High urgency", color: "#e65c00" },
  EMERGENCY: { label: "🚨 Emergency", color: "#dc2626" },
};

export default async function ProviderRequests() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/requests");
  const provider = await db.providerProfile.findUnique({ where: { userId: session.user.id } });

  const assignments = provider
    ? await db.providerAssignment.findMany({
        where: { providerId: provider.id },
        orderBy: { assignedAt: "desc" },
        include: {
          request: {
            include: {
              category: true,
              subservice: true,
              serviceArea: true,
            },
          },
        },
      })
    : [];

  const pending = assignments.filter((a) => a.status === "PENDING");
  const active = assignments.filter((a) => ["ACCEPTED"].includes(a.status));
  const past = assignments.filter((a) => ["DECLINED", "COMPLETED", "CANCELLED"].includes(a.status));

  function RequestCard({ a, showActions }: { a: typeof assignments[0]; showActions: boolean }) {
    const r = a.request;
    const urgency = URGENCY_COLORS[r.urgency] ?? { label: r.urgency, color: "#6b7280" };
    const statusStyle = STATUS_COLORS[a.status] ?? { bg: "#f8fafc", color: "#6b7280" };

    return (
      <div className="card overflow-hidden !p-0">
        {/* Card Header */}
        <div className="p-5 border-b" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-semibold" style={{ color: "var(--forest)" }}>{r.title}</h2>
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize"
                  style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                  {a.status.toLowerCase()}
                </span>
              </div>
              <p className="text-[13px] mt-1" style={{ color: "var(--slate)" }}>
                {r.category.name}{r.subservice ? ` · ${r.subservice.name}` : ""} · {r.serviceArea?.name ?? r.locality ?? "—"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>Assigned</div>
              <div className="text-[13px]" style={{ color: "var(--forest)" }}>{a.assignedAt.toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="p-5 grid gap-5 md:grid-cols-[1fr_320px]">
          {/* Left: Full Job Details */}
          <div className="space-y-5">
            {/* Description */}
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--slate)" }}>Job Description</p>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink)" }}>{r.description}</p>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--mist)" }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slate)" }}>Urgency</div>
                <div className="text-[14px] font-semibold" style={{ color: urgency.color }}>{urgency.label}</div>
              </div>

              {(r.budgetMin || r.budgetMax) && (
                <div className="rounded-xl p-3" style={{ background: "var(--mist)" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slate)" }}>Budget Range</div>
                  <div className="text-[14px] font-semibold" style={{ color: "var(--forest)" }}>
                    ₹{r.budgetMin ?? "?"} – ₹{r.budgetMax ?? "?"}
                  </div>
                </div>
              )}

              {r.preferredDate && (
                <div className="rounded-xl p-3" style={{ background: "var(--mist)" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slate)" }}>Preferred Date</div>
                  <div className="text-[14px] font-semibold" style={{ color: "var(--forest)" }}>{r.preferredDate.toLocaleDateString()}</div>
                </div>
              )}

              <div className="rounded-xl p-3" style={{ background: "var(--mist)" }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--slate)" }}>Contact Preference</div>
                <div className="text-[14px] font-semibold capitalize" style={{ color: "var(--forest)" }}>{r.contactPreference?.toLowerCase()}</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "var(--line)" }}>
              <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>Customer Contact</p>
              {a.status === "ACCEPTED" ? (
                <>
                  {r.phone && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">📞</span>
                        <a href={`tel:${r.phone}`} className="text-[14px] font-semibold" style={{ color: "var(--brand)" }}>{r.phone}</a>
                      </div>
                      <a
                        href={`https://wa.me/91${r.phone.replace(/\D/g, "").slice(-10)}?text=Hi,%20I'm%20your%20assigned%20Cloud%20AIF%20service%20provider%20for%20your%20request%20"${encodeURIComponent(r.title)}".`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary py-1.5 px-3 text-[13px] w-full text-center transition"
                        style={{
                          display: "block",
                          color: "#25D366",
                          borderColor: "#25D366",
                          background: "transparent",
                          fontWeight: 600,
                        }}
                      >
                        💬 Message on WhatsApp
                      </a>
                    </div>
                  )}
                  {r.alternatePhone && (
                    <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
                      <span className="text-[16px]">📱</span>
                      <a href={`tel:${r.alternatePhone}`} className="text-[14px]" style={{ color: "var(--slate)" }}>{r.alternatePhone}</a>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[13px]" style={{ color: "var(--slate)" }}>
                  🔒 Accept this job to view customer contact info.
                </div>
              )}
            </div>
          </div>

          {/* Right: Location */}
          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>Service Location</p>

            {/* Address */}
            <div className="rounded-xl border p-3 space-y-1" style={{ borderColor: "var(--line)" }}>
              {r.addressLine && (
                <div className="flex gap-2">
                  <span className="text-[15px] shrink-0">🏠</span>
                  <span className="text-[13px]" style={{ color: "var(--forest)" }}>{r.addressLine}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-[15px] shrink-0">📍</span>
                <span className="text-[13px]" style={{ color: "var(--forest)" }}>
                  {r.locality ?? r.serviceArea?.name ?? "—"}{r.pincode ? `, ${r.pincode}` : ""}
                </span>
              </div>
            </div>

            {/* Map */}
            {r.latitude && r.longitude ? (
              <>
                <div className="w-full rounded-xl overflow-hidden border" style={{ height: "200px", borderColor: "var(--line)" }}>
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${r.latitude},${r.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
                <div className="text-[12px] text-center font-mono" style={{ color: "var(--slate)" }}>
                  {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full text-center text-[14px]"
                  style={{ display: "block" }}
                >
                  🗺 Get Directions ↗
                </a>
              </>
            ) : (
              <div className="rounded-xl border p-4 text-center text-[13px]" style={{ borderColor: "var(--line)", color: "var(--slate)" }}>
                No precise location pin was set.
              </div>
            )}
          </div>
        </div>

        {/* Footer: Actions */}
        {(showActions && a.status === "PENDING") || a.status === "ACCEPTED" ? (
          <div className="px-5 pb-5">
            {a.status === "PENDING" && (
              <p className="text-[13px] font-medium mb-3" style={{ color: "var(--slate)" }}>
                Review the full details above, then accept or decline this job.
              </p>
            )}
            <AssignmentActions
              assignmentId={a.id}
              assignmentStatus={a.status}
              requestId={r.id}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <DashboardShell title="Requests" nav={PROVIDER_NAV} active="/provider/requests" user={session.user}>
      {assignments.length === 0 ? (
        <div className="card text-[15px]" style={{ color: "var(--slate)" }}>
          No leads yet. Once you&apos;re approved, matched requests appear here.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending */}
          {pending.length > 0 && (
            <section>
              <h2 className="mb-4 text-[18px] font-semibold flex items-center gap-2" style={{ color: "var(--forest)" }}>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                New Requests ({pending.length})
              </h2>
              <div className="space-y-5">
                {pending.map((a) => <RequestCard key={a.id} a={a} showActions={true} />)}
              </div>
            </section>
          )}

          {/* Active */}
          {active.length > 0 && (
            <section>
              <h2 className="mb-4 text-[18px] font-semibold flex items-center gap-2" style={{ color: "var(--forest)" }}>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                Active Jobs ({active.length})
              </h2>
              <div className="space-y-5">
                {active.map((a) => <RequestCard key={a.id} a={a} showActions={false} />)}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-[18px] font-semibold" style={{ color: "var(--slate)" }}>
                Past Requests ({past.length})
              </h2>
              <div className="space-y-4">
                {past.map((a) => <RequestCard key={a.id} a={a} showActions={false} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
