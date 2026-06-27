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
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-32 h-[380px] w-[380px] rounded-full blur-3xl" style={{ background: "var(--mist)", opacity: 0.5 }} />
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-7 py-20 md:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="eyebrow">Serving Shivamogga</span>
            <h1 className="my-5 text-[44px] md:text-[60px]">
              Trusted local pros, <em className="italic" style={{ color: "var(--emerald)" }}>verified</em> before they reach you.
            </h1>
            <p className="mb-7 max-w-[30em] text-[19px]" style={{ color: "var(--slate)" }}>
              From electricians and deep-cleaning to bridal makeup and home tuition — tell us what you need, and we&apos;ll match you with a background-checked professional near you.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link className="btn btn-primary" href="/services">Request a service →</Link>
              <Link className="btn btn-ghost" href="/how-it-works">See how it works</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-[14px] font-medium" style={{ color: "var(--brand)" }}>
              {["ID-verified providers", "No payment in-app", "Local to Shivamogga"].map((t) => (
                <span key={t} className="flex items-center gap-2"><span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--emerald)" }} />{t}</span>
              ))}
            </div>
          </div>

          <div className="card" style={{ boxShadow: "0 24px 60px -28px rgba(20,51,31,.28)" }}>
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-[18px] font-semibold" style={{ color: "var(--forest)" }}>New service request</span>
              <span className="badge">✓ Verified network</span>
            </div>
            {[["Category", "Home Repair & Handyman"], ["Service", "Electrician"], ["Locality", "Vidyanagar, Shivamogga"], ["When", "Today, anytime"]].map(([l, v]) => (
              <div key={l} className="mb-3.5">
                <span className="label">{l}</span>
                <div className="input flex items-center justify-between">{v} <span>▾</span></div>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--line)" }}>
              <div className="grid h-[46px] w-[46px] place-items-center rounded-xl font-display font-semibold text-white" style={{ background: "var(--brand)" }}>S</div>
              <div>
                <div className="text-[15px] font-semibold" style={{ color: "var(--forest)" }}>Suresh Electricals</div>
                <div className="text-[13px]" style={{ color: "var(--slate)" }}>9 yrs · 41 jobs · Vidyanagar</div>
              </div>
              <div className="ml-auto text-[14px] font-semibold" style={{ color: "var(--emerald)" }}>★ 4.8</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1180px] px-7 py-[74px]">
        <div className="mb-10 max-w-[42em]">
          <span className="eyebrow">What we cover</span>
          <h2 className="my-3 text-[38px]">Five service families, one trusted network.</h2>
          <p className="text-[17px]" style={{ color: "var(--slate)" }}>Every category is staffed by providers who pass document and identity checks before they go live.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/services/${c.slug}`} className="card transition hover:-translate-y-1" style={{ boxShadow: "none" }}>
              <div className="mb-4 grid h-[52px] w-[52px] place-items-center rounded-[14px] text-[24px]" style={{ background: "var(--mist)" }}>{ICONS[c.slug]}</div>
              <h3 className="mb-2 text-[20px]">{c.name}</h3>
              <p className="mb-3.5 text-[14px]" style={{ color: "var(--slate)" }}>{c.blurb}</p>
              <span className="flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: "var(--emerald)" }}>Explore →</span>
            </Link>
          ))}
          <div className="card" style={{ background: "var(--mist)", borderColor: "var(--sage)" }}>
            <div className="mb-4 grid h-[52px] w-[52px] place-items-center rounded-[14px] bg-white text-[24px]">＋</div>
            <h3 className="mb-2 text-[20px]">More coming soon</h3>
            <p className="text-[14px]" style={{ color: "var(--slate)" }}>We&apos;re expanding categories across Shivamogga.</p>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="mx-auto max-w-[1180px] px-7 py-[20px]">
        <div className="rounded-[28px] p-12 text-white" style={{ background: "var(--forest)" }}>
          <span className="eyebrow" style={{ color: "var(--sage)" }}>How it works</span>
          <h2 className="my-3.5 text-[36px] text-white">Four steps from request to resolved.</h2>
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
      <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-7 py-[74px] md:grid-cols-2">
        <div>
          <span className="eyebrow">Trust, built in</span>
          <h2 className="my-3.5 text-[36px]">Verified providers only — no exceptions.</h2>
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
        <div className="grid grid-cols-2 gap-7 rounded-[24px] p-10" style={{ background: "var(--mist)" }}>
          {[["100%", "Providers verified"], ["5", "Service families"], ["12+", "Shivamogga localities"], ["4.8★", "Avg. provider rating"]].map(([n, l]) => (
            <div key={l}>
              <b className="block font-display text-[42px] font-semibold leading-none" style={{ color: "var(--forest)" }}>{n}</b>
              <span className="text-[14px] font-medium" style={{ color: "var(--brand)" }}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="mx-auto max-w-[1180px] px-7 py-5">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[28px] p-14 text-white" style={{ background: "linear-gradient(100deg,var(--brand),var(--emerald))" }}>
          <div>
            <h2 className="max-w-[14em] text-[34px] text-white">Run a local service? Get found by customers near you.</h2>
            <p className="mt-2.5 max-w-[34em] text-[16px]" style={{ color: "#d9ecdf" }}>Sign up, complete verification, and start receiving leads in your area — no listing fees in v1.</p>
          </div>
          <Link className="btn" href="/become-a-provider" style={{ background: "#fff", color: "var(--forest)" }}>Become a provider →</Link>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="mx-auto max-w-[1180px] px-7 py-[74px]">
        <span className="eyebrow">Coverage</span>
        <h2 className="my-3.5 text-[34px]">Now live across Shivamogga.</h2>
        <p className="text-[17px]" style={{ color: "var(--slate)" }}>We&apos;re starting local and going deep. Here&apos;s where our verified providers operate today.</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {SHIVAMOGGA_LOCALITIES.map((l) => (
            <span key={l} className="rounded-full border bg-white px-4 py-2 text-[14px] font-medium" style={{ borderColor: "var(--line)", color: "var(--brand)" }}>{l}</span>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
