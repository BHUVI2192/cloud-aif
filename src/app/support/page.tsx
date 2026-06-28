import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SupportForm from "@/components/SupportForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const settings = await db.platformSetting.findMany({ where: { key: { in: ["support_email", "support_phone"] } } });
  const get = (k: string) => {
    const val = settings.find((s) => s.key === k)?.value;
    if (k === "support_email") {
      return val && val !== "support@cloudaif.in" ? val : "cnbhuvan011@gmail.com";
    }
    return val ?? "—";
  };

  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[760px] px-7 py-16">
        <span className="eyebrow">Support</span>
        <h1 className="my-3 text-[44px]">We&apos;re here to help.</h1>
        <p className="mb-8 text-[17px]" style={{ color: "var(--slate)" }}>Reach out and our Shivamogga team will get back to you.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card">
            <div className="label">Email</div>
            <div className="text-[16px]" style={{ color: "var(--forest)" }}>{get("support_email")}</div>
          </div>
          <div className="card">
            <div className="label">Phone</div>
            <div className="text-[16px]" style={{ color: "var(--forest)" }}>{get("support_phone")}</div>
          </div>
        </div>
        <SupportForm />
      </section>
      <SiteFooter />
    </>
  );
}
