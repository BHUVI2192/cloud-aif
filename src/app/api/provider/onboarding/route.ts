import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

async function uploadToSupabaseBucket(
  file: File,
  bucketName: string,
  filePath: string
): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    const cleanUrl = supabaseUrl.replace(/\/$/, "");
    const uploadUrl = `${cleanUrl}/storage/v1/object/${bucketName}/${filePath}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Supabase Storage] Upload to ${bucketName}/${filePath} failed (status ${res.status}): ${errText}. Falling back...`);
      return null;
    }

    return `${cleanUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
  } catch (error) {
    console.warn(`[Supabase Storage] Exception while uploading ${filePath}:`, error);
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const formData = await req.formData();
    const legalName = formData.get("legalName") as string;
    const displayName = formData.get("displayName") as string;
    const primaryCategoryId = formData.get("primaryCategoryId") as string;
    const experienceYearsStr = formData.get("experienceYears") as string;
    const phone = formData.get("phone") as string;

    const profilePic = formData.get("profilePic") as File | null;
    const idProof = formData.get("idProof") as File | null;
    const addressProof = formData.get("addressProof") as File | null;

    if (!legalName || !displayName || !primaryCategoryId || !experienceYearsStr || !phone || !profilePic || !idProof || !addressProof) {
      return NextResponse.json({ error: "Missing required fields or files" }, { status: 400 });
    }

    const trimmedPhone = phone.trim();
    // Validate phone number uniqueness before database transaction to prevent Unique Constraint crashes
    const existingPhoneUser = await db.user.findFirst({
      where: {
        phone: trimmedPhone,
        id: { not: session.user.id }
      }
    });

    if (existingPhoneUser) {
      return NextResponse.json(
        { error: "This phone number is already registered with another account. Please use a different number." },
        { status: 400 }
      );
    }

    const experienceYears = parseInt(experienceYearsStr, 10) || 0;

    let profileImageUrl = "";
    let idProofUrl = "";
    let addressProofUrl = "";

    // 1. Try Supabase Storage first if configured
    const profilePicExt = path.extname(profilePic.name) || ".jpg";
    const profilePicFilename = `${session.user.id}_profile${profilePicExt}`;
    const idProofExt = path.extname(idProof.name) || ".pdf";
    const idProofFilename = `${session.user.id}_id_proof${idProofExt}`;
    const addressProofExt = path.extname(addressProof.name) || ".pdf";
    const addressProofFilename = `${session.user.id}_address_proof${addressProofExt}`;

    const uploadedProfile = await uploadToSupabaseBucket(profilePic, "provider-documents", `profile-pics/${profilePicFilename}`);
    const uploadedId = await uploadToSupabaseBucket(idProof, "provider-documents", `kyc/${idProofFilename}`);
    const uploadedAddress = await uploadToSupabaseBucket(addressProof, "provider-documents", `kyc/${addressProofFilename}`);

    if (uploadedProfile && uploadedId && uploadedAddress) {
      profileImageUrl = uploadedProfile;
      idProofUrl = uploadedId;
      addressProofUrl = uploadedAddress;
    } else {
      // 2. Try Local Filesystem
      const publicDir = path.join(process.cwd(), "public");
      const profilePicsDir = path.join(publicDir, "uploads", "profile-pics");
      const secureDocumentsDir = path.join(process.cwd(), "secure_uploads", "documents");

      try {
        await mkdir(profilePicsDir, { recursive: true });
        await mkdir(secureDocumentsDir, { recursive: true });

        const profilePicPath = path.join(profilePicsDir, profilePicFilename);
        const profilePicBuffer = Buffer.from(await profilePic.arrayBuffer());
        await writeFile(profilePicPath, profilePicBuffer);
        profileImageUrl = `/uploads/profile-pics/${profilePicFilename}`;

        const idProofPath = path.join(secureDocumentsDir, idProofFilename);
        const idProofBuffer = Buffer.from(await idProof.arrayBuffer());
        await writeFile(idProofPath, idProofBuffer);
        idProofUrl = `/api/admin/documents/${idProofFilename}`;

        const addressProofPath = path.join(secureDocumentsDir, addressProofFilename);
        const addressProofBuffer = Buffer.from(await addressProof.arrayBuffer());
        await writeFile(addressProofPath, addressProofBuffer);
        addressProofUrl = `/api/admin/documents/${addressProofFilename}`;
      } catch (fsError) {
        // 3. Fallback to Base64 Database Storage (Vercel serverless read-only fallback)
        console.warn("Filesystem is read-only or not writeable. Falling back to database Base64 storage...", fsError);

        const profilePicBuffer = Buffer.from(await profilePic.arrayBuffer());
        const profilePicMime = profilePic.type || "image/jpeg";
        profileImageUrl = `data:${profilePicMime};base64,${profilePicBuffer.toString("base64")}`;

        const idProofBuffer = Buffer.from(await idProof.arrayBuffer());
        const idProofMime = idProof.type || "application/pdf";
        idProofUrl = `data:${idProofMime};base64,${idProofBuffer.toString("base64")}`;

        const addressProofBuffer = Buffer.from(await addressProof.arrayBuffer());
        const addressProofMime = addressProof.type || "application/pdf";
        addressProofUrl = `data:${addressProofMime};base64,${addressProofBuffer.toString("base64")}`;
      }
    }

    // Generate unique slug for the provider
    const slugBase = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const publicSlug = `${slugBase}-${randomSuffix}`;

    // Database updates sequentially (avoiding $transaction timeouts on serverless pgBouncer)
    // 1. Update user phone & image & role
    await db.user.update({
      where: { id: session.user.id },
      data: {
        phone: trimmedPhone,
        image: profileImageUrl, // set provider profile photo as DP
        role: "PROVIDER"
      }
    });

    // 2. Upsert provider profile
    const profile = await db.providerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        legalName,
        displayName,
        publicSlug,
        experienceYears,
        primaryCategoryId,
        profileImage: profileImageUrl,
        status: "PENDING_VERIFICATION",
        verificationStatus: "PENDING",
        isActive: false,
        completenessScore: 50,
        termsAcceptedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        legalName,
        displayName,
        publicSlug,
        experienceYears,
        primaryCategoryId,
        profileImage: profileImageUrl,
        status: "PENDING_VERIFICATION",
        verificationStatus: "PENDING",
        isActive: false,
        completenessScore: 50,
        termsAcceptedAt: new Date(),
      }
    });

    // 3. Create document entries
    await db.providerDocument.deleteMany({
      where: {
        providerId: profile.id,
        type: { in: ["ID_PROOF", "ADDRESS_PROOF"] }
      }
    });

    await db.providerDocument.createMany({
      data: [
        {
          providerId: profile.id,
          type: "ID_PROOF",
          fileUrl: idProofUrl,
          fileName: idProof.name,
          status: "PENDING"
        },
        {
          providerId: profile.id,
          type: "ADDRESS_PROOF",
          fileUrl: addressProofUrl,
          fileName: addressProof.name,
          status: "PENDING"
        }
      ]
    });

    return NextResponse.json({ success: true, profileId: profile.id }, { status: 201 });
  } catch (error: any) {
    console.error("Provider Onboarding Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process onboarding" }, { status: 500 });
  }
}
