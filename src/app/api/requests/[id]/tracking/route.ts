import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          where: { status: "ACCEPTED" },
          include: {
            provider: {
              include: {
                user: { select: { name: true, phone: true, image: true } },
                liveLocation: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    const assignedProvider = request.assignments[0]?.provider;
    if (!assignedProvider || !assignedProvider.liveLocation) {
      return NextResponse.json({ trackingActive: false });
    }

    const liveLoc = assignedProvider.liveLocation;
    const isStale = liveLoc.staleAt < new Date();

    let distanceKm: number | null = null;
    let estimatedEtaMinutes: number | null = null;

    if (request.latitude && request.longitude) {
      distanceKm = parseFloat(
        haversineDistanceKm(liveLoc.latitude, liveLoc.longitude, request.latitude, request.longitude).toFixed(2)
      );
      // Assuming avg urban speed of 25 km/h
      estimatedEtaMinutes = Math.max(1, Math.round((distanceKm / 25) * 60));
    }

    return NextResponse.json({
      trackingActive: true,
      providerName: assignedProvider.displayName || assignedProvider.user.name,
      providerImage: assignedProvider.profileImage || assignedProvider.user.image,
      providerPhone: assignedProvider.user.phone,
      latitude: liveLoc.latitude,
      longitude: liveLoc.longitude,
      heading: liveLoc.heading,
      speed: liveLoc.speed,
      accuracy: liveLoc.accuracy,
      staleAt: liveLoc.staleAt,
      isStale,
      lastUpdated: liveLoc.updatedAt,
      distanceKm,
      estimatedEtaMinutes,
      status: request.status,
    });
  } catch (error) {
    console.error("[tracking-api] Error fetching tracking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized provider access" }, { status: 401 });
    }

    const provider = await db.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { latitude, longitude, heading, speed, accuracy } = body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Invalid latitude or longitude" }, { status: 400 });
    }

    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, latitude: true, longitude: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const staleAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins stale threshold

    // Parallelize live location upsert and ping log creation
    await Promise.all([
      db.providerLiveLocation.upsert({
        where: { providerId: provider.id },
        update: { latitude, longitude, heading, speed, accuracy, staleAt },
        create: { providerId: provider.id, latitude, longitude, heading, speed, accuracy, staleAt },
      }),
      db.providerLocationPing.create({
        data: {
          providerId: provider.id,
          requestId: params.id,
          latitude,
          longitude,
          heading,
          speed,
          accuracy,
        },
      }),
    ]);

    // Check geofence proximity (within 200m = 0.2km)
    let autoArrivedNearby = false;
    if (request.status === "EN_ROUTE" && request.latitude && request.longitude) {
      const dist = haversineDistanceKm(latitude, longitude, request.latitude, request.longitude);
      if (dist <= 0.2) {
        autoArrivedNearby = true;
        await db.$transaction([
          db.serviceRequest.update({
            where: { id: params.id },
            data: { status: "ARRIVED_NEARBY" },
          }),
          db.requestStatusHistory.create({
            data: {
              requestId: params.id,
              fromStatus: "EN_ROUTE",
              toStatus: "ARRIVED_NEARBY",
              changedById: session.user.id,
              note: "Provider detected within 200 meters of customer location via GPS geofence",
            },
          }),
        ]);
      }
    }

    return NextResponse.json({ success: true, autoArrivedNearby });
  } catch (error) {
    console.error("[tracking-api] Error posting location ping:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
