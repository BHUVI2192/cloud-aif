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
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md" style={{ borderColor: "rgba(241,245,249,0.8)", boxShadow: "0 2px 20px -5px rgba(9,13,22,0.02)" }}>
      <nav className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-7">
        <Link href={dash || "/"} className="flex items-center gap-2.5 font-display text-[21px] font-bold tracking-tight" style={{ color: "var(--forest)" }}>
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-[16px] text-white" style={{ background: "var(--brand)" }}>C</span>
          Cloud AIF
        </Link>
        
        {/* Center Links - Conditional on Authentication */}
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
                <Link className="btn btn-primary text-[13px] !py-2 !px-4" prefetch={true} style={{ minHeight: "auto" }} href={dash}>
                  Dashboard
                </Link>
              )}
              <button 
                className="btn btn-ghost text-[13px] !py-2 !px-4" 
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
        </div>
      </nav>
    </header>
  );
}
