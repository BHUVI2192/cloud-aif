import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, slug, description, iconKey, sortOrder, isActive } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        description: description || null,
        iconKey: iconKey || "tool",
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
      },
    });

    revalidateTag("categories");
    return NextResponse.json({ ok: true, category });
  } catch (err: any) {
    console.error("[admin-category-create]", err);
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, name, slug, description, iconKey, sortOrder, isActive } = await req.json();
    if (!id || !name || !slug) {
      return NextResponse.json({ error: "ID, Name and Slug are required" }, { status: 400 });
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        description: description || null,
        iconKey: iconKey || "tool",
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive === true,
      },
    });

    revalidateTag("categories");
    return NextResponse.json({ ok: true, category });
  } catch (err: any) {
    console.error("[admin-category-update]", err);
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const category = await db.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    revalidateTag("categories");
    return NextResponse.json({ ok: true, category });
  } catch (err: any) {
    console.error("[admin-category-delete]", err);
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}
