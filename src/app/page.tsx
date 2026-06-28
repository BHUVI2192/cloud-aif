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
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-7 py-24 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="eyebrow">Serving Shivamogga</span>
            <h1 className="my-6 text-[46px] md:text-[66px] font-bold leading-[1.06] tracking-tight">
              Trusted local pros, <em className="italic font-normal text-emerald-700">verified</em> first.
            </h1>
            <p className="mb-8 max-w-[28em] text-[17px] leading-relaxed" style={{ color: "var(--slate)" }}>
              Handpicked service professionals in Shivamogga — background-checked and ready for your next request.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link className="btn btn-primary shadow-sm hover:translate-y-[-1px] transition duration-200" href="/services">
                Request a service →
              </Link>
              <Link className="btn btn-ghost hover:translate-y-[-1px] transition duration-200" href="/how-it-works">
                See how it works
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--brand)" }}>
              {["ID-verified", "Zero pre-payments", "100% Local"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--emerald)" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="card border border-line bg-white shadow-xl hover:shadow-2xl transition-all duration-500" style={{ borderRadius: "24px" }}>
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-[15px] font-bold italic" style={{ color: "var(--forest)" }}>
                Active request match
              </span>
              <span className="badge">✓ Verified</span>
            </div>
            {[
              ["Category", "Home Repair"],
              ["Service", "Electrician"],
              ["Locality", "Vidyanagar, Shivamogga"],
              ["When", "Today, anytime"]
            ].map(([l, v]) => (
              <div key={l} className="mb-3.5">
                <span className="label text-[11px] font-bold uppercase tracking-wider">{l}</span>
                <div className="input flex items-center justify-between text-[14px] font-medium bg-[#f8fafc] border-line py-2.5">
                  {v} <span className="text-[12px] opacity-60">▼</span>
                </div>
              </div>
            ))}
            <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--line)" }}>
              <div className="grid h-[42px] w-[42px] place-items-center rounded-xl font-bold text-white text-[15px]" style={{ background: "var(--brand)" }}>
                S
              </div>
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
      <section className="border-b border-line bg-[#f8fafc]">
        <div className="mx-auto max-w-[1180px] px-7 py-24">
          <div className="mb-14 max-w-[40em]">
            <span className="eyebrow">What we cover</span>
            <h2 className="my-3.5 text-[38px] font-bold leading-tight">
              Five service <em className="italic font-normal text-emerald-700">families</em>, one trusted network.
            </h2>
            <p className="text-[16px] leading-relaxed" style={{ color: "var(--slate)" }}>
              Every professional is background checked before they go live on our platform.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/services/${c.slug}`} className="card card-interactive transition hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-12px_rgba(9,13,22,0.06)] hover:border-brand/20 bg-white" style={{ borderRadius: "20px" }}>
                <div className="mb-4 grid h-[48px] w-[48px] place-items-center rounded-2xl text-[22px]" style={{ background: "var(--mist)" }}>{ICONS[c.slug]}</div>
                <h3 className="mb-1.5 text-[19px] font-bold" style={{ color: "var(--forest)" }}>{c.name}</h3>
                <p className="mb-4 text-[13.5px] leading-relaxed" style={{ color: "var(--slate)" }}>{c.blurb}</p>
                <span className="flex items-center gap-1.5 text-[13px] font-bold transition duration-200 group-hover:text-brand" style={{ color: "var(--emerald)" }}>
                  Explore Categories →
                </span>
              </Link>
            ))}
            <div className="card bg-white border-dashed border-2 flex flex-col justify-center transition-all duration-300" style={{ borderRadius: "20px", borderColor: "var(--sage)" }}>
              <div className="mb-4 grid h-[48px] w-[48px] place-items-center rounded-2xl bg-mist text-[20px] font-bold" style={{ color: "var(--emerald)" }}>＋</div>
              <h3 className="mb-1.5 text-[19px] font-bold" style={{ color: "var(--forest)" }}>More coming soon</h3>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--slate)" }}>We are expanding categories across Shivamogga.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-[1180px] px-7 py-24">
        <div className="rounded-[28px] p-12 text-white shadow-xl" style={{ background: "linear-gradient(135deg, #091c12 0%, #030805 100%)" }}>
          <span className="eyebrow" style={{ color: "var(--sage)" }}>How it works</span>
          <h2 className="my-3.5 text-[36px] text-white">
            Four steps from <em className="italic font-normal text-emerald-500">request</em> to resolved.
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Tell us the job", "Pick a category and describe what you need."],
              ["We match a pro", "A verified professional near you is assigned."],
              ["Get it done", "They visit and complete the work offline."],
              ["Rate & review", "Share feedback to keep the network safe."]
            ].map(([t, d], i) => (
              <div key={t}>
                <div className="mb-4 grid h-[40px] w-[40px] place-items-center rounded-full text-[14px] font-bold" style={{ color: "var(--sage)", border: "1px solid rgba(156,201,169,.3)" }}>
                  {i + 1}
                </div>
                <h3 className="mb-1.5 text-[18px] font-bold text-white">{t}</h3>
                <p className="text-[14px]" style={{ color: "#c6d6cb" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-t border-b border-line bg-[#f8fafc]">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-7 py-24 md:grid-cols-2">
          <div>
            <span className="eyebrow">Trust, built in</span>
            <h2 className="my-3.5 text-[36px] font-bold">
              Verified providers only — <em className="italic font-normal text-emerald-700">no exceptions</em>.
            </h2>
            <ul className="mt-8 space-y-6">
              {[
                ["✓", "Manual document review", "Credentials and proofs verified by hand."],
                ["★", "Completed bookings only", "Only real jobs can leave feedback."],
                ["🔒", "Private documents", "Credentials are never shown publicly."]
              ].map(([k, t, d]) => (
                <li key={t} className="flex gap-4">
                  <div className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] text-[15px]" style={{ background: "var(--mist)", color: "var(--brand)" }}>
                    {k}
                  </div>
                  <div>
                    <b className="block text-[16px] font-semibold" style={{ color: "var(--forest)" }}>{t}</b>
                    <span className="text-[14px]" style={{ color: "var(--slate)" }}>{d}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 rounded-[24px] p-10 border border-line bg-white shadow-xl">
            {[
              ["100%", "Providers verified"],
              ["5", "Service families"],
              ["12+", "Localities active"],
              ["4.8★", "Avg. review rating"]
            ].map(([n, l]) => (
              <div key={l}>
                <b className="block text-[44px] font-bold leading-none italic" style={{ color: "var(--forest)" }}>{n}</b>
                <span className="text-[13px] font-bold" style={{ color: "var(--brand)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="mx-auto max-w-[1180px] px-7 py-24">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[28px] p-14 text-white shadow-xl" style={{ background: "linear-gradient(135deg, #104f32 0%, #062316 100%)" }}>
          <div>
            <h2 className="max-w-[14em] text-[34px] font-bold text-white">
              Run a local service? <em className="italic font-normal text-emerald-400">Get found</em> near you.
            </h2>
            <p className="mt-2.5 max-w-[34em] text-[15px]" style={{ color: "#d9ecdf" }}>
              Sign up, complete verification, and receive direct requests — free of charge in v1.
            </p>
          </div>
          <Link className="btn hover:translate-y-[-1px] transition duration-200" href="/become-a-provider" style={{ background: "#fff", color: "var(--forest)", boxShadow: "0 4px 14px rgba(255,255,255,0.15)" }}>
            Become a provider →
          </Link>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="mx-auto max-w-[1180px] px-7 py-24 bg-white">
        <span className="eyebrow">Coverage</span>
        <h2 className="my-3.5 text-[34px] font-bold">
          Now live across <em className="italic font-normal text-emerald-700">Shivamogga</em>.
        </h2>
        <p className="text-[15px]" style={{ color: "var(--slate)" }}>
          We are focused locally. Currently serving the following neighborhoods.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {SHIVAMOGGA_LOCALITIES.map((l) => (
            <span key={l} className="rounded-full border bg-white px-4 py-2 text-[13px] font-bold shadow-sm hover:border-brand/40 transition duration-200" style={{ borderColor: "var(--line)", color: "var(--brand)" }}>
              {l}
            </span>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
