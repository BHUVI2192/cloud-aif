import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = await db.providerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        assignments: {
          include: {
            request: {
              include: {
                category: true,
                subservice: true,
                jobOutcome: true,
              },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
      },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // Generate CSV statement header
    const csvRows = [
      ["CLOUD AIF SHIVAMOGGA — OFFICIAL PROVIDER LEAD & EARNINGS STATEMENT"],
      [`Provider Name: ${provider.displayName}`],
      [`Member Since: ${new Date(provider.createdAt).toLocaleDateString()}`],
      [`Generated Date: ${new Date().toLocaleDateString()}`],
      [""],
      [
        "Assignment ID",
        "Request Title",
        "Category",
        "Subservice",
        "Status",
        "Assigned Date",
        "Completed Date",
        "Self-Reported Fee (INR)",
      ],
    ];

    for (const a of provider.assignments) {
      const r = a.request;
      csvRows.push([
        a.id,
        `"${r.title.replace(/"/g, '""')}"`,
        r.category.name,
        r.subservice?.name || "-",
        a.status,
        new Date(a.assignedAt).toISOString().slice(0, 10),
        r.jobOutcome?.capturedAt ? new Date(r.jobOutcome.capturedAt).toISOString().slice(0, 10) : "-",
        r.jobOutcome?.selfReportedValue ? String(r.jobOutcome.selfReportedValue) : "0",
      ]);
    }

    const csvContent = csvRows.map((e) => e.join(",")).join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CloudAIF_Provider_Statement_${provider.id.slice(-6)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("[Statement Export Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to generate statement" }, { status: 500 });
  }
}
