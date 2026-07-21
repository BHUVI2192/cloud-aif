import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { canTransition } from "@/lib/status-machine";
import crypto from "crypto";

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, code } = body; // action: "GENERATE" | "VERIFY" | "GET"

    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        otp: true,
        assignments: {
          where: { status: "ACCEPTED" },
          include: { provider: { select: { userId: true } } },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    const isCustomer = request.customerId === session.user.id;
    const isProvider = request.assignments.some((a) => a.provider.userId === session.user.id);
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ error: "Forbidden access to request OTP" }, { status: 403 });
    }

    if (action === "GET") {
      if (!request.otp) {
        return NextResponse.json({ otpExists: false });
      }
      return NextResponse.json({
        otpExists: true,
        expiresAt: request.otp.expiresAt,
        resendAfter: request.otp.resendAfter,
        isVerified: request.otp.isVerified,
        attempts: request.otp.attempts,
        maxAttempts: request.otp.maxAttempts,
      });
    }

    if (action === "GENERATE" || action === "RESEND") {
      if (request.otp && request.otp.resendAfter > new Date()) {
        const remainingSec = Math.ceil((request.otp.resendAfter.getTime() - Date.now()) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remainingSec} seconds before requesting a new OTP` },
          { status: 429 }
        );
      }

      // Generate random 6-digit OTP
      const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = hashOtp(plainOtp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      const resendAfter = new Date(Date.now() + 45 * 1000); // 45s cooldown

      await db.requestOtp.upsert({
        where: { requestId: params.id },
        update: {
          otpHash,
          attempts: 0,
          expiresAt,
          resendAfter,
          isVerified: false,
          verifiedAt: null,
        },
        create: {
          requestId: params.id,
          otpHash,
          attempts: 0,
          maxAttempts: 3,
          expiresAt,
          resendAfter,
        },
      });

      console.log(`[OTP GENERATED] Request ${params.id}: Plain Code = ${plainOtp}`);

      return NextResponse.json({
        success: true,
        otp: plainOtp, // Sent in response so customer can view it on UI
        expiresAt,
        resendAfter,
      });
    }

    if (action === "VERIFY") {
      if (!isProvider && !isAdmin) {
        return NextResponse.json({ error: "Only assigned provider can verify start OTP" }, { status: 403 });
      }

      if (!request.otp) {
        return NextResponse.json({ error: "No active OTP generated for this request" }, { status: 400 });
      }

      if (request.otp.isVerified) {
        return NextResponse.json({ success: true, alreadyVerified: true });
      }

      if (request.otp.expiresAt < new Date()) {
        return NextResponse.json({ error: "OTP expired. Please ask customer to resend OTP" }, { status: 400 });
      }

      if (request.otp.attempts >= request.otp.maxAttempts) {
        return NextResponse.json(
          { error: "Too many failed attempts. Please ask customer to resend a new OTP" },
          { status: 400 }
        );
      }

      const inputHash = hashOtp(code || "");
      if (inputHash !== request.otp.otpHash) {
        await db.requestOtp.update({
          where: { requestId: params.id },
          data: { attempts: { increment: 1 } },
        });
        return NextResponse.json({ error: "Invalid OTP code. Please double-check with customer." }, { status: 400 });
      }

      // Mark OTP verified & transition status to IN_PROGRESS
      if (!canTransition(request.status, "IN_PROGRESS")) {
        return NextResponse.json({ error: `Cannot transition from ${request.status} to IN_PROGRESS` }, { status: 400 });
      }

      await db.$transaction([
        db.requestOtp.update({
          where: { requestId: params.id },
          data: { isVerified: true, verifiedAt: new Date() },
        }),
        db.serviceRequest.update({
          where: { id: params.id },
          data: { status: "IN_PROGRESS" },
        }),
        db.requestStatusHistory.create({
          data: {
            requestId: params.id,
            fromStatus: request.status,
            toStatus: "IN_PROGRESS",
            changedById: session.user.id,
            note: "Job started after successful OTP verification at site",
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "OTP verified! Job is now IN_PROGRESS" });
    }

    return NextResponse.json({ error: "Invalid OTP action" }, { status: 400 });
  } catch (error) {
    console.error("[otp-api] Error processing OTP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
