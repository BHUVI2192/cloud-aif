import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await db.fAQ.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[760px] px-7 py-16">
        <span className="eyebrow">Good to know</span>
        <h1 className="my-3 text-[44px]">Frequently asked questions.</h1>
        <div className="mt-8">
          {faqs.map((f) => (
            <details key={f.id} className="border-b py-5" style={{ borderColor: "var(--line)" }}>
              <summary className="cursor-pointer font-display text-[18px] font-medium" style={{ color: "var(--forest)" }}>{f.question}</summary>
              <p className="mt-3 text-[15px]" style={{ color: "var(--slate)" }}>{f.answer}</p>
            </details>
          ))}
          {faqs.length === 0 && <p className="text-[15px]" style={{ color: "var(--slate)" }}>No FAQs published yet.</p>}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
