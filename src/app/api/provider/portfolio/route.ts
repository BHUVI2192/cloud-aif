import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("ADD"),
    title: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().url(),
  }),
  z.object({
    action: z.literal("DELETE"),
    id: z.string().min(1),
  }),
]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      const action = formData.get("action") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string | null;
      const imageFile = formData.get("imageFile") as File | null;

      if (action !== "ADD" || !title || !imageFile) {
        return NextResponse.json({ error: "Missing required fields or action" }, { status: 400 });
      }

      const provider = await db.providerProfile.findUnique({ where: { userId: session.user.id } });
      if (!provider) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      // Save portfolio image
      const publicDir = path.join(process.cwd(), "public");
      const portfolioDir = path.join(publicDir, "uploads", "portfolio");
      await mkdir(portfolioDir, { recursive: true });

      const ext = path.extname(imageFile.name) || ".jpg";
      const filename = `${session.user.id}_portfolio_${Date.now()}${ext}`;
      const filepath = path.join(portfolioDir, filename);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await writeFile(filepath, buffer);

      const imageUrl = `/uploads/portfolio/${filename}`;

      const maxSort = await db.providerPortfolioItem.aggregate({
        where: { providerId: provider.id },
        _max: { sortOrder: true },
      });
      const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

      const item = await db.providerPortfolioItem.create({
        data: {
          providerId: provider.id,
          title,
          description: description || null,
          imageUrl,
          sortOrder: nextSort,
        },
      });

      return NextResponse.json({ ok: true, item });
    } catch (error: any) {
      console.error("Portfolio Upload Error:", error);
      return NextResponse.json({ error: error.message || "Failed to process portfolio upload" }, { status: 500 });
    }
  } else {
    try {
      const parsed = schema.safeParse(await req.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
      }

      const provider = await db.providerProfile.findUnique({ where: { userId: session.user.id } });
      if (!provider) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      const data = parsed.data;

      if (data.action === "ADD") {
        const maxSort = await db.providerPortfolioItem.aggregate({
          where: { providerId: provider.id },
          _max: { sortOrder: true },
        });
        const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

        const item = await db.providerPortfolioItem.create({
          data: {
            providerId: provider.id,
            title: data.title,
            description: data.description || null,
            imageUrl: data.imageUrl,
            sortOrder: nextSort,
          },
        });
        return NextResponse.json({ ok: true, item });
      } else {
        const item = await db.providerPortfolioItem.findUnique({ where: { id: data.id } });
        if (!item || item.providerId !== provider.id) {
          return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
        }

        await db.providerPortfolioItem.delete({ where: { id: data.id } });
        return NextResponse.json({ ok: true });
      }
    } catch (error: any) {
      console.error("Portfolio JSON Action Error:", error);
      return NextResponse.json({ error: error.message || "Failed to process action" }, { status: 500 });
    }
  }
}
