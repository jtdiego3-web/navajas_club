import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members, visits } from "@/db/schema";
import { eq } from "drizzle-orm";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** POST { phone } -> canjea el corte gratis: stamps=0, freeCutAvailable=false, freeCutRedeemed+1 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let phone = String(body.phone ?? "").replace(/[^\d]/g, "");
    if (phone.startsWith("34") && phone.length > 9) phone = phone.slice(-9);

    const [member] = await db.select().from(members).where(eq(members.phone, phone));
    if (!member) return NextResponse.json({ ok: false, error: "Miembro no encontrado" }, { status: 404 });
    if (!member.freeCutAvailable) {
      return NextResponse.json({ ok: false, error: "No tienes corte gratis disponible" }, { status: 400 });
    }

    const [updated] = await db
      .update(members)
      .set({
        stamps: 0,
        freeCutAvailable: false,
        freeCutRedeemed: (member.freeCutRedeemed ?? 0) + 1,
      })
      .where(eq(members.id, member.id))
      .returning();

    await db.insert(visits).values({
      memberId: member.id,
      memberPhone: member.phone,
      date: todayISO(),
      time: "",
      serviceName: "🎁 Corte GRATIS canjeado (8+1)",
      status: "free",
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
