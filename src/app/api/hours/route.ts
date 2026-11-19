import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businessHours } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(businessHours).orderBy(asc(businessHours.weekday));
    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    // body: { hours: [{weekday,isOpen,openTime,closeTime}] } o un solo objeto
    const list = Array.isArray(body.hours) ? body.hours : [body];
    for (const h of list) {
      await db
        .update(businessHours)
        .set({
          isOpen: h.isOpen,
          openTime: h.openTime,
          closeTime: h.closeTime,
        })
        .where(eq(businessHours.weekday, Number(h.weekday)));
    }
    const rows = await db.select().from(businessHours).orderBy(asc(businessHours.weekday));
    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
