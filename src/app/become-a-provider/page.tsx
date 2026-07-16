"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLanguage } from "@/lib/i18n";

export default function BecomeProvider() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const steps = [
    [t("steps_sign_in"), t("steps_sign_in_desc")],
    [t("steps_details"), t("steps_details_desc")],
    [t("steps_docs"), t("steps_docs_desc")],
    [t("steps_approved"), t("steps_approved_desc")],
    [t("steps_leads"), t("steps_leads_desc")],
  ];
  return (
    <>
      <SiteHeader />
      <section className="mx-auto max-w-[900px] px-7 py-16">
        <span className="eyebrow">{t("for_providers")}</span>
        <h1 className="my-3 text-[46px]">{t("grow_business_leads")}</h1>
        <p className="mb-8 max-w-[40em] text-[18px]" style={{ color: "var(--slate)" }}>
          {t("grow_business_desc")}
        </p>
        <button 
          disabled={loading}
          onClick={() => {
            setLoading(true);
            router.push("/provider/onboarding");
          }}
          className={`btn btn-primary flex items-center justify-center gap-2 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? "⏳ Loading..." : `${t("start_application")} →`}
        </button>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([title, desc], i) => (
            <div key={title} className="card">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full font-display text-[15px] font-semibold" style={{ background: "var(--mist)", color: "var(--brand)" }}>{i + 1}</div>
              <h3 className="mb-1 text-[18px]">{title}</h3>
              <p className="text-[14px]" style={{ color: "var(--slate)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
