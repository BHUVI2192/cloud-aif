import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function HowItWorks() {
  const steps = [
    ["Tell us the job", "Pick a category and service, choose your locality, and describe what you need."],
    ["We match a verified pro", "A background-checked provider near you is assigned to your request."],
    ["Get it done offline", "The provider confirms, visits, and completes the work directly with you."],
    ["Rate & review", "Share feedback after completion to keep the network trustworthy."],
  ];
  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[820px] px-7 py-16">
        <span className="eyebrow">How it works</span>
        <h1 className="my-3 text-[46px]">From request to resolved, simply.</h1>
        <p className="mb-10 text-[18px]" style={{ color: "var(--slate)" }}>A request-first marketplace built for trust. No payments in-app — you settle directly with your provider.</p>
        <div className="space-y-5">
          {steps.map(([t, d], i) => (
            <div key={t} className="card flex gap-5">
              <div className="grid h-12 w-12 flex-none place-items-center rounded-full font-display text-[18px] font-semibold text-white" style={{ background: "var(--brand)" }}>{i + 1}</div>
              <div>
                <h3 className="mb-1 text-[20px]">{t}</h3>
                <p className="text-[15px]" style={{ color: "var(--slate)" }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
