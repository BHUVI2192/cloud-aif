"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function SignupInner() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Signup failed.");
        setLoading(false);
        return;
      }

      // Automatically sign in the user after successful signup
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        // Redirect to login page if auto-signin fails
        router.push("/login?signup_success=true");
      } else {
        // Go to dashboard based on role
        if (form.role === "PROVIDER") {
          router.push("/provider/onboarding");
        } else {
          router.push("/customer");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-7 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-display text-[22px] font-semibold" style={{ color: "var(--forest)" }}>
        <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-[17px] text-white" style={{ background: "var(--brand)" }}>C</span>
        Cloud AIF
      </Link>
      <h1 className="text-[32px]">Create an account</h1>
      <p className="mb-7 mt-2 text-[15px]" style={{ color: "var(--slate)" }}>Join Cloud AIF to request or offer verified local services in Shivamogga.</p>

      {error && (
        <div className="card mb-4 !bg-[#fdf2f2] !border-[#fbd5d5] !p-4.5 text-[14px]" style={{ color: "#a32d2d" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="card space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            type="text"
            className={`input ${error ? "input-error" : ""}`}
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className={`input ${error ? "input-error" : ""}`}
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className={`input ${error ? "input-error" : ""}`}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="label">Account type</label>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "CUSTOMER" })}
              className="flex flex-col items-center gap-1.5 rounded-[12px] border p-3.5 text-center transition hover:bg-mist"
              style={form.role === "CUSTOMER" ? { borderColor: "var(--brand)", background: "var(--mist)", color: "var(--forest)" } : { borderColor: "var(--line)" }}
              disabled={loading}
            >
              <span className="text-[20px]">👋</span>
              <span className="text-[13px] font-semibold">I need services</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "PROVIDER" })}
              className="flex flex-col items-center gap-1.5 rounded-[12px] border p-3.5 text-center transition hover:bg-mist"
              style={form.role === "PROVIDER" ? { borderColor: "var(--brand)", background: "var(--mist)", color: "var(--forest)" } : { borderColor: "var(--line)" }}
              disabled={loading}
            >
              <span className="text-[20px]">🛠️</span>
              <span className="text-[13px] font-semibold">I offer services</span>
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full !mt-6" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div className="mt-4 text-center text-[14px]" style={{ color: "var(--slate)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--brand)" }}>
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading…</div>}>
      <SignupInner />
    </Suspense>
  );
}
