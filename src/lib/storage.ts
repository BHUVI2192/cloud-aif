import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Uploads a file to Supabase Storage if configured; otherwise, falls back to
 * saving to the local filesystem, and then to a Base64 data URL.
 * 
 * @param file The file object to upload
 * @param bucketName The name of the Supabase bucket or local directory
 * @param customFileName Optional custom file name
 * @returns The public URL of the uploaded resource
 */
export async function uploadFile(
  file: File,
  bucketName: string,
  customFileName?: string
): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  
  const ext = path.extname(file.name) || ".bin";
  const fileName = customFileName || `${crypto.randomUUID()}${ext}`;

  // 1. Try Supabase Storage if configured
  if (supabaseUrl && supabaseKey) {
    try {
      const cleanUrl = supabaseUrl.replace(/\/$/, "");
      const uploadUrl = `${cleanUrl}/storage/v1/object/${bucketName}/${fileName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      console.log(`[Supabase Storage] Uploading to ${bucketName}/${fileName}...`);
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

      if (res.ok) {
        return `${cleanUrl}/storage/v1/object/public/${bucketName}/${fileName}`;
      } else {
        const errText = await res.text();
        console.warn(`[Supabase Storage] Upload failed (status ${res.status}): ${errText}. Falling back to local FS...`);
      }
    } catch (error) {
      console.warn(`[Supabase Storage] Exception uploading ${fileName}:`, error);
    }
  }

  // 2. Local filesystem fallback
  try {
    const publicDir = path.join(process.cwd(), "public");
    const targetDir = path.join(publicDir, "uploads", bucketName);
    await mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    console.log(`[Local Filesystem] Saved file to /uploads/${bucketName}/${fileName}`);
    return `/uploads/${bucketName}/${fileName}`;
  } catch (fsError) {
    // 3. Base64 database fallback (for read-only systems)
    console.warn(`[Local Filesystem] Save failed. Falling back to Base64 Data URL...`, fsError);
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }
}
