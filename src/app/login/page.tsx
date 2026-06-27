"use client";
import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const DEMO = [
  ["provider@example.com", "Provider"],
  ["customer@example.com", "Customer"],
];

function LoginInner() {
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params.get("callbackUrl") || "/";
  const signupSuccess = params.get("signup_success");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (callbackUrl.startsWith("/admin")) {
      router.push(`/adminlogin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [callbackUrl, router]);

  useEffect(() => {
    if (signupSuccess) {
      setSuccessMsg("Account created! Please sign in with your credentials.");
    }
  }, [signupSuccess]);

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      window.location.href = callbackUrl;
    }
  }

  async function devLogin(addr: string) {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    const res = await signIn("credentials", {
      email: addr,
      password: "password123",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("No account found for that email. Try a demo account below.");
    } else {
      window.location.href = callbackUrl;
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-7 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-display text-[22px] font-semibold" style={{ color: "var(--forest)" }}>
        <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-[17px] text-white" style={{ background: "var(--brand)" }}>C</span>
        Cloud AIF
      </Link>
      <h1 className="text-[32px]">Welcome back</h1>
      <p className="mb-7 mt-2 text-[15px]" style={{ color: "var(--slate)" }}>Sign in to request services or manage your dashboard.</p>

      <button className="btn btn-ghost mb-3 w-full" onClick={() => signIn("google", { callbackUrl })}>
        Continue with Google
      </button>

      {successMsg && (
        <div className="card mb-4 !bg-[#f0fdf4] !border-[#bbf7d0] !p-4.5 text-[14px]" style={{ color: "var(--emerald)" }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div className="card mb-4 !bg-[#fdf2f2] !border-[#fbd5d5] !p-4.5 text-[14px]" style={{ color: "#a32d2d" }}>
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="name@example.com"
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

        <div className="mt-4 text-center text-[14px]" style={{ color: "var(--slate)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold hover:underline" style={{ color: "var(--brand)" }}>
            Sign up
          </Link>
        </div>

        <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--line)" }}>
          <p className="label">Quick demo accounts (password: password123)</p>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
