import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const settings = await db.platformSetting.findMany({ where: { key: { in: ["support_email", "support_phone"] } } });
  const get = (k: string) => settings.find((s) => s.key === k)?.value ?? "—";

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
        <div className="card mt-6">
          <h2 className="mb-3 text-[20px]">Send us a message</h2>
          <div className="space-y-3">
            <div><label className="label">Email</label><input className="input" /></div>
            <div><label className="label">Subject</label><input className="input" /></div>
            <div><label className="label">Message</label><textarea className="input min-h-[100px]" /></div>
            <button className="btn btn-primary">Send message</button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
