import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCachedCategory, getCachedProvidersForCategory } from "@/lib/cache";
import { getSession } from "@/lib/session";
import DashboardShell from "@/components/DashboardShell";
import { CUSTOMER_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const category = await getCachedCategory(params.categorySlug);
  if (!category) notFound();

  const providers = await getCachedProvidersForCategory(category.id);

  const session = await getSession();
  const isCustomer = session?.user?.role === "CUSTOMER";

  const content = (
    <div className={isCustomer ? "space-y-8" : "mx-auto max-w-[1180px] px-7 py-14"}>
      <Link href="/services" className="text-[14px] inline-flex items-center gap-1.5" style={{ color: "var(--emerald)" }}>
        ← All services
      </Link>
      {!isCustomer && (
        <>
          <h1 className="my-3 text-[42px]">{category.name}</h1>
          <p className="mb-9 max-w-[40em] text-[17px]" style={{ color: "var(--slate)" }}>
            {category.description ?? "Choose a service to submit your request."}
          </p>
        </>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="mb-4 text-[22px]">Services</h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {category.subservices.map((s) => (
              <Link key={s.id} href={`/services/${category.slug}/${s.slug}`} className="card flex items-center justify-between !p-4 text-[15px] transition hover:bg-mist">
                <span style={{ color: "var(--forest)" }}>{s.name}</span>
                <span style={{ color: "var(--emerald)" }}>Request →</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-[22px]">Verified providers</h2>
          {providers.length === 0 ? (
            <div className="card text-[14px]" style={{ color: "var(--slate)" }}>
              Providers in this category are being onboarded. Submit a request and we&apos;ll match you as they go live.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {providers.map((p) => (
                <div key={p.id} className="card flex flex-col justify-between p-5 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="grid h-[48px] w-[48px] place-items-center rounded-xl font-display font-bold text-white text-[18px]" style={{ background: "var(--brand)" }}>
                      {p.displayName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[16px] font-bold truncate" style={{ color: "var(--forest)" }}>{p.displayName}</div>
                      <div className="text-[13px] font-medium" style={{ color: "var(--slate)" }}>{p.experienceYears} yrs experience · {p.jobsCompleted} jobs done</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {p.verifiedBadge && <span className="badge text-[11px] px-2 py-0.5">Verified</span>}
                      <span className="text-[15px] font-bold" style={{ color: "var(--emerald)" }}>★ {p.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/services/${category.slug}/book/${p.id}`} 
                    className="btn btn-primary w-full text-center py-2.5 text-[13px] font-bold tracking-wide transition-all duration-150 active:scale-[0.98]"
                    style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    Book Provider Personally
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isCustomer) {
    return (
      <DashboardShell
        title={category.name}
        nav={CUSTOMER_NAV}
        active="/services"
        user={session.user}
      >
        {content}
      </DashboardShell>
    );
  }

  return (
    <>
      <SiteHeader />
      {content}
      <SiteFooter />
    </>
  );
}
