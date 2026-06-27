import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV, PROVIDER_NAV, CUSTOMER_NAV } from "@/lib/nav";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import ReviewBox from "@/components/ReviewBox";
import RequestStatusActions from "@/components/RequestStatusActions";
import AdminAssignmentPanel from "@/components/AdminAssignmentPanel";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft", SUBMITTED: "Submitted", MATCHING: "Finding a provider", ASSIGNED: "Provider assigned",
  ACCEPTED: "Accepted", IN_PROGRESS: "In progress", COMPLETED: "Completed", CANCELLED: "Cancelled",
  EXPIRED: "Expired", DISPUTED: "Disputed",
};

export default async function RequestDetail({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) redirect(`/login?callbackUrl=/request/${params.id}`);

  const request = await db.serviceRequest.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      subservice: true,
      serviceArea: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      assignments: {
        include: {
          provider: {
            include: {
              user: { select: { name: true, email: true, phone: true, image: true } },
            },
          },
        },
      },
      review: true,
    },
  });
  if (!request) notFound();
  
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const userRole = dbUser?.role ?? session.user.role;

  const isOwner = request.customerId === session.user.id;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const isAssignedProvider = request.assignments.some((a) => a.provider?.userId === session.user.id);
  
  console.log("DEBUG REQUEST_DETAIL:", {
    userId: session?.user?.id,
    userRole,
    isOwner,
    isAdmin,
    isAssignedProvider,
    customerId: request.customerId,
  });

  if (!isOwner && !isAdmin && !isAssignedProvider) redirect("/");

  const matchingProviders = isAdmin
    ? await db.providerProfile.findMany({
        where: {
          status: "APPROVED",
          isActive: true,
          deletedAt: null,
          ...(request.subserviceId
            ? { subservices: { some: { subserviceId: request.subserviceId } } }
            : { primaryCategoryId: request.categoryId }),
          serviceAreas: { some: { serviceAreaId: request.serviceAreaId || undefined } },
        },
        include: {
          user: true,
          assignments: { where: { requestId: request.id } },
        },
      })
    : [];

  const accepted = request.assignments.find((a) => a.status === "ACCEPTED");

  // Determine role-specific navigation for DashboardShell
  const sidebarNav = isAdmin
    ? ADMIN_NAV
    : userRole === "PROVIDER"
    ? PROVIDER_NAV
    : CUSTOMER_NAV;

  const activeLink = userRole === "PROVIDER"
    ? "/provider/requests"
    : userRole === "CUSTOMER"
    ? "/customer"
    : "/admin/requests";

  const backLink = userRole === "CUSTOMER" ? "/customer" : userRole === "PROVIDER" ? "/provider/requests" : "/admin/requests";

  return (
    <DashboardShell
      title={`Request Details`}
      nav={sidebarNav}
      active={activeLink}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: userRole,
        image: session.user.image,
      }}
    >
      <div className="mx-auto max-w-[820px]">
        <Link href={backLink} className="text-[14px] hover:underline" style={{ color: "var(--brand)" }}>
          ← Back to Requests
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] md:text-[34px] font-bold" style={{ color: "var(--forest)" }}>{request.title}</h1>
          <span className="badge font-semibold">{STATUS_LABEL[request.status]}</span>
        </div>
        <p className="mt-1 text-[14px] md:text-[15px]" style={{ color: "var(--slate)" }}>
          {request.category.name}{request.subservice ? ` · ${request.subservice.name}` : ""} · {request.serviceArea?.name ?? request.locality}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="card">
            <h2 className="mb-3 text-[20px]">Details</h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink)" }}>{request.description}</p>
            <dl className="mt-5 space-y-2 text-[14px]">
              <Row k="Urgency" v={request.urgency.replace(/_/g, " ").toLowerCase()} />
              <Row k="Preferred contact" v={request.contactPreference.toLowerCase()} />
              {request.preferredDate && <Row k="Preferred date" v={request.preferredDate.toLocaleDateString()} />}
              {(request.budgetMin || request.budgetMax) && <Row k="Budget" v={`₹${request.budgetMin ?? "?"} – ₹${request.budgetMax ?? "?"}`} />}
              {request.addressLine && <Row k="Address" v={request.addressLine} />}
              {request.phone && <Row k="Contact Phone" v={request.phone} />}
              {request.alternatePhone && <Row k="Alternate Phone" v={request.alternatePhone} />}
            </dl>

            {request.latitude && request.longitude && (
              <div className="mt-5 border-t pt-4 space-y-3" style={{ borderColor: "var(--line)" }}>
                <span className="label block text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--slate)" }}>Service Location Pin</span>
                
                {/* Google Maps embed iframe */}
                <div className="w-full h-[200px] rounded-xl overflow-hidden border" style={{ borderColor: "var(--line)" }}>
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${request.latitude},${request.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-3" style={{ background: "var(--mist)", border: "1px solid var(--line)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">📍</span>
                    <div className="text-[13px] font-mono" style={{ color: "var(--forest)" }}>
                      {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                    </div>
                  </div>
                  {(isAssignedProvider || isAdmin) && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary text-[13px] py-1.5 px-4"
                      style={{ minHeight: "auto", display: "inline-flex", alignItems: "center" }}
                    >
                      Get Directions ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Assigned Provider Card — visible to customer once accepted */}
            {accepted && isOwner && (
              <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}>
                <p className="label mb-3">Your Assigned Provider</p>
                <div className="rounded-xl border p-4" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <div className="flex items-center gap-3 mb-3">
                    {accepted.provider.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={accepted.provider.user.image} alt="Provider" className="h-12 w-12 rounded-full object-cover border" style={{ borderColor: "#bbf7d0" }} />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-xl font-display text-[20px] font-bold text-white" style={{ background: "var(--brand)" }}>
                        {accepted.provider.displayName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-[16px] font-semibold" style={{ color: "var(--forest)" }}>{accepted.provider.displayName}</div>
                      <div className="text-[13px]" style={{ color: "#15803d" }}>★ {accepted.provider.ratingAverage.toFixed(1)} · {accepted.provider.jobsCompleted} jobs completed</div>
                    </div>
                    <span className="ml-auto text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "#16a34a22", color: "#16a34a" }}>Confirmed ✓</span>
                  </div>
                  <div className="space-y-2 text-[13px]">
                    {accepted.provider.user?.phone && (
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <span style={{ color: "var(--slate)" }}>Phone:</span>
                        <a href={`tel:${accepted.provider.user.phone}`} className="font-semibold" style={{ color: "var(--brand)" }}>
                          {accepted.provider.user.phone}
                        </a>
                      </div>
                    )}
                    {accepted.provider.experienceYears != null && (
                      <div className="flex items-center gap-2">
                        <span>🏆</span>
                        <span style={{ color: "var(--slate)" }}>Experience:</span>
                        <span style={{ color: "var(--forest)" }}>{accepted.provider.experienceYears} years</span>
                      </div>
                    )}
                    {accepted.provider.businessName && (
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span style={{ color: "var(--slate)" }}>Business:</span>
                        <span style={{ color: "var(--forest)" }}>{accepted.provider.businessName}</span>
                      </div>
                    )}
                  </div>
                  {accepted.provider.user?.phone && (
                    <div className="mt-4 space-y-2">
                      <a
                        href={`tel:${accepted.provider.user.phone}`}
                        className="btn btn-primary text-[14px] w-full text-center"
                        style={{ display: "block", background: "#16a34a" }}
                      >
                        📞 Call Your Provider
                      </a>
                      <a
                        href={`https://wa.me/91${accepted.provider.user.phone.replace(/\D/g, "").slice(-10)}?text=Hi%20${encodeURIComponent(accepted.provider.displayName)},%20I'm%20contacting%20you%20from%20Cloud%20AIF%20regarding%20my%20service%20request%20"${encodeURIComponent(request.title)}".`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary text-[14px] w-full text-center transition"
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
                </div>
              </div>
            )}

            {/* For admin/provider views — compact provider row */}
            {accepted && !isOwner && (
              <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--line)" }}>
                <div className="grid h-[44px] w-[44px] place-items-center rounded-xl font-display font-semibold text-white" style={{ background: "var(--brand)" }}>{accepted.provider.displayName.charAt(0)}</div>
                <div>
                  <div className="text-[15px] font-semibold" style={{ color: "var(--forest)" }}>{accepted.provider.displayName}</div>
                  <div className="text-[13px]" style={{ color: "var(--slate)" }}>Assigned provider · ★ {accepted.provider.ratingAverage.toFixed(1)}</div>
                </div>
              </div>
            )}

            {isOwner && request.status === "COMPLETED" && !request.review && accepted && (
              <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}>
                <ReviewBox requestId={request.id} />
              </div>
            )}
            {request.review && (
              <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}>
                <p className="label">Your review</p>
                <p className="text-[15px]" style={{ color: "var(--emerald)" }}>{"★".repeat(request.review.rating)}</p>
                {request.review.comment && <p className="text-[14px]" style={{ color: "var(--slate)" }}>{request.review.comment}</p>}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <RequestStatusActions
              requestId={request.id}
              currentStatus={request.status}
              isOwner={isOwner}
              isAdmin={isAdmin}
              isProvider={isAssignedProvider}
            />

          {isAdmin && (
            <AdminAssignmentPanel
              requestId={request.id}
              providers={matchingProviders}
            />
          )}

          <div className="card">
            <h2 className="mb-4 text-[20px]">Progress</h2>
            <ol className="relative space-y-4 border-l pl-5" style={{ borderColor: "var(--line)" }}>
              {request.statusHistory.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full" style={{ background: "var(--emerald)" }} />
                  <div className="text-[14px] font-semibold" style={{ color: "var(--forest)" }}>{STATUS_LABEL[h.toStatus]}</div>
                  <div className="text-[12px]" style={{ color: "var(--slate)" }}>{h.createdAt.toLocaleString()}</div>
                  {h.note && <div className="text-[13px]" style={{ color: "var(--slate)" }}>{h.note}</div>}
                </li>
              ))}
            </ol>
          </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt style={{ color: "var(--slate)" }}>{k}</dt>
      <dd className="text-right capitalize" style={{ color: "var(--forest)" }}>{v}</dd>
    </div>
  );
}
