import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum([UserRole.CUSTOMER, UserRole.PROVIDER]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = result.data;
    const lowerEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    // Create user and profile in a transaction to ensure atomic execution
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: lowerEmail,
          passwordHash,
          role,
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });

      if (role === UserRole.PROVIDER) {
        const baseSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const publicSlug = `${baseSlug || "provider"}-${Math.random().toString(36).substring(2, 7)}`;

        await tx.providerProfile.create({
          data: {
            userId: user.id,
            legalName: name,
            displayName: name,
            publicSlug,
            status: "DRAFT",
            experienceYears: 0,
            languages: [],
          },
        });
      } else {
        await tx.customerProfile.create({
          data: {
            userId: user.id,
            displayName: name,
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      { success: true, userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup." },
      { status: 500 }
    );
  }
}
