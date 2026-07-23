import { NextResponse } from "next/server";
import { DayOfWeek } from "@prisma/client";
import { withTiming, createTimedResponse } from "@/lib/timing";
import { getCachedProviderSlots } from "@/lib/cache";

export const dynamic = "force-dynamic";

const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { result, durationMs } = await withTiming(async () => {
    try {
      const { searchParams } = new URL(req.url);
      const dateStr = searchParams.get("date");

      if (!dateStr) {
        return { response: NextResponse.json({ error: "Date parameter is required" }, { status: 400 }) };
      }

      // Parse the requested date (e.g. YYYY-MM-DD)
      const requestedDate = new Date(dateStr);
      if (isNaN(requestedDate.getTime())) {
        return { response: NextResponse.json({ error: "Invalid date format" }, { status: 400 }) };
      }

      // Determine the day of the week
      const dayOfWeekIndex = requestedDate.getDay();
      const dayOfWeekName = DAYS_OF_WEEK[dayOfWeekIndex] as DayOfWeek;

      const cachedResult = await getCachedProviderSlots(params.id, dateStr, dayOfWeekName);

      if ("error" in cachedResult) {
        return { response: NextResponse.json({ error: "Provider not found" }, { status: 404 }) };
      }

      return { data: cachedResult.data };
    } catch (error) {
      console.error("[slots-api] Error fetching slots:", error);
      return { response: NextResponse.json({ error: "Internal server error" }, { status: 500 }) };
    }
  });

  if (result.response) return result.response;
  return createTimedResponse(result.data, durationMs);
}
