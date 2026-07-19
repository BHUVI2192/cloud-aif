"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function SiteHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeLoader, setActiveLoader] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();

  const navigateTo = (path: string, key: string) => {
    setActiveLoader(key);
    router.push(path);
  };

  const role = session?.user?.role;
  const dash =
    role === "ADMIN" || role === "SUPER_ADMIN"
      ? "/admin"
      : role === "PROVIDER"
      ? "/provider"
      : role === "CUSTOMER"
      ? "/customer"
      : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md" style={{ borderColor: "rgba(241,245,249,0.8)", boxShadow: "0 2px 20px -5px rgba(9,13,22,0.02)" }}>
        <nav className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-7">
          <Link href={dash || "/"} className="flex items-center gap-2.5 font-display text-[21px] font-bold tracking-tight" style={{ color: "var(--forest)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_192.png?v=2" alt="Cloud AIF Logo" className="h-[34px] w-[34px] rounded-[9px] object-contain" />
            Cloud AIF
          </Link>
          
          {/* Center Links - Conditional on Authentication (Desktop) */}
          <div className="hidden items-center gap-8 text-[14px] font-bold md:flex" style={{ color: "var(--slate)" }}>
            {session ? (
              <>
                {role === "CUSTOMER" && (
                  <>
                    <Link href="/services" prefetch={true} className="hover:text-forest transition duration-150">{t("request_service")}</Link>
                    <Link href="/customer" prefetch={true} className="hover:text-forest transition duration-150">{t("my_requests")}</Link>
                    <Link href="/support" prefetch={true} className="hover:text-forest transition duration-150">{t("support")}</Link>
                  </>
                )}
                {role === "PROVIDER" && (
                  <>
                    <Link href="/provider" prefetch={true} className="hover:text-forest transition duration-150">{t("my_jobs")}</Link>
                    <Link href="/provider/availability" prefetch={true} className="hover:text-forest transition duration-150">{t("my_schedule")}</Link>
                    <Link href="/provider/profile" prefetch={true} className="hover:text-forest transition duration-150">{t("my_profile")}</Link>
                    <Link href="/support" prefetch={true} className="hover:text-forest transition duration-150">{t("support")}</Link>
                  </>
                )}
                {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                  <>
                    <Link href="/admin" prefetch={true} className="hover:text-forest transition duration-150">{t("admin_dashboard")}</Link>
                    <Link href="/support" prefetch={true} className="hover:text-forest transition duration-150">{t("support")}</Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/services" prefetch={true} className="hover:text-forest transition duration-150">{t("services")}</Link>
                <Link href="/how-it-works" prefetch={true} className="hover:text-forest transition duration-150">{t("how_it_works")}</Link>
                <Link href="/become-a-provider" prefetch={true} className="hover:text-forest transition duration-150">{t("for_providers")}</Link>
                <Link href="/support" prefetch={true} className="hover:text-forest transition duration-150">{t("support")}</Link>
              </>
            )}
          </div>

          {/* Right Buttons - Premium Layout for Logged In/Out */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "kn" : "en")}
              className="btn btn-ghost text-[12px] font-bold !py-2 !px-2.5 flex items-center justify-center gap-1 shrink-0"
              style={{ border: "1px solid var(--line)", minHeight: "auto" }}
            >
              🌐 {language === "en" ? "ಕನ್ನಡ" : "EN"}
            </button>

            {session ? (
              <>
                <div className="hidden items-center gap-2 mr-2 md:flex">
                  <span className="text-[13px] font-bold" style={{ color: "var(--forest)" }}>
                    {session.user?.name || session.user?.email}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full capitalize font-bold" style={{ background: "var(--mist)", color: "var(--brand)" }}>
                    {role?.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                {dash && (
                  <button 
                    disabled={activeLoader !== null}
                    onClick={() => navigateTo(dash, "dashboard")}
                    className="btn btn-primary text-[13px] !py-2 !px-4 hidden md:inline-flex items-center justify-center gap-1.5" 
                    style={{ minHeight: "auto" }}
                  >
                    {activeLoader === "dashboard" ? "⏳" : t("dashboard")}
                  </button>
                )}
                <button 
                  className="btn btn-ghost text-[13px] !py-2 !px-4 hidden md:inline-flex" 
                  style={{ border: "1px solid #e2e8f0", minHeight: "auto" }} 
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  {t("sign_out")}
                </button>
              </>
            ) : (
              <>
                <button 
                  disabled={activeLoader !== null}
                  onClick={() => navigateTo("/become-a-provider", "become")}
                  className="btn btn-ghost hidden md:inline-flex text-[13px] !py-2 !px-4 items-center justify-center gap-1.5" 
                  style={{ border: "1px solid #e2e8f0", minHeight: "auto" }}
                >
                  {activeLoader === "become" ? "⏳" : t("become_a_provider")}
                </button>
                <button 
                  disabled={activeLoader !== null}
                  onClick={() => navigateTo("/login", "login")}
                  className="btn btn-primary text-[13px] !py-2.5 !px-5 flex items-center justify-center gap-1.5"
                >
                  {activeLoader === "login" ? "⏳" : t("sign_in")}
                </button>
              </>
            )}

            {/* Hamburger Trigger Button (Visible on Mobile) */}
            <button
              className="grid h-10 w-10 place-items-center rounded-xl md:hidden transition-all duration-200 hover:bg-mist active:scale-95 text-slate"
              style={{ border: "1px solid var(--line)", color: "var(--slate)" }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* 📱 Mobile Menu Drawer Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 top-[72px] z-40 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            className="absolute left-0 right-0 top-0 bg-white/95 border-b shadow-xl px-7 py-6 space-y-5 animate-slide-down flex flex-col"
            style={{ borderColor: "var(--line)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1 text-[15px] font-bold" style={{ color: "var(--slate)" }}>
              {session ? (
                <>
                  {role === "CUSTOMER" && (
                    <>
                      <Link href="/services" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("request_service")}</Link>
                      <Link href="/customer" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("my_requests")}</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("support")}</Link>
                      <Link href="/customer" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("dashboard")}</Link>
                    </>
                  )}
                  {role === "PROVIDER" && (
                    <>
                      <Link href="/provider" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("my_jobs")}</Link>
                      <Link href="/provider/availability" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("my_schedule")}</Link>
                      <Link href="/provider/profile" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("my_profile")}</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("support")}</Link>
                      <Link href="/provider" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("dashboard")}</Link>
                    </>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <>
                      <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("admin_dashboard")}</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("support")}</Link>
                    </>
                  )}
                  <button 
                    onClick={() => { setShowMobileMenu(false); signOut({ callbackUrl: "/" }); }}
                    className="text-left text-red-600 transition duration-150 py-3 font-bold"
                  >
                    {t("sign_out")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/services" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("services")}</Link>
                  <Link href="/how-it-works" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("how_it_works")}</Link>
                  <Link href="/become-a-provider" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">{t("become_a_provider")}</Link>
                  <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3">{t("support")}</Link>
                </>
              )}
            </div>

            {/* User Profile Card on mobile menu */}
            {session && (
              <div className="border-t pt-4 flex items-center gap-3 border-line/50">
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-line" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full text-white font-bold" style={{ background: "var(--brand)" }}>
                    {(session.user?.name || session.user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-[13px] font-bold text-forest leading-tight">{session.user?.name || session.user?.email}</div>
                  <div className="text-[11px] capitalize text-slate font-medium mt-0.5">{role?.replace(/_/g, " ").toLowerCase()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
