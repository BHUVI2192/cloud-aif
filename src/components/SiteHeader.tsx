"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

import ProviderAvailabilityHeaderToggle from "./ProviderAvailabilityHeaderToggle";

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
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur border-outline-variant shadow-sm">
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={dash || "/"} className="flex items-center gap-2.5 font-inter text-[18px] font-bold tracking-tight text-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_192.png?v=2" alt="Cloud AIF Logo" className="h-[32px] w-[32px] rounded object-contain" />
            Cloud AIF
          </Link>
          
          {/* Center Links - Conditional on Authentication (Desktop) */}
          <div className="hidden items-center gap-6 text-[14px] font-bold md:flex text-on-surface-variant">
            {session ? (
              <>
                {role === "CUSTOMER" && (
                  <>
                    <Link href="/services" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("request_service")}</Link>
                    <Link href="/customer" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("my_requests")}</Link>
                    <Link href="/support" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("support")}</Link>
                  </>
                )}
                {role === "PROVIDER" && (
                  <>
                    <Link href="/provider" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("my_jobs")}</Link>
                    <Link href="/provider/schedule" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("my_schedule")}</Link>
                    <Link href="/provider/profile" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("my_profile")}</Link>
                    <Link href="/support" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("support")}</Link>
                  </>
                )}
                {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                  <>
                    <Link href="/admin" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("admin_dashboard")}</Link>
                    <Link href="/admin/dispatch" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">Dispatch Board</Link>
                    <Link href="/support" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("support")}</Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/services" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("services")}</Link>
                <Link href="/how-it-works" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("how_it_works")}</Link>
                <Link href="/become-a-provider" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("for_providers")}</Link>
                <Link href="/support" prefetch={true} className="hover:text-primary transition min-h-[44px] flex items-center">{t("support")}</Link>
              </>
            )}
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            {role === "PROVIDER" && <ProviderAvailabilityHeaderToggle />}
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "kn" : "en")}
              className="border border-outline-variant bg-white hover:bg-surface-container font-kannada font-medium text-[12px] px-2.5 h-[36px] min-w-[44px] flex items-center justify-center rounded shrink-0 transition"
            >
              {language === "en" ? "ಕನ್ನಡ" : "EN"}
            </button>

            {session ? (
              <>
                <div className="hidden items-center gap-2 mr-2 md:flex">
                  <span className="text-[13px] font-bold text-on-surface truncate max-w-[120px]">
                    {session.user?.name || session.user?.email}
                  </span>
                  <span className="badge text-[10px] bg-secondary-container text-secondary border border-secondary/20 rounded-sm">
                    {role?.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                {dash && (
                  <button 
                    disabled={activeLoader !== null}
                    onClick={() => navigateTo(dash, "dashboard")}
                    className="btn btn-primary text-[13px] h-10 px-4 rounded hidden md:inline-flex items-center justify-center font-bold" 
                  >
                    {activeLoader === "dashboard" ? "⏳" : t("dashboard")}
                  </button>
                )}
                <button 
                  className="btn btn-ghost text-[13px] h-10 px-4 rounded hidden md:inline-flex border border-outline-variant font-bold text-on-surface" 
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
                  className="btn btn-ghost hidden md:inline-flex text-[13px] h-10 px-4 border border-outline-variant rounded items-center justify-center font-bold text-on-surface" 
                >
                  {activeLoader === "become" ? "⏳" : t("become_a_provider")}
                </button>
                <button 
                  disabled={activeLoader !== null}
                  onClick={() => navigateTo("/login", "login")}
                  className="btn btn-primary text-[13px] h-10 px-5 rounded flex items-center justify-center font-bold text-white bg-primary"
                >
                  {activeLoader === "login" ? "⏳" : t("sign_in")}
                </button>
              </>
            )}

            {/* Hamburger Trigger Button (Visible on Mobile) */}
            <button
              className="grid h-10 w-10 place-items-center rounded border border-outline-variant md:hidden transition hover:bg-surface-container active:scale-95 text-on-surface"
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
          className="fixed inset-0 top-[72px] z-40 bg-black/50 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            className="absolute left-0 right-0 top-0 bg-white border-b border-outline-variant shadow-lg px-6 py-5 space-y-4 animate-slide-down flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1 text-[15px] font-bold text-on-surface-variant">
              {session ? (
                <>
                  {role === "CUSTOMER" && (
                    <>
                      <Link href="/services" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("request_service")}</Link>
                      <Link href="/customer" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("my_requests")}</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("support")}</Link>
                      <Link href="/customer" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("dashboard")}</Link>
                    </>
                  )}
                  {role === "PROVIDER" && (
                    <>
                      <Link href="/provider" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("my_jobs")}</Link>
                      <Link href="/provider/availability" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("my_schedule")}</Link>
                      <Link href="/provider/profile" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("my_profile")}</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("support")}</Link>
                      <Link href="/provider" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("dashboard")}</Link>
                    </>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <>
                      <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("admin_dashboard")}</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("support")}</Link>
                    </>
                  )}
                  <button 
                    onClick={() => { setShowMobileMenu(false); signOut({ callbackUrl: "/" }); }}
                    className="text-left text-error transition py-3 font-bold min-h-[44px] flex items-center"
                  >
                    {t("sign_out")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/services" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("services")}</Link>
                  <Link href="/how-it-works" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("how_it_works")}</Link>
                  <Link href="/become-a-provider" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 border-b border-outline-variant/50 min-h-[44px] flex items-center">{t("become_a_provider")}</Link>
                  <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-primary transition py-3 min-h-[44px] flex items-center">{t("support")}</Link>
                </>
              )}
            </div>

            {/* User Profile Card on mobile menu */}
            {session && (
              <div className="border-t pt-4 flex items-center gap-3 border-outline-variant">
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-outline-variant" />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full text-white font-bold bg-primary text-[13px]">
                    {(session.user?.name || session.user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-[13px] font-bold text-on-surface leading-tight">{session.user?.name || session.user?.email}</div>
                  <div className="text-[11px] capitalize text-on-surface-variant font-medium mt-0.5">{role?.replace(/_/g, " ").toLowerCase()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
