import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { db } from "@/lib/db";

/** Renders a StaticPage by slug; falls back to a stub when not seeded. */
export default async function StaticPageView({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const page = await db.staticPage.findUnique({ where: { slug } });
  const title = page?.title ?? fallbackTitle;
  const body = page?.body ?? "Content coming soon.";

  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[760px] px-7 py-16">
        <h1 className="mb-6 text-[44px]">{title}</h1>
        <div className="space-y-4 text-[16px] leading-relaxed" style={{ color: "var(--slate)" }}>
          {body.split("\n").filter(Boolean).map((line, i) => (
            <p key={i}>{line.replace(/^#+\s*/, "")}</p>
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
