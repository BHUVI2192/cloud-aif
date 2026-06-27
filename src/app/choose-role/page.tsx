"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ChooseRole() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If already onboarded, redirect immediately to prevent manual navigation back
  useEffect(() => {
    if (session?.user) {
      // Check if user role is already set to something that already has a profile.
      // We can let the API handle checks, but we redirect if they are not customer/provider
      // or if they have completed role selection.
    }
  }, [session]);

  async function handleSelectRole(role: "CUSTOMER" | "PROVIDER") {
    setSubmitting(role);
    setError(null);

    try {
      const res = await fetch("/api/choose-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        // Trigger NextAuth session update to refresh token data (including role)
        await updateSession();
        
        // Wait a short moment to ensure NextAuth session state updates
        setTimeout(() => {
          if (role === "CUSTOMER") {
            router.push("/customer");
          } else {
            router.push("/provider/onboarding");
          }
        }, 800);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to select role.");
        setSubmitting(null);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(null);
    }
  }

  const name = session?.user?.name || "there";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-[800px] text-center space-y-6">
        <div className="flex justify-center items-center gap-2 mb-4 font-display text-[26px] font-bold" style={{ color: "var(--forest)" }}>
          <span className="grid h-[42px] w-[42px] place-items-center rounded-[12px] text-[20px] text-white" style={{ background: "var(--brand)" }}>C</span>
          Cloud AIF
        </div>
        
        <div className="space-y-2">
          <h1 className="text-[36px] font-bold tracking-tight" style={{ color: "var(--forest)" }}>
            Welcome, {name}!
          </h1>
          <p className="text-[17px] max-w-[32em] mx-auto" style={{ color: "var(--slate)" }}>
            To get started, tell us how you would like to use the Cloud AIF platform in Shivamogga.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-[14px] bg-red-50 text-red-800 border border-red-100 max-w-[480px] mx-auto">
            ⚠️ {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          {/* Customer Card */}
          <div 
            className="card flex flex-col justify-between p-8 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-white"
            style={{ border: "1px solid var(--line)" }}
            onClick={() => !submitting && handleSelectRole("CUSTOMER")}
          >
            <div>
              <div className="text-[36px] mb-4">🏡</div>
              <h2 className="text-[22px] font-bold" style={{ color: "var(--forest)" }}>I need services</h2>
              <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "var(--slate)" }}>
                Book local plumbers, electricians, house cleaners, painters, and more. Describe your job, pin your location, and match with verified providers.
              </p>
            </div>
            <button 
              className="btn btn-primary w-full mt-6 py-3"
              disabled={submitting !== null}
            >
              {submitting === "CUSTOMER" ? "Setting up..." : "Request Services"}
            </button>
          </div>

          {/* Provider Card */}
          <div 
            className="card flex flex-col justify-between p-8 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-white"
            style={{ border: "1px solid var(--line)" }}
            onClick={() => !submitting && handleSelectRole("PROVIDER")}
          >
            <div>
              <div className="text-[36px] mb-4">💼</div>
              <h2 className="text-[22px] font-bold" style={{ color: "var(--forest)" }}>I want to provide services</h2>
              <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "var(--slate)" }}>
                List your business, upload credentials, get real-time client requests in Shivamogga, submit proposals, and grow your local service business.
              </p>
            </div>
            <button 
              className="btn btn-ghost w-full mt-6 py-3"
              style={{ border: "1px solid var(--line)", background: "transparent", color: "var(--brand)" }}
              disabled={submitting !== null}
            >
              {submitting === "PROVIDER" ? "Setting up..." : "Provide Services"}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <Link href="/" className="text-[14px] hover:underline" style={{ color: "var(--slate)" }}>
            Cancel and sign out
          </Link>
        </div>
      </div>
    </div>
  );
}
