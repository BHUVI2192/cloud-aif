"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button className="btn btn-ghost w-full !py-2 !text-[13px]" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
}
