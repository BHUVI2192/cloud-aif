import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional().nullable(),
  locality: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const { name, phone, line1, line2, locality, pincode, latitude, longitude } = parsed.data;

    // Check if phone number is already taken by another user
    const existingPhoneUser = await db.user.findFirst({
      where: {
        phone,
        id: { not: session.user.id }
      }
    });

    if (existingPhoneUser) {
      return NextResponse.json(
        { error: "This phone number is already registered with another account." },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      // 1. Get or create CustomerProfile
      let customerProfile = await tx.customerProfile.findUnique({
        where: { userId: session.user.id }
      });

      if (!customerProfile) {
        customerProfile = await tx.customerProfile.create({
          data: {
            userId: session.user.id,
            displayName: name
          }
        });
      } else {
        await tx.customerProfile.update({
          where: { id: customerProfile.id },
          data: { displayName: name }
        });
      }

      // 2. Update User details
      await tx.user.update({
        where: { id: session.user.id },
        data: { name, phone }
      });

      // 3. Upsert default Address
      const existingAddress = await tx.address.findFirst({
        where: { customerProfileId: customerProfile.id }
      });

      if (existingAddress) {
        await tx.address.update({
          where: { id: existingAddress.id },
          data: {
            line1,
            line2,
            locality,
            pincode,
            latitude,
            longitude,
            type: "CUSTOMER_SERVICE"
          }
        });
      } else {
        await tx.address.create({
          data: {
            customerProfileId: customerProfile.id,
            line1,
            line2,
            locality,
            pincode,
            latitude,
            longitude,
            type: "CUSTOMER_SERVICE"
          }
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[customer-profile-api] Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile details" }, { status: 500 });
  }
}
