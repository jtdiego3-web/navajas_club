import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shopSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(shopSettings);
    const obj: Record<string, string> = {};
    rows.forEach((r) => (obj[r.key] = r.value));
    return NextResponse.json({ ok: true, data: obj });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // { key, value } o { settings: {k:v} }
    const entries: [string, string][] = body.settings
      ? Object.entries(body.settings)
      : [[body.key, body.value]];
    for (const [k, v] of entries) {
      if (!k) continue;
      const found = await db.select().from(shopSettings).where(eq(shopSettings.key, k));
      if (found.length === 0) await db.insert(shopSettings).values({ key: k, value: String(v ?? "") });
      else await db.update(shopSettings).set({ value: String(v ?? "") }).where(eq(shopSettings.key, k));
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
