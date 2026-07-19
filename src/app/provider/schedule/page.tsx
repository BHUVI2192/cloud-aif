import { requireRoleOrRedirect } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import ProviderCalendarClient from "@/components/ProviderCalendarClient";

export const dynamic = "force-dynamic";

export default async function ProviderSchedulePage() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/schedule");

  const provider = await db.providerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    redirect("/become-a-provider");
  }

  // Fetch all assignments that are pending, accepted, or completed
  const assignments = await db.providerAssignment.findMany({
    where: {
      providerId: provider.id,
      status: { in: ["ACCEPTED", "PENDING", "COMPLETED"] },
      request: { deletedAt: null },
    },
    include: {
      request: {
        include: {
          customer: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          subservice: {
            select: {
              name: true,
            },
          },
          serviceArea: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      request: {
        preferredDate: "asc",
      },
    },
  });

  // Clean data structure to serialize correctly
  const formattedAssignments = assignments.map((a) => ({
    id: a.id,
    status: a.status,
    requestId: a.requestId,
    assignedAt: a.assignedAt.toISOString(),
    request: {
      id: a.request.id,
      title: a.request.title,
      description: a.request.description,
      preferredDate: a.request.preferredDate ? a.request.preferredDate.toISOString() : null,
      preferredTime: a.request.preferredTime,
      locality: a.request.locality,
      addressLine: a.request.addressLine,
      landmark: a.request.landmark,
      phone: a.request.phone,
      status: a.request.status,
      customer: {
        name: a.request.customer.name,
      },
      category: {
        name: a.request.category.name,
      },
      subservice: a.request.subservice ? { name: a.request.subservice.name } : null,
      serviceArea: a.request.serviceArea ? { name: a.request.serviceArea.name } : null,
    },
  }));

  return (
    <DashboardShell
      title="Schedule Calendar"
      nav={PROVIDER_NAV}
      active="/provider/schedule"
      user={session.user}
    >
      <ProviderCalendarClient assignments={formattedAssignments} />
    </DashboardShell>
  );
}
