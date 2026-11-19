import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memberOtps, members, visits } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { TEST_MEMBER } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let phone = String(body.phone ?? "").replace(/[^\d]/g, "");
    if (phone.startsWith("34") && phone.length > 9) phone = phone.slice(-9);
    const code = String(body.code ?? "").trim();

    if (!phone || !code) {
      return NextResponse.json({ ok: false, error: "Faltan teléfono o código" }, { status: 400 });
    }

    // Bypass de prueba
    const isTestBypass = phone === TEST_MEMBER.phone && code === TEST_MEMBER.code;

    if (!isTestBypass) {
      const rows = await db
        .select()
        .from(memberOtps)
        .where(and(eq(memberOtps.phone, phone), eq(memberOtps.code, code)))
        .orderBy(desc(memberOtps.createdAt))
        .limit(1);
      if (rows.length === 0) {
        return NextResponse.json({ ok: false, error: "Código incorrecto" }, { status: 401 });
      }
      if (new Date(rows[0].expiresAt).getTime() < Date.now()) {
        return NextResponse.json({ ok: false, error: "Código caducado. Solicita uno nuevo." }, { status: 401 });
      }
    }

    let [member] = await db.select().from(members).where(eq(members.phone, phone));
    if (!member) {
      [member] = await db.insert(members).values({ phone, name: "" }).returning();
    }

    const history = await db
      .select()
      .from(visits)
      .where(eq(visits.memberPhone, phone))
      .orderBy(desc(visits.date), desc(visits.id))
      .limit(50);

    return NextResponse.json({
      ok: true,
      data: {
        member,
        visits: history.map((v) => ({ ...v, createdAt: v.createdAt?.toISOString() })),
        progress: {
          stamps: member.stamps,
          needed: 8,
          remaining: Math.max(0, 8 - (member.stamps ?? 0)),
          freeCut: member.freeCutAvailable,
        },
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
