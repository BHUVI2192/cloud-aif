import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import RequestForm from "@/components/RequestForm";

export const dynamic = "force-dynamic";

export default async function SubservicePage({
  params,
}: {
  params: { categorySlug: string; subserviceSlug: string };
}) {
  const category = await db.category.findUnique({ where: { slug: params.categorySlug } });
  if (!category) notFound();
  const subservice = await db.subservice.findFirst({
    where: { categoryId: category.id, slug: params.subserviceSlug },
  });
  if (!subservice) notFound();

  const areas = await db.serviceArea.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  const session = await getSession();

  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[760px] px-7 py-14">
        <Link href={`/services/${category.slug}`} className="text-[14px]" style={{ color: "var(--emerald)" }}>← {category.name}</Link>
        <h1 className="my-3 text-[38px]">Request: {subservice.name}</h1>
        <p className="mb-8 text-[16px]" style={{ color: "var(--slate)" }}>
          Tell us a few details. A verified provider near you will be matched to your request.
        </p>

        {!session?.user ? (
          <div className="card">
            <p className="mb-4 text-[15px]" style={{ color: "var(--slate)" }}>Please sign in to submit a request.</p>
            <Link className="btn btn-primary" href={`/login?callbackUrl=/services/${category.slug}/${subservice.slug}`}>Sign in to continue</Link>
          </div>
        ) : (
          <RequestForm
            categoryId={category.id}
            categorySlug={category.slug}
            subserviceId={subservice.id}
            subserviceName={subservice.name}
            areas={areas}
          />
        )}
      </section>
      <SiteFooter />
    </>
  );
}
