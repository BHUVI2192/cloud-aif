import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/documents/[filename]
 * Securely streams provider KYC documents only to authenticated Admins.
 */
export async function GET(
  req: Request,
  { params }: { params: { filename: string } }
) {
  const session = await getSession();
  
  // Hard restriction: Only ADMIN or SUPER_ADMIN users can access documents
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return new Response("Forbidden: Access restricted to administrators.", {
      status: 403,
    });
  }

  const { filename } = params;

  // Sanitize filename to prevent directory traversal attacks (e.g. filename = "../../../etc/passwd")
  const sanitizedFilename = path.basename(filename);

  // Read from the secure private upload directory in the root
  const secureDir = path.join(process.cwd(), "secure_uploads", "documents");
  const filePath = path.join(secureDir, sanitizedFilename);

  if (!existsSync(filePath)) {
    return new Response("File not found.", { status: 404 });
  }

  try {
    const fileBuffer = await readFile(filePath);
    
    // Set appropriate content type headers based on file extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[documents-secure] Error reading secure document:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
