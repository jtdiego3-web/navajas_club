import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(siteImages).orderBy(asc(siteImages.sortOrder));
    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [row] = await db
      .insert(siteImages)
      .values({
        slot: body.slot ?? "gallery",
        url: body.url,
        caption: body.caption ?? "",
        sortOrder: Number(body.sortOrder ?? 0),
      })
      .returning();
    return NextResponse.json({ ok: true, data: row });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 });
    const [row] = await db
      .update(siteImages)
      .set({ url: body.url, caption: body.caption, sortOrder: body.sortOrder, slot: body.slot })
      .where(eq(siteImages.id, Number(body.id)))
      .returning();
    return NextResponse.json({ ok: true, data: row });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 });
    await db.delete(siteImages).where(eq(siteImages.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
