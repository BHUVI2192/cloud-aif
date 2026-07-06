"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function SiteHeader() {
  const { data: session } = useSession();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-[16px] text-white" style={{ background: "var(--brand)" }}>C</span>
            Cloud AIF
          </Link>
          
          {/* Center Links - Conditional on Authentication (Desktop) */}
          <div className="hidden items-center gap-8 text-[14px] font-bold md:flex" style={{ color: "var(--slate)" }}>
            {session ? (
              <>
                {role === "CUSTOMER" && (
                  <>
                    <Link href="/services" prefetch={true} className="hover:text-forest transition duration-150">Request Service</Link>
                    <Link href="/customer" prefetch={true} className="hover:text-forest transition duration-150">My Requests</Link>
                    <Link href="/support" prefetch={true} className="hover:text-forest transition duration-150">Support</Link>
                  </>
                )}
                {role === "PROVIDER" && (
                  <>
                    <Link href="/provider" prefetch={true} className="hover:text-forest transition duration-150">My Jobs</Link>
                    <Link href="/provider/availability" prefetch={true} className="hover:text-forest transition duration-150">My Schedule</Link>
                    <Link href="/provider/profile" prefetch={true} className="hover:text-forest transition duration-150">My Profile</Link>
                    <Link href="/support" prefetch={true} className="hover:text-forest transition duration-150">Support</Link>
                  </>
                )}
                {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                  <>
                    <Link href="/admin" prefetch={true} className="hover:text-forest transition duration-150">Admin Dashboard</Link>
                    <Link href="/support" prefetch={true} className="hover:text-forest transition duration-150">Support</Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/services" prefetch={true} className="hover:text-forest transition duration-150">Services</Link>
                <Link href="/how-it-works" prefetch={true} className="hover:text-forest transition duration-150">How it works</Link>
                <Link href="/become-a-provider" prefetch={true} className="hover:text-forest transition duration-150">For providers</Link>
                <Link href="/support" prefetch={true} className="hover:text-forest transition duration-150">Support</Link>
              </>
            )}
          </div>

          {/* Right Buttons - Premium Layout for Logged In/Out */}
          <div className="flex items-center gap-3">
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
                  <Link className="btn btn-primary text-[13px] !py-2 !px-4 hidden md:inline-flex" prefetch={true} style={{ minHeight: "auto" }} href={dash}>
                    Dashboard
                  </Link>
                )}
                <button 
                  className="btn btn-ghost text-[13px] !py-2 !px-4 hidden md:inline-flex" 
                  style={{ border: "1px solid #e2e8f0", minHeight: "auto" }} 
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost hidden md:inline-flex text-[13px] !py-2 !px-4" prefetch={true} href="/become-a-provider" style={{ border: "1px solid #e2e8f0" }}>Become a provider</Link>
                <Link className="btn btn-primary text-[13px] !py-2.5 !px-5" prefetch={true} href="/login">Sign in</Link>
              </>
            )}

            {/* Hamburger Trigger Button (Visible on Mobile) */}
            <button
              className="grid h-10 w-10 place-items-center rounded-xl md:hidden transition-all duration-200 hover:bg-mist active:scale-95"
              style={{ border: "1px solid var(--line)", color: "var(--forest)" }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
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
                      <Link href="/services" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Request Service</Link>
                      <Link href="/customer" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">My Requests</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Support</Link>
                      <Link href="/customer" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Dashboard</Link>
                    </>
                  )}
                  {role === "PROVIDER" && (
                    <>
                      <Link href="/provider" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">My Jobs</Link>
                      <Link href="/provider/availability" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">My Schedule</Link>
                      <Link href="/provider/profile" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">My Profile</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Support</Link>
                      <Link href="/provider" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Dashboard</Link>
                    </>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <>
                      <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Admin Dashboard</Link>
                      <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Support</Link>
                    </>
                  )}
                  <button 
                    onClick={() => { setShowMobileMenu(false); signOut({ callbackUrl: "/" }); }}
                    className="text-left text-red-600 transition duration-150 py-3 font-bold"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/services" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Services</Link>
                  <Link href="/how-it-works" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">How it works</Link>
                  <Link href="/become-a-provider" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3 border-b border-line/50">Become a Provider</Link>
                  <Link href="/support" onClick={() => setShowMobileMenu(false)} className="hover:text-forest transition duration-150 py-3">Support</Link>
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
