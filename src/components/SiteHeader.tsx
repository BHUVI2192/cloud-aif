"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function SiteHeader() {
  const { data: session } = useSession();
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
    <header className="sticky top-0 z-50 border-b bg-paper/85 backdrop-blur" style={{ borderColor: "var(--line)" }}>
      <nav className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-7">
        <Link href={dash || "/"} className="flex items-center gap-2.5 font-display text-[21px] font-semibold" style={{ color: "var(--forest)" }}>
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-[17px] text-white" style={{ background: "var(--brand)" }}>C</span>
          Cloud AIF
        </Link>
        
        {/* Center Links - Conditional on Authentication */}
        <div className="hidden items-center gap-8 text-[15px] font-medium md:flex" style={{ color: "var(--slate)" }}>
          {session ? (
            <>
              {role === "CUSTOMER" && (
                <>
                  <Link href="/services" className="hover:text-forest">Request Service</Link>
                  <Link href="/customer" className="hover:text-forest">My Requests</Link>
                  <Link href="/support" className="hover:text-forest">Support</Link>
                </>
              )}
              {role === "PROVIDER" && (
                <>
                  <Link href="/provider" className="hover:text-forest">My Jobs</Link>
                  <Link href="/provider/availability" className="hover:text-forest">My Schedule</Link>
                  <Link href="/provider/profile" className="hover:text-forest">My Profile</Link>
                  <Link href="/support" className="hover:text-forest">Support</Link>
                </>
              )}
              {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                <>
                  <Link href="/admin" className="hover:text-forest">Admin Dashboard</Link>
                  <Link href="/support" className="hover:text-forest">Support</Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link href="/services" className="hover:text-forest">Services</Link>
              <Link href="/how-it-works" className="hover:text-forest">How it works</Link>
              <Link href="/become-a-provider" className="hover:text-forest">For providers</Link>
              <Link href="/support" className="hover:text-forest">Support</Link>
            </>
          )}
        </div>

        {/* Right Buttons - Premium Layout for Logged In/Out */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden items-center gap-2 mr-2 md:flex">
                <span className="text-[14px] font-semibold" style={{ color: "var(--forest)" }}>
                  {session.user?.name || session.user?.email}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: "var(--mist)", color: "var(--forest)" }}>
                  {role?.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
              {dash && (
                <Link className="btn btn-primary text-[14px] !py-2 !px-4" style={{ minHeight: "auto" }} href={dash}>
                  Dashboard
                </Link>
              )}
              <button 
                className="btn btn-ghost text-[14px] !py-2 !px-4" 
                style={{ border: "1px solid var(--line)", minHeight: "auto" }} 
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost hidden md:inline-flex" href="/become-a-provider">Become a provider</Link>
              <Link className="btn btn-primary" href="/login">Sign in</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
