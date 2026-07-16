import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Generate unique file name
    const ext = path.extname(file.name) || ".webm";
    const uniqueName = `${crypto.randomUUID()}${ext}`;

    const publicDir = path.join(process.cwd(), "public");
    const voiceUploadsDir = path.join(publicDir, "uploads", "voice");

    await mkdir(voiceUploadsDir, { recursive: true });

    const filePath = path.join(voiceUploadsDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/voice/${uniqueName}`;
    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error: any) {
    console.error("[upload-voice] Error uploading voice note:", error);
    return NextResponse.json({ error: "Failed to upload voice note" }, { status: 500 });
  }
}
