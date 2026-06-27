import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CATEGORIES, SHIVAMOGGA_LOCALITIES } from "@/lib/constants";

const ICONS: Record<string, string> = {
  "home-repair-handyman": "🔧",
  "cleaning-pest-control": "✨",
  "painting-home-improvement": "🎨",
  "salon-spa-beauty": "💇",
  "education-tutoring-coaching": "📚",
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-line">
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-7 py-20 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="eyebrow">Serving Shivamogga</span>
            <h1 className="my-5 text-[44px] md:text-[62px] font-semibold leading-[1.08] tracking-tight">
              Trusted local pros, <em className="font-serif italic font-normal" style={{ color: "var(--brand)" }}>verified</em> before they reach you.
            </h1>
            <p className="mb-8 max-w-[30em] text-[18px] leading-relaxed" style={{ color: "var(--slate)" }}>
              From electricians and deep-cleaning to bridal makeup and home tuition — tell us what you need, and we&apos;ll match you with a background-checked professional near you.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link className="btn btn-primary shadow-sm hover:translate-y-[-1px] transition duration-200" href="/services">Request a service →</Link>
              <Link className="btn btn-ghost hover:translate-y-[-1px] transition duration-200" href="/how-it-works">See how it works</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-[13px] font-semibold uppercase tracking-wider" style={{ color: "var(--brand)" }}>
              {["ID-verified providers", "No payment in-app", "Local to Shivamogga"].map((t) => (
                <span key={t} className="flex items-center gap-2"><span className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--emerald)" }} />{t}</span>
              ))}
            </div>
          </div>

          <div className="card shadow-xl border border-line bg-white" style={{ borderRadius: "24px" }}>
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-[17px] font-bold italic" style={{ color: "var(--forest)" }}>New service request</span>
              <span className="badge text-[11px] px-3 py-1 font-bold">✓ Verified network</span>
            </div>
            {[["Category", "Home Repair & Handyman"], ["Service", "Electrician"], ["Locality", "Vidyanagar, Shivamogga"], ["When", "Today, anytime"]].map(([l, v]) => (
              <div key={l} className="mb-3.5">
                <span className="label text-[11px] font-bold uppercase tracking-wider">{l}</span>
                <div className="input flex items-center justify-between text-[14px] font-medium bg-[#fafcfb] border-line py-2.5">{v} <span className="text-[12px] opacity-60">▼</span></div>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--line)" }}>
              <div className="grid h-[42px] w-[42px] place-items-center rounded-xl font-display font-bold text-white text-[15px]" style={{ background: "var(--brand)" }}>S</div>
              <div>
                <div className="text-[14px] font-bold" style={{ color: "var(--forest)" }}>Suresh Electricals</div>
                <div className="text-[12px]" style={{ color: "var(--slate)" }}>9 yrs exp · 41 jobs completed</div>
              </div>
              <div className="ml-auto text-[13px] font-bold bg-mist text-brand px-2 py-0.5 rounded-md">★ 4.8</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1180px] px-7 py-20 bg-white">
        <div className="mb-12 max-w-[42em]">
          <span className="eyebrow">What we cover</span>
          <h2 className="my-3 text-[38px] font-semibold leading-tight">
            Five service <em className="font-serif italic font-normal" style={{ color: "var(--brand)" }}>families</em>, one trusted network.
          </h2>
          <p className="text-[16px] leading-relaxed" style={{ color: "var(--slate)" }}>Every category is staffed by providers who pass document and identity checks before they go live.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/services/${c.slug}`} className="card card-interactive transition hover:-translate-y-1 hover:border-brand/40 bg-white" style={{ borderRadius: "20px" }}>
              <div className="mb-4 grid h-[48px] w-[48px] place-items-center rounded-2xl text-[22px]" style={{ background: "var(--mist)" }}>{ICONS[c.slug]}</div>
              <h3 className="mb-1.5 text-[19px] font-bold" style={{ color: "var(--forest)" }}>{c.name}</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed" style={{ color: "var(--slate)" }}>{c.blurb}</p>
              <span className="flex items-center gap-1.5 text-[13px] font-bold transition duration-200 group-hover:text-brand" style={{ color: "var(--emerald)" }}>Explore Categories →</span>
            </Link>
          ))}
          <div className="card bg-[#fafcfb] border-dashed border-2 flex flex-col justify-center" style={{ borderRadius: "20px", borderColor: "var(--sage)" }}>
            <div className="mb-4 grid h-[48px] w-[48px] place-items-center rounded-2xl bg-white text-[20px] font-bold" style={{ color: "var(--emerald)" }}>＋</div>
            <h3 className="mb-1.5 text-[19px] font-bold" style={{ color: "var(--forest)" }}>More coming soon</h3>
            <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--slate)" }}>We&apos;re expanding categories across Shivamogga.</p>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="mx-auto max-w-[1180px] px-7 py-[20px]">
        <div className="rounded-[28px] p-12 text-white" style={{ background: "var(--forest)" }}>
          <span className="eyebrow" style={{ color: "var(--sage)" }}>How it works</span>
          <h2 className="my-3.5 text-[36px] text-white">Four steps from <em className="font-serif italic font-normal" style={{ color: "var(--sage)" }}>request</em> to resolved.</h2>
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {[["Tell us the job", "Pick a category, describe the work and choose your locality."], ["We match a pro", "A verified provider near you is assigned to your request."], ["Get it done", "They confirm, visit, and complete the work offline."], ["Rate & review", "Share feedback that keeps the network trustworthy."]].map(([t, d], i) => (
              <div key={t}>
                <div className="mb-4 grid h-[42px] w-[42px] place-items-center rounded-full font-display text-[15px] font-semibold" style={{ color: "var(--sage)", border: "1px solid rgba(156,201,169,.4)" }}>{i + 1}</div>
                <h3 className="mb-1.5 text-[18px] text-white">{t}</h3>
                <p className="text-[14px]" style={{ color: "#c6d6cb" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-7 py-20 md:grid-cols-2 bg-white">
        <div>
          <span className="eyebrow">Trust, built in</span>
          <h2 className="my-3.5 text-[36px] font-semibold">Verified providers only — <em className="font-serif italic font-normal" style={{ color: "var(--brand)" }}>no exceptions</em>.</h2>
          <ul className="mt-6 space-y-5">
            {[["✓", "Manual document review", "ID and address proof checked by our team before a provider appears."], ["★", "Real reviews after real jobs", "Only customers with completed requests can leave a rating."], ["🔒", "Sensitive data stays private", "Provider documents are never exposed on public pages."]].map(([k, t, d]) => (
              <li key={t} className="flex gap-3.5">
                <div className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] text-[15px]" style={{ background: "var(--mist)", color: "var(--brand)" }}>{k}</div>
                <div>
                  <b className="block text-[16px] font-semibold" style={{ color: "var(--forest)" }}>{t}</b>
                  <span className="text-[14px]" style={{ color: "var(--slate)" }}>{d}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-7 rounded-[24px] p-10 border border-line bg-white">
          {[["100%", "Providers verified"], ["5", "Service families"], ["12+", "Shivamogga localities"], ["4.8★", "Avg. provider rating"]].map(([n, l]) => (
            <div key={l}>
              <b className="block font-display text-[42px] font-semibold leading-none italic" style={{ color: "var(--forest)" }}>{n}</b>
              <span className="text-[14px] font-semibold" style={{ color: "var(--brand)" }}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="mx-auto max-w-[1180px] px-7 py-5">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[28px] p-14 text-white" style={{ background: "linear-gradient(100deg,var(--brand),var(--emerald))" }}>
          <div>
            <h2 className="max-w-[14em] text-[34px] text-white">Run a local service? <em className="font-serif italic font-normal" style={{ color: "#d9ecdf" }}>Get found</em> by customers near you.</h2>
            <p className="mt-2.5 max-w-[34em] text-[16px]" style={{ color: "#d9ecdf" }}>Sign up, complete verification, and start receiving leads in your area — no listing fees in v1.</p>
          </div>
          <Link className="btn hover:translate-y-[-1px] transition duration-200" href="/become-a-provider" style={{ background: "#fff", color: "var(--forest)" }}>Become a provider →</Link>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="mx-auto max-w-[1180px] px-7 py-20 bg-white">
        <span className="eyebrow">Coverage</span>
        <h2 className="my-3.5 text-[34px] font-semibold">Now live across <em className="font-serif italic font-normal" style={{ color: "var(--brand)" }}>Shivamogga</em>.</h2>
        <p className="text-[16px]" style={{ color: "var(--slate)" }}>We&apos;re starting local and going deep. Here&apos;s where our verified providers operate today.</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {SHIVAMOGGA_LOCALITIES.map((l) => (
            <span key={l} className="rounded-full border bg-white px-4 py-2 text-[14px] font-semibold shadow-sm hover:border-brand/40 transition duration-200" style={{ borderColor: "var(--line)", color: "var(--brand)" }}>{l}</span>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
