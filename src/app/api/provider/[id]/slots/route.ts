import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DayOfWeek } from "@prisma/client";

const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const provider = await db.providerProfile.findUnique({
      where: { id: params.id },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Parse the requested date (e.g. YYYY-MM-DD)
    const requestedDate = new Date(dateStr);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Determine the day of the week
    const dayOfWeekIndex = requestedDate.getDay();
    const dayOfWeekName = DAYS_OF_WEEK[dayOfWeekIndex] as DayOfWeek;

    // Check availability in db
    const availability = await db.providerAvailability.findFirst({
      where: {
        providerId: provider.id,
        type: "WEEKLY_RECURRING",
        dayOfWeek: dayOfWeekName,
      },
    });

    // If provider is not active on this day, return empty slots list (unavailable)
    if (availability && !availability.isAvailable) {
      return NextResponse.json({ isAvailable: false, slots: [] });
    }

    let startTime = "09:00";
    let endTime = "17:00";

    if (availability) {
      startTime = availability.startTime;
      endTime = availability.endTime;
    }

    // Fetch start and end of day to query all existing requests
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAssignments = await db.providerAssignment.findMany({
      where: {
        providerId: provider.id,
        status: { in: ["ACCEPTED", "PENDING", "COMPLETED"] },
        request: {
          preferredDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          deletedAt: null,
        },
      },
      include: {
        request: {
          select: {
            preferredTime: true,
          },
        },
      },
    });

    // Generate 2-hour slots from startTime to endTime
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const slots: { slot: string; isBooked: boolean }[] = [];
    let currentHour = startH;

    while (currentHour + 2 <= endH) {
      const nextHour = currentHour + 2;
      const formatTime = (h: number) => `${h.toString().padStart(2, "0")}:00`;
      const slotStr = `${formatTime(currentHour)} - ${formatTime(nextHour)}`;

      // Check if this slot overlaps with any confirmed preferredTime
      const isBooked = existingAssignments.some((assign) => {
        const timeVal = assign.request.preferredTime;
        if (!timeVal) return false;
        return timeVal.includes(slotStr) || slotStr.includes(timeVal);
      });

      slots.push({ slot: slotStr, isBooked });
      currentHour = nextHour;
    }

    return NextResponse.json({
      isAvailable: true,
      slots,
    });
  } catch (error) {
    console.error("[slots-api] Error fetching slots:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
