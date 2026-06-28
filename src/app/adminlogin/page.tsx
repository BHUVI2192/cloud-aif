"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const DEMO = [
  ["admin@cloudaif.in", "Super admin"],
];

function AdminLoginInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid admin email or password. Please try again.");
    } else {
      window.location.href = callbackUrl;
    }
  }

  async function devLogin(addr: string) {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: addr,
      password: "password123",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("No admin account found for that email. Try the demo admin below.");
    } else {
      window.location.href = callbackUrl;
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-7 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-display text-[22px] font-semibold" style={{ color: "var(--forest)" }}>
        <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-[17px] text-white" style={{ background: "var(--brand)" }}>C</span>
        Cloud AIF Admin
      </Link>
      <h1 className="text-[32px]">Admin Portal</h1>
      <p className="mb-7 mt-2 text-[15px]" style={{ color: "var(--slate)" }}>Sign in to manage service providers, requests, and platform settings.</p>

      {error && (
        <div className="card mb-4 !bg-[#fdf2f2] !border-[#fbd5d5] !p-4.5 text-[14px]" style={{ color: "#a32d2d" }}>
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="label">Admin email</label>
            <input
              type="email"
              className="input"
              placeholder="admin@cloudaif.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full !mt-6" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--line)" }}>
          <p className="label">Quick demo admin account (password: password123)</p>
          <div className="space-y-2">
            {DEMO.map(([addr, role]) => (
              <button
                key={addr}
                onClick={() => devLogin(addr)}
                className="flex w-full items-center justify-between rounded-[10px] border px-3.5 py-2.5 text-left text-[14px] transition hover:bg-mist"
                style={{ borderColor: "var(--line)" }}
                disabled={loading}
              >
                <span style={{ color: "var(--forest)" }}>{role}</span>
                <span style={{ color: "var(--slate)" }}>{addr}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import AdminMobileBlocker from "@/components/AdminMobileBlocker";

export default function AdminLoginPage() {
  return (
    <AdminMobileBlocker>
      <Suspense fallback={<div className="p-10">Loading…</div>}>
        <AdminLoginInner />
      </Suspense>
    </AdminMobileBlocker>
  );
}
