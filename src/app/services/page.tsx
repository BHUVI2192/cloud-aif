import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  "home-repair-handyman": "🔧",
  "cleaning-pest-control": "✨",
  "painting-home-improvement": "🎨",
  "salon-spa-beauty": "💇",
  "education-tutoring-coaching": "📚",
};

export default async function ServicesPage() {
  const categories = await db.category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: { subservices: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  });

  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[1180px] px-7 py-16">
        <span className="eyebrow">Browse services</span>
        <h1 className="my-3 text-[42px]">What do you need help with?</h1>
        <p className="mb-10 max-w-[40em] text-[17px]" style={{ color: "var(--slate)" }}>
          Pick a category to see the services we cover, then submit a request — a verified provider near you will be matched.
        </p>

        <div className="space-y-10">
          {categories.map((c) => (
            <div key={c.id} className="card">
              <div className="mb-5 flex items-center gap-3.5">
                <div className="grid h-[52px] w-[52px] place-items-center rounded-[14px] text-[24px]" style={{ background: "var(--mist)" }}>{ICONS[c.slug] ?? "•"}</div>
                <div>
                  <h2 className="text-[24px]">{c.name}</h2>
                  <p className="text-[14px]" style={{ color: "var(--slate)" }}>{c.description ?? `${c.subservices.length} services available`}</p>
                </div>
                <Link href={`/services/${c.slug}`} className="btn btn-ghost ml-auto hidden sm:inline-flex">View all →</Link>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {c.subservices.map((s) => (
                  <Link key={s.id} href={`/services/${c.slug}/${s.slug}`} className="flex items-center justify-between rounded-[11px] border px-4 py-3 text-[15px] transition hover:bg-mist" style={{ borderColor: "var(--line)" }}>
                    <span style={{ color: "var(--forest)" }}>{s.name}</span>
                    <span style={{ color: "var(--emerald)" }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
