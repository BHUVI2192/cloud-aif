"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLanguage } from "@/lib/i18n";
import { CATEGORIES, SHIVAMOGGA_LOCALITIES } from "@/lib/constants";
import {
  Wrench,
  Sparkles,
  Palette,
  Scissors,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Plus,
  ArrowRight,
  Star,
  Lock
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  "home-repair-handyman": <Wrench className="w-6 h-6 text-brand" />,
  "cleaning-pest-control": <Sparkles className="w-6 h-6 text-brand" />,
  "painting-home-improvement": <Palette className="w-6 h-6 text-brand" />,
  "salon-spa-beauty": <Scissors className="w-6 h-6 text-brand" />,
  "education-tutoring-coaching": <BookOpen className="w-6 h-6 text-brand" />,
};

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <div className="bg-paper min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line bg-[#fcfdfe]">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 py-12 md:px-7 md:py-20 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="eyebrow inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mist/60 text-brand text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("serving_localities")}
            </span>
            <h1 className="my-5 text-[38px] md:text-[62px] font-bold leading-[1.08] tracking-tight text-forest">
              {t("hero_title_1")}<em className="italic font-normal text-forest">{t("hero_title_2")}</em>{t("hero_title_3")}
            </h1>
            <p className="mb-8 max-w-[28em] text-[15px] md:text-[17px] leading-relaxed text-slate">
              {t("hero_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link className="btn btn-primary shadow-lg" href="/services">
                {t("request_service")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link className="btn btn-ghost border border-line" href="/how-it-works">
                {t("see_how_it_works")}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-brand">
              {[t("id_verified"), t("zero_pre_payments"), t("local_100")].map((label) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className="h-[6px] w-[6px] rounded-full bg-emerald" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative p-5 sm:p-7 border border-line/80 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[24px] overflow-hidden">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand flex items-center gap-1">
                ⚡ {t("platform_match_flow")}
              </span>
              <span className="badge text-[10px] bg-mist/80">{t("real_time_engine")}</span>
            </div>
            
            <div className="space-y-5 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[21px] top-6 bottom-6 w-[1.5px] border-l border-dashed border-slate/30"></div>
              
              {/* Step 1 */}
              <div className="flex gap-4 relative z-10">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl font-bold bg-mist text-brand">
                  💬
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate/85">1. {t("user_request")}</span>
                  <p className="text-[13.5px] font-bold text-forest mt-0.5">{t("electrician_example")}</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex gap-4 relative z-10">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl font-bold bg-mist/50 text-emerald animate-pulse">
                  ⚙
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald">2. {t("auto_matching")}</span>
                  <p className="text-[13.5px] font-medium text-slate mt-0.5">{t("scanning_pros")}</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex gap-4 relative z-10 min-w-0">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl font-bold bg-brand text-white">
                  ✓
                </div>
                <div className="flex-1 rounded-xl border border-line bg-paper p-3 shadow-sm min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand">3. {t("match_connected")}</span>
                  <div className="mt-2 flex items-center justify-between gap-2.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-lg font-bold text-white text-[12px] bg-brand">
                        S
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-bold text-forest truncate">{t("suresh_electricals")}</div>
                        <div className="text-[11px] text-slate truncate">{t("suresh_exp")}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-[10.5px] font-extrabold bg-white text-emerald px-1.5 py-0.5 rounded border border-line flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-emerald stroke-none" /> 4.8
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-b border-line bg-[#fcfdfe]">
        <div className="mx-auto max-w-[1180px] px-5 py-12 md:px-7 md:py-20">
          <div className="mb-8 md:mb-12 max-w-[40em]">
            <span className="eyebrow">{t("what_we_cover")}</span>
            <h2 className="my-3 text-[30px] md:text-[40px] font-bold leading-tight text-forest">
              {t("families_title_1")}<em className="italic font-normal text-forest">{t("families_title_2")}</em>{t("families_title_3")}
            </h2>
            <p className="text-[14px] md:text-[15px] text-slate leading-relaxed">
              {t("families_desc")}
            </p>
          </div>

          {/* Swipeable container on mobile, Grid on desktop */}
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-3 md:gap-6 horizontal-fade-mask px-0.5">
            {CATEGORIES.map((c) => {
              const translationKey = c.slug.replace(/-/g, "_");
              return (
                <Link 
                  key={c.slug} 
                  href={`/services/${c.slug}`} 
                  className="card card-interactive shrink-0 w-[280px] md:w-auto snap-center bg-white flex flex-col justify-between" 
                  style={{ borderRadius: "20px" }}
                >
                  <div>
                    <div className="mb-4 grid h-[48px] w-[48px] place-items-center rounded-xl bg-mist">{ICONS[c.slug]}</div>
                    <h3 className="mb-1.5 text-[18px] font-bold text-forest">{t(`cat_${translationKey}`)}</h3>
                    <p className="mb-4 text-[13px] leading-relaxed text-slate">{t(`desc_${translationKey}`)}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[12.5px] font-bold text-emerald group-hover:text-brand mt-2">
                    {t("explore_categories")} <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
            
            <div className="card shrink-0 w-[250px] md:w-auto snap-center bg-white border-dashed border-2 flex flex-col justify-center border-sage/60" style={{ borderRadius: "20px" }}>
              <div className="mb-4 grid h-[48px] w-[48px] place-items-center rounded-xl bg-mist text-[20px] font-bold text-emerald"><Plus className="w-5 h-5 text-brand" /></div>
              <h3 className="mb-1.5 text-[18px] font-bold text-forest">{t("more_coming_soon")}</h3>
              <p className="text-[13px] leading-relaxed text-slate">{t("expanding_categories")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto w-full max-w-[1180px] px-5 py-12 md:px-7 md:py-20">
        <div className="rounded-[24px] p-8 md:p-12 text-white shadow-xl" style={{ background: "linear-gradient(135deg, #02143a 0%, #000512 100%)" }}>
          <span className="eyebrow" style={{ color: "var(--sage)" }}>{t("how_it_works")}</span>
          <h2 className="my-3 text-[30px] md:text-[38px] text-white font-bold leading-tight">
            {t("how_it_works_subtitle_1")}<em className="italic font-normal text-blue-200">{t("how_it_works_subtitle_2")}</em>{t("how_it_works_subtitle_3")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t("step_1_title"), t("step_1_desc")],
              [t("step_2_title"), t("step_2_desc")],
              [t("step_3_title"), t("step_3_desc")],
              [t("step_4_title"), t("step_4_desc")]
            ].map(([titleText, descText], i) => (
              <div key={i} className="relative">
                <div className="mb-4 grid h-[36px] w-[36px] place-items-center rounded-full text-[13px] font-bold border border-sage/35 text-sage">
                  {i + 1}
                </div>
                <h3 className="mb-1 text-[17px] font-bold text-white">{titleText}</h3>
                <p className="text-[13.5px] text-[#c6d6cb] leading-relaxed">{descText}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-t border-b border-line bg-[#fcfdfe]">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 py-12 md:px-7 md:py-20 md:grid-cols-2">
          <div>
            <span className="eyebrow">{t("trust_title")}</span>
            <h2 className="my-3 text-[30px] md:text-[36px] font-bold text-forest">
              {t("trust_subtitle_1")}<em className="italic font-normal text-forest">{t("trust_subtitle_2")}</em>{t("trust_subtitle_3")}
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                [<CheckCircle className="w-5 h-5 text-brand shrink-0" key="verify" />, t("trust_item_1_title"), t("trust_item_1_desc")],
                [<Star className="w-5 h-5 text-brand shrink-0" key="booking" />, t("trust_item_2_title"), t("trust_item_2_desc")],
                [<Lock className="w-5 h-5 text-brand shrink-0" key="private" />, t("trust_item_3_title"), t("trust_item_3_desc")]
              ].map(([icon, titleVal, descVal], idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="grid h-[36px] w-[36px] flex-none place-items-center rounded-lg bg-mist text-brand">
                    {icon}
                  </div>
                  <div>
                    <b className="block text-[15px] font-semibold text-forest">{titleVal}</b>
                    <span className="text-[13.5px] text-slate leading-relaxed">{descVal}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-[20px] p-6 sm:p-10 border border-line bg-white shadow-lg">
            {[
              [t("stat_1_val"), t("stat_1_lbl")],
              [t("stat_2_val"), t("stat_2_lbl")],
              [t("stat_3_val"), t("stat_3_lbl")],
              [t("stat_4_val"), t("stat_4_lbl")]
            ].map(([n, l]) => (
              <div key={l}>
                <b className="block text-[28px] sm:text-[40px] font-bold leading-none italic text-forest">{n}</b>
                <span className="text-[12px] font-bold text-brand uppercase tracking-wider mt-1 block">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="mx-auto w-full max-w-[1180px] px-5 py-12 md:px-7">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[24px] p-8 md:p-12 text-white shadow-xl" style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--forest) 100%)" }}>
          <div className="space-y-2">
            <h2 className="max-w-[14em] text-[28px] md:text-[34px] font-bold text-white leading-tight">
              {t("provider_cta_title_1")}<em className="italic font-normal text-blue-200">{t("provider_cta_title_2")}</em>{t("provider_cta_title_3")}
            </h2>
            <p className="max-w-[34em] text-[14px] text-blue-100 leading-relaxed">
              {t("provider_cta_desc")}
            </p>
          </div>
          <Link className="btn bg-white text-forest hover:bg-slate-100 transition shadow-md w-full sm:w-auto" href="/become-a-provider">
            {t("become_a_provider")} <ArrowRight className="w-4 h-4 text-brand" />
          </Link>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="mx-auto w-full max-w-[1180px] px-5 py-12 md:px-7 bg-white">
        <span className="eyebrow">{t("coverage_eyebrow")}</span>
        <h2 className="my-3 text-[28px] md:text-[34px] font-bold text-forest">
          {t("coverage_title_1")}<em className="italic font-normal text-forest">{t("coverage_title_2")}</em>.
        </h2>
        <p className="text-[14.5px] text-slate">
          {t("coverage_desc")}
        </p>
        
        {/* Horizontal scroll list of localities on mobile, wrapped flex list on desktop */}
        <div className="mt-6 flex overflow-x-auto gap-2.5 pb-3 no-scrollbar horizontal-fade-mask md:flex-wrap">
          {SHIVAMOGGA_LOCALITIES.map((l) => (
            <span 
              key={l} 
              className="rounded-full border bg-white px-4 py-2 text-[12.5px] font-bold shadow-sm hover:border-brand/40 transition shrink-0" 
              style={{ borderColor: "var(--line)", color: "var(--brand)" }}
            >
              {l}
            </span>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
