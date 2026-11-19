import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(services).orderBy(asc(services.sortOrder));
    return NextResponse.json({
      ok: true,
      data: rows.map((r) => ({ ...r, price: Number(r.price) })),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [row] = await db
      .insert(services)
      .values({
        name: body.name,
        description: body.description ?? "",
        price: String(body.price ?? 0),
        durationMin: Number(body.durationMin ?? 30),
        active: body.active ?? true,
        sortOrder: Number(body.sortOrder ?? 0),
        icon: body.icon ?? "scissors",
      })
      .returning();
    return NextResponse.json({ ok: true, data: { ...row, price: Number(row.price) } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 });
    const [row] = await db
      .update(services)
      .set({
        name: body.name,
        description: body.description,
        price: body.price !== undefined ? String(body.price) : undefined,
        durationMin: body.durationMin,
        active: body.active,
        sortOrder: body.sortOrder,
        icon: body.icon,
      })
      .where(eq(services.id, Number(body.id)))
      .returning();
    return NextResponse.json({ ok: true, data: row ? { ...row, price: Number(row.price) } : null });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 });
    await db.delete(services).where(eq(services.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
