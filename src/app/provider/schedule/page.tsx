import { requireRoleOrRedirect } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import ProviderCalendarClient from "@/components/ProviderCalendarClient";
import { withTiming } from "@/lib/timing";

export const dynamic = "force-dynamic";

export default async function ProviderSchedulePage() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/schedule");

  const provider = await db.providerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!provider) {
    redirect("/become-a-provider");
  }

  // Fetch assignments starting from 30 days ago into the future
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { result: assignments, durationMs } = await withTiming(() =>
    db.providerAssignment.findMany({
      where: {
        providerId: provider.id,
        status: { in: ["ACCEPTED", "PENDING", "COMPLETED"] },
        request: {
          deletedAt: null,
          preferredDate: { gte: thirtyDaysAgo },
        },
      },
      select: {
        id: true,
        status: true,
        requestId: true,
        assignedAt: true,
        request: {
          select: {
            id: true,
            title: true,
            description: true,
            preferredDate: true,
            preferredTime: true,
            locality: true,
            addressLine: true,
            landmark: true,
            phone: true,
            status: true,
            customer: { select: { name: true } },
            category: { select: { name: true } },
            subservice: { select: { name: true } },
            serviceArea: { select: { name: true } },
          },
        },
      },
      orderBy: {
        request: {
          preferredDate: "asc",
        },
      },
    })
  );

  if (process.env.NODE_ENV !== "production" && durationMs > 150) {
    console.warn(`[RSC SLOW FETCH ${durationMs}ms]: /provider/schedule`);
  }

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
