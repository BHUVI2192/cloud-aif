"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function SignOutButton({ className = "w-full" }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button 
      disabled={loading} 
      className={`btn btn-ghost !py-2 !text-[13px] ${className} ${loading ? "opacity-60 cursor-not-allowed" : ""}`} 
      onClick={() => {
        setLoading(true);
        signOut({ callbackUrl: "/" });
      }}
    >
      {loading ? "⏳..." : "Sign out"}
    </button>
  );
}
