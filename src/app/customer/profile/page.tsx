import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { CUSTOMER_NAV } from "@/lib/nav";
import CustomerProfileForm from "@/components/CustomerProfileForm";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      customerProfile: {
        include: {
          addresses: {
            orderBy: { createdAt: "desc" },
            take: 1,
          }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const profile = user.customerProfile;
  const address = profile?.addresses?.[0] || null;

  return (
    <DashboardShell
      title="Profile Settings"
      nav={CUSTOMER_NAV}
      active="/customer/profile"
      user={session.user}
    >
      <div className="max-w-[640px] mx-auto py-4">
        <CustomerProfileForm
          initialData={{
            name: user.name || "",
            phone: user.phone || "",
            line1: address?.line1 || "",
            line2: address?.line2 || "",
            locality: address?.locality || "",
            pincode: address?.pincode || "",
            latitude: address?.latitude || 13.9299,
            longitude: address?.longitude || 75.5681,
          }}
        />
      </div>
    </DashboardShell>
  );
}
