import { requireUser } from "@/lib/session";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser("/provider");
  const pathname = headers().get("x-pathname") || "";

  if (pathname !== "/provider/onboarding") {
    const provider = await db.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    if (provider && provider.status === "DRAFT") {
      redirect("/provider/onboarding");
    }
  }

  return <>{children}</>;
}
