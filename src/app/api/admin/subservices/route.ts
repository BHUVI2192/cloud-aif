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
    const { categoryId, name, slug, description, sortOrder, isActive } = await req.json();
    if (!categoryId || !name || !slug) {
      return NextResponse.json({ error: "CategoryId, Name and Slug are required" }, { status: 400 });
    }

    const subservice = await db.subservice.create({
      data: {
        categoryId,
        name,
        slug: slug.toLowerCase().trim(),
        description: description || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
      },
    });

    revalidateTag("categories");
    revalidateTag("subservices");
    return NextResponse.json({ ok: true, subservice });
  } catch (err: any) {
    console.error("[admin-subservice-create]", err);
    return NextResponse.json({ error: err.message || "Failed to create subservice" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, categoryId, name, slug, description, sortOrder, isActive } = await req.json();
    if (!id || !categoryId || !name || !slug) {
      return NextResponse.json({ error: "ID, CategoryId, Name and Slug are required" }, { status: 400 });
    }

    const subservice = await db.subservice.update({
      where: { id },
      data: {
        categoryId,
        name,
        slug: slug.toLowerCase().trim(),
        description: description || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive === true,
      },
    });

    revalidateTag("categories");
    revalidateTag("subservices");
    return NextResponse.json({ ok: true, subservice });
  } catch (err: any) {
    console.error("[admin-subservice-update]", err);
    return NextResponse.json({ error: err.message || "Failed to update subservice" }, { status: 500 });
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

    const subservice = await db.subservice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    revalidateTag("categories");
    revalidateTag("subservices");
    return NextResponse.json({ ok: true, subservice });
  } catch (err: any) {
    console.error("[admin-subservice-delete]", err);
    return NextResponse.json({ error: err.message || "Failed to delete subservice" }, { status: 500 });
  }
}
