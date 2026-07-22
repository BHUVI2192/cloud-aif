import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import OnboardingForm from "@/components/OnboardingForm";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function Onboarding() {
  const session = await requireUser("/provider/onboarding");
  const existing = await db.providerProfile.findUnique({ where: { userId: session.user.id } });
  const categories = await db.category.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Focused Onboarding Header - No marketing links, only logo and sign out */}
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-30" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex h-[64px] max-w-[1180px] items-center justify-between px-4 md:px-7">
          <div className="flex items-center gap-2.5 font-display text-[18px] font-bold" style={{ color: "var(--forest)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Ogenzo Logo" className="h-[28px] w-[28px] rounded-[7px] object-contain" />
            Ogenzo
          </div>
          <SignOutButton className="!w-auto px-4" />
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-[640px] px-4 py-8 md:px-7 md:py-12">
        <h1 className="my-3 text-[32px] font-bold" style={{ color: "var(--forest)" }}>Become a provider</h1>
        {existing && existing.status !== "DRAFT" ? (
          <div className="card bg-white" style={{ border: "1px solid var(--line)" }}>
            <p className="text-[15px]" style={{ color: "var(--slate)" }}>
              You already have a provider profile (status: <b className="capitalize" style={{ color: "var(--forest)" }}>{existing.status.replace(/_/g, " ").toLowerCase()}</b>).
            </p>
            <Link className="btn btn-primary mt-4" href="/provider">Go to dashboard</Link>
          </div>
        ) : (
          <OnboardingForm categories={categories} />
        )}
      </div>
    </div>
  );
}
