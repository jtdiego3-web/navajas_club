import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { closedDates } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(closedDates).orderBy(asc(closedDates.date));
    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.date) return NextResponse.json({ ok: false, error: "Falta fecha" }, { status: 400 });
    const [row] = await db
      .insert(closedDates)
      .values({ date: body.date, reason: body.reason ?? "" })
      .returning()
      .catch(async () => {
        // si ya existe, actualizar motivo
        const [u] = await db
          .update(closedDates)
          .set({ reason: body.reason ?? "" })
          .where(eq(closedDates.date, body.date))
          .returning();
        return [u];
      });
    return NextResponse.json({ ok: true, data: row });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const date = searchParams.get("date");
    if (id) await db.delete(closedDates).where(eq(closedDates.id, Number(id)));
    else if (date) await db.delete(closedDates).where(eq(closedDates.date, date));
    else return NextResponse.json({ ok: false, error: "Falta id o date" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
