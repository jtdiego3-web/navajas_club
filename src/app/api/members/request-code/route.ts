import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memberOtps, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TEST_MEMBER } from "@/lib/constants";

/**
 * POST { phone, name? } -> { code (simulador), expiresIn }
 * - Si phone es el cliente de prueba, código = 1234
 * - Si no, genera código aleatorio de 4 dígitos (en producción enviar por WhatsApp)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = String(body.phone ?? "").replace(/[^\d]/g, "");
    if (rawPhone.length < 9) {
      return NextResponse.json({ ok: false, error: "Número de WhatsApp no válido" }, { status: 400 });
    }

    // Normalizar: quedarse con últimos 9 si viene con prefijo 34
    let phone = rawPhone;
    if (phone.startsWith("34") && phone.length > 9) phone = phone.slice(-9);

    let code: string;
    const isTest = phone === TEST_MEMBER.phone;
    if (isTest) {
      code = TEST_MEMBER.code;
    } else {
      code = String(Math.floor(1000 + Math.random() * 9000));
    }

    // Asegurar miembro
    const found = await db.select().from(members).where(eq(members.phone, phone));
    if (found.length === 0) {
      await db.insert(members).values({ phone, name: String(body.name ?? "") });
    } else if (body.name && !found[0].name) {
      await db.update(members).set({ name: String(body.name) }).where(eq(members.phone, phone));
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.insert(memberOtps).values({ phone, code, expiresAt });

    return NextResponse.json({
      ok: true,
      data: {
        phone,
        code, // <-- SIMULADOR: en producción NO devolver el código, enviarlo por WhatsApp
        isTest,
        expiresInSec: 600,
        waHint: isTest
          ? `Cliente de prueba: usa ${TEST_MEMBER.code}`
          : "Código simulado mostrado en pantalla (conectar /api/whatsapp en producción)",
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
