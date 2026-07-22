"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLanguage } from "@/lib/i18n";
import { CATEGORIES, SHIVAMOGGA_LOCALITIES } from "@/lib/constants";
import {
  Wrench,
  Sparkles,
  Palette as PaletteIcon,
  Scissors,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Plus,
  ArrowRight,
  Star,
  Lock,
  UserCheck,
  FileCheck,
  TrendingUp,
  CreditCard,
  Share2
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  "home-repair-handyman": <Wrench className="w-6 h-6 text-secondary" />,
  "cleaning-pest-control": <Sparkles className="w-6 h-6 text-secondary" />,
  "painting-home-improvement": <PaletteIcon className="w-6 h-6 text-secondary" />,
  "salon-spa-beauty": <Scissors className="w-6 h-6 text-secondary" />,
  "education-tutoring-coaching": <BookOpen className="w-6 h-6 text-secondary" />,
};

export default function HomePage() {
  const { t, language } = useLanguage();

  return (
    <div className="bg-surface min-h-screen flex flex-col min-w-0">
      <SiteHeader />

      {/* ─── SECTION 1: HERO (SURFACE CONTAINER LOW) ─── */}
      <section className="bg-surface-container-low border-b border-outline-variant">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:px-8 md:py-20 md:grid-cols-[1.15fr_0.85fr] min-w-0">
          <div>
            <span className="eyebrow inline-flex items-center gap-1.5 px-3 py-1 rounded bg-secondary/10 text-secondary text-[11px] font-bold tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("serving_localities")}
            </span>
            
            <h1 className="my-5 text-[32px] md:text-[52px] font-extrabold leading-[1.1] tracking-tight text-primary font-inter">
              {language === "kn" ? (
                <span className="font-kannada font-medium leading-relaxed">
                  ವಿಶ್ವಾಸಾರ್ಹ ಸ್ಥಳೀಯ ಸೇವಾ ಪರಿಣಿತರು, ಮೊದಲೇ ಪರಿಶೀಲಿತರು.
                </span>
              ) : (
                <>
                  Trusted local pros, <span className="underline decoration-secondary decoration-wavy underline-offset-4 text-primary">verified</span> first.
                </>
              )}
            </h1>
            
            <p className="mb-8 max-w-[28em] text-[15px] md:text-[17px] leading-relaxed text-on-surface-variant font-medium">
              {t("hero_desc")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                className="btn btn-primary h-12 flex items-center justify-center font-bold px-6 rounded text-[13px] tracking-wide uppercase text-white" 
                href="/services"
              >
                {t("request_service")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                className="btn btn-ghost h-12 border border-outline-variant bg-white flex items-center justify-center font-bold px-6 rounded text-[13px] text-on-surface hover:border-primary hover:text-primary transition" 
                href="/how-it-works"
              >
                {t("see_how_it_works")}
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-primary">
              {[t("id_verified"), t("zero_pre_payments"), t("local_100")].map((label) => (
                <span key={label} className="flex items-center gap-1.5 bg-white border border-outline-variant/60 px-3 py-1 rounded-sm shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Match Flow Mockup */}
          <div className="relative p-5 sm:p-7 border border-outline-variant bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                ⚡ {t("platform_match_flow")}
              </span>
              <span className="badge text-[10px] bg-secondary/15 text-secondary border border-secondary/20">
                {t("real_time_engine")}
              </span>
            </div>
            
            <div className="space-y-5 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[21px] top-6 bottom-6 w-[1.5px] border-l border-dashed border-outline"></div>
              
              {/* Step 1 */}
              <div className="flex gap-4 relative z-10">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded bg-surface-container font-bold text-primary">
                  💬
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">1. {t("user_request")}</span>
                  <p className="text-[13.5px] font-bold text-on-surface mt-0.5">{t("electrician_example")}</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex gap-4 relative z-10">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded bg-secondary/10 text-secondary font-bold animate-pulse">
                  ⚙
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary">2. {t("auto_matching")}</span>
                  <p className="text-[13.5px] font-medium text-on-surface-variant mt-0.5">{t("scanning_pros")}</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex gap-4 relative z-10 min-w-0">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded bg-primary text-white font-bold">
                  ✓
                </div>
                <div className="flex-1 rounded border border-outline-variant bg-surface-container-low p-3 shadow-2xs min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">3. {t("match_connected")}</span>
                  <div className="mt-2 flex items-center justify-between gap-2.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded font-bold text-white text-[12px] bg-primary">
                        S
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-bold text-on-surface truncate">{t("suresh_electricals")}</div>
                        <div className="text-[11px] text-on-surface-variant truncate font-medium">{t("suresh_exp")}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-[10.5px] font-extrabold bg-white text-secondary px-1.5 py-0.5 rounded border border-outline-variant flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-secondary stroke-none" /> 4.8
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: TRUST BAR (SURFACE CONTAINER) ─── */}
      <section className="bg-surface-container border-b border-outline-variant py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-around gap-6 text-center">
          <div className="flex items-center gap-2 text-[14px] font-bold text-on-surface">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span>100% ID & Address Verified Pros</span>
          </div>
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-on-surface">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span>4.8/5 Avg Rating from Local Bookings</span>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-bold text-on-surface">
            <span className="inline-block px-2 py-0.5 bg-secondary-container text-secondary text-[11px] font-extrabold uppercase rounded-sm border border-secondary/20">
              7-Day Guarantee
            </span>
            <span>Platform-Backed Promise</span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: SERVICE CATEGORIES (SURFACE CONTAINER LOWEST / WHITE) ─── */}
      <section className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
          <div className="mb-8 md:mb-12 max-w-[40em]">
            <span className="eyebrow">{t("what_we_cover")}</span>
            <h2 className="my-3 text-[28px] md:text-[38px] font-extrabold leading-tight text-primary font-inter">
              {language === "kn" ? (
                <span className="font-kannada font-medium leading-normal">
                  ಐದು ಸೇವಾ ವಿಭಾಗಗಳು, ಒಂದು ವಿಶ್ವಾಸಾರ್ಹ ಜಾಲ.
                </span>
              ) : (
                <>
                  Five service families, one trusted network.
                </>
              )}
            </h2>
            <p className="text-[14px] md:text-[15px] text-on-surface-variant leading-relaxed font-medium">
              {t("families_desc")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => {
              const translationKey = c.slug.replace(/-/g, "_");
              return (
                <Link 
                  key={c.slug} 
                  href={`/services/${c.slug}`} 
                  className="card card-interactive bg-white flex flex-col justify-between hover:border-secondary hover:shadow-xs transition" 
                >
                  <div>
                    <div className="mb-4 grid h-[48px] w-[48px] place-items-center rounded bg-secondary-container/50">{ICONS[c.slug]}</div>
                    <h3 className="mb-1.5 text-[18px] font-bold text-primary">
                      {language === "kn" ? (
                        <span className="font-kannada font-medium">{t(`cat_${translationKey}`)}</span>
                      ) : (
                        t(`cat_${translationKey}`)
                      )}
                    </h3>
                    <p className="mb-4 text-[13px] leading-relaxed text-on-surface-variant font-medium">{t(`desc_${translationKey}`)}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[12.5px] font-bold text-secondary group-hover:text-primary mt-2">
                    {t("explore_categories")} <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
            
            <div className="card bg-surface-container border-dashed border-2 border-outline-variant flex flex-col justify-center">
              <div className="mb-4 grid h-[48px] w-[48px] place-items-center rounded bg-surface text-[20px] font-bold text-secondary"><Plus className="w-5 h-5 text-secondary" /></div>
              <h3 className="mb-1.5 text-[18px] font-bold text-primary">
                {language === "kn" ? <span className="font-kannada font-medium">{t("more_coming_soon")}</span> : t("more_coming_soon")}
              </h3>
              <p className="text-[13px] leading-relaxed text-on-surface-variant font-medium">{t("expanding_categories")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: HOW IT WORKS (TERTIARY CONTAINER / ARECA EARTH WARMTH) ─── */}
      <section className="bg-tertiary-container text-white border-b border-outline-variant">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
          <span className="eyebrow text-[#e7bdb1] tracking-wider">{t("how_it_works")}</span>
          <h2 className="my-3 text-[28px] md:text-[38px] font-extrabold leading-tight text-white font-inter">
            {language === "kn" ? (
              <span className="font-kannada font-medium leading-normal">
                ಕೋರಿಕೆಯಿಂದ ಪರಿಹಾರದವರೆಗೆ ಕೇವಲ ನಾಲ್ಕು ಹಂತಗಳು.
              </span>
            ) : (
              <>
                Four steps from request to resolved.
              </>
            )}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t("step_1_title"), t("step_1_desc")],
              [t("step_2_title"), t("step_2_desc")],
              [t("step_3_title"), t("step_3_desc")],
              [t("step_4_title"), t("step_4_desc")]
            ].map(([titleText, descText], i) => (
              <div key={i} className="relative bg-black/10 border border-white/10 rounded-lg p-5">
                <div className="mb-4 grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold border border-[#ffdbd0]/30 text-[#ffdbd0] bg-white/5">
                  {i + 1}
                </div>
                <h3 className="mb-1 text-[17px] font-bold text-white">
                  {language === "kn" ? <span className="font-kannada font-medium">{titleText}</span> : titleText}
                </h3>
                <p className="text-[13.5px] text-[#e7bdb1] leading-relaxed font-medium">{descText}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: PROVIDER SUBSCRIPTION VALUE SECTION (SURFACE CONTAINER HIGH) ─── */}
      <section className="bg-surface-container-high border-b border-outline-variant">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24 grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6">
            <span className="eyebrow inline-flex items-center gap-1.5 px-3 py-1 rounded bg-tertiary-fixed-variant/10 text-tertiary-fixed-variant text-[11px] font-bold tracking-wider">
              💼 For Shivamogga Providers
            </span>
            <h2 className="text-[28px] md:text-[38px] font-extrabold text-primary font-inter leading-tight">
              {language === "kn" ? (
                <span className="font-kannada font-medium leading-normal">
                  ಸ್ಥಳೀಯ ಸೇವಾ ಉದ್ದಿಮೆಯನ್ನು ವೃದ್ಧಿಸಿ. ನೇರ ಗ್ರಾಹಕರು, ಶೂನ್ಯ ಕಮಿಷನ್.
                </span>
              ) : (
                <>
                  Grow your local service. Direct leads, zero commissions.
                </>
              )}
            </h2>
            <p className="text-[15px] text-on-surface-variant leading-relaxed font-medium">
              Join Shivamogga's verified service community. Get recurring customer leads, transparent earnings tracking, and a public Verified-Pro profile page to share with your clients on WhatsApp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                className="btn btn-primary h-12 flex items-center justify-center font-bold px-6 rounded text-[13px] tracking-wide uppercase text-white bg-primary" 
                href="/become-a-provider"
              >
                {t("become_a_provider")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stat tiles grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 border border-outline-variant rounded-lg space-y-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">Active Area</span>
              <div className="text-[32px] font-bold text-tertiary-fixed-variant leading-none">12+</div>
              <span className="block text-[11px] text-on-surface-variant font-medium">Shivamogga Localities</span>
            </div>
            
            <div className="bg-white p-5 border border-outline-variant rounded-lg space-y-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">Provider Cut</span>
              <div className="text-[32px] font-bold text-tertiary-fixed-variant leading-none">0%</div>
              <span className="block text-[11px] text-on-surface-variant font-medium">Zero Commission Taken</span>
            </div>

            <div className="bg-white p-5 border border-outline-variant rounded-lg space-y-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">Match Time</span>
              <div className="text-[32px] font-bold text-tertiary-fixed-variant leading-none">&lt; 3m</div>
              <span className="block text-[11px] text-on-surface-variant font-medium">Average matching speed</span>
            </div>

            <div className="bg-white p-5 border border-outline-variant rounded-lg space-y-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">Trust Factor</span>
              <div className="text-[32px] font-bold text-tertiary-fixed-variant leading-none">100%</div>
              <span className="block text-[11px] text-on-surface-variant font-medium">Background checked</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: SOCIAL PROOF / TESTIMONIALS (SURFACE CONTAINER LOWEST / WHITE) ─── */}
      <section className="bg-surface-container-lowest border-b border-outline-variant py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="eyebrow text-secondary tracking-wider">Testimonials</span>
          <h2 className="my-3 text-[28px] md:text-[36px] font-extrabold text-primary font-inter leading-tight">
            What Shivamogga says
          </h2>
          <p className="mb-10 text-[15px] text-on-surface-variant font-medium max-w-xl mx-auto">
            Read experience reports from local residents and service professionals using Cloud AIF.
          </p>

          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="card bg-white p-6 space-y-3">
              <div className="flex items-center gap-1 text-secondary">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-secondary" />)}
              </div>
              <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed italic">
                "Finding a plumber in Gopi Circle used to take hours of calling. Through Cloud AIF, I request once, and a verified plumber arrives within the requested window."
              </p>
              <div className="font-bold text-[13px] text-primary">
                — Rekha S., Homeowner
              </div>
            </div>

            <div className="card bg-white p-6 space-y-3">
              <div className="flex items-center gap-1 text-secondary">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-secondary" />)}
              </div>
              <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed italic">
                "I joined as an electrician. Since the verification process is strict, customers trust me immediately when I walk in. The dashboard helps me track all jobs easily."
              </p>
              <div className="font-bold text-[13px] text-primary">
                — Manjunath K., Electrician Pro
              </div>
            </div>

            <div className="card bg-white p-6 space-y-3">
              <div className="flex items-center gap-1 text-secondary">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-secondary" />)}
              </div>
              <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed italic">
                "Very transparent service. The fact that the platform has a 7-day guarantee gives me peace of mind when getting deep cleaning done for our home."
              </p>
              <div className="font-bold text-[13px] text-primary">
                — Abhishek P., Resident
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: COVERAGE (SURFACE CONTAINER) ─── */}
      <section className="bg-surface-container py-16 border-b border-outline-variant">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow">{t("coverage_eyebrow")}</span>
          <h2 className="my-3 text-[28px] md:text-[34px] font-extrabold text-primary font-inter">
            {t("coverage_title_1")}<span className="text-secondary">{t("coverage_title_2")}</span>.
          </h2>
          <p className="text-[14.5px] text-on-surface-variant font-medium">
            {t("coverage_desc")}
          </p>
          
          <div className="mt-6 flex flex-wrap gap-2">
            {SHIVAMOGGA_LOCALITIES.map((l) => (
              <span 
                key={l} 
                className="rounded border bg-white border-outline-variant px-4 py-2 text-[12.5px] font-bold text-primary shadow-2xs shrink-0 hover:border-secondary hover:text-secondary transition"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
