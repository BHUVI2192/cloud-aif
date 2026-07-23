import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const url = await uploadFile(file, bucket);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error: any) {
    console.error("[upload-api] Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
