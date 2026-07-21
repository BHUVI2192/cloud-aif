"use client";
import { useState, useEffect } from "react";
import { Language } from "@/lib/i18n";

export default function LanguageToggle() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("cloud_aif_lang") as Language;
    if (saved === "kn" || saved === "en") {
      setLang(saved);
    }
  }, []);

  const toggleLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("cloud_aif_lang", newLang);
    document.cookie = `cloud_aif_lang=${newLang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold shadow-2xs">
      <button
        onClick={() => toggleLanguage("en")}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === "en" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => toggleLanguage("kn")}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === "kn" ? "bg-emerald-700 text-white shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
}
