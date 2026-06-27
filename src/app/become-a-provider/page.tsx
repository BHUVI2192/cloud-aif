import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function BecomeProvider() {
  const steps = [
    ["Sign in", "Create your account in seconds."],
    ["Submit your details", "Tell us your service, experience and areas."],
    ["Upload documents", "ID and address proof for verification."],
    ["Get approved", "Our team reviews and activates your profile."],
    ["Receive leads", "Matched requests land in your dashboard."],
  ];
  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[900px] px-7 py-16">
        <span className="eyebrow">For providers</span>
        <h1 className="my-3 text-[46px]">Grow your local business with verified leads.</h1>
        <p className="mb-8 max-w-[40em] text-[18px]" style={{ color: "var(--slate)" }}>
          Join Shivamogga&apos;s trusted services network. No listing fees in v1 — just verified customers looking for what you do.
        </p>
        <Link className="btn btn-primary" href="/provider/onboarding">Start your application →</Link>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([t, d], i) => (
            <div key={t} className="card">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full font-display text-[15px] font-semibold" style={{ background: "var(--mist)", color: "var(--brand)" }}>{i + 1}</div>
              <h3 className="mb-1 text-[18px]">{t}</h3>
              <p className="text-[14px]" style={{ color: "var(--slate)" }}>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
