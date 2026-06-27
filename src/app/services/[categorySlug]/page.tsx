import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const category = await db.category.findUnique({
    where: { slug: params.categorySlug },
    include: { subservices: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!category) notFound();

  const providers = await db.providerProfile.findMany({
    where: { status: "APPROVED", isActive: true, deletedAt: null, primaryCategoryId: category.id },
    orderBy: { ratingAverage: "desc" },
    take: 6,
  });

  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[1180px] px-7 py-14">
        <Link href="/services" className="text-[14px]" style={{ color: "var(--emerald)" }}>← All services</Link>
        <h1 className="my-3 text-[42px]">{category.name}</h1>
        <p className="mb-9 max-w-[40em] text-[17px]" style={{ color: "var(--slate)" }}>{category.description ?? "Choose a service to submit your request."}</p>

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
              <div className="space-y-3">
                {providers.map((p) => (
                  <div key={p.id} className="card flex items-center gap-3 !p-4">
                    <div className="grid h-[44px] w-[44px] place-items-center rounded-xl font-display font-semibold text-white" style={{ background: "var(--brand)" }}>
                      {p.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold" style={{ color: "var(--forest)" }}>{p.displayName}</div>
                      <div className="text-[13px]" style={{ color: "var(--slate)" }}>{p.experienceYears} yrs · {p.jobsCompleted} jobs</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {p.verifiedBadge && <span className="badge">✓</span>}
                      <span className="text-[14px] font-semibold" style={{ color: "var(--emerald)" }}>★ {p.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
