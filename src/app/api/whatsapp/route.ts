import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/whatsapp
 * Body: { to, message, kind?: "booking_admin" | "booking_client" | "otp" | "generic", meta?: any }
 *
 * Ruta lista para conectar un proveedor real (Twilio / WhatsApp Cloud API / Ultramsg...).
 * Por ahora:
 *  - genera el enlace wa.me listo para abrir
 *  - registra el payload en consola (sustituir por envío real con fetch al proveedor)
 *
 * Para producción, define WHATSAPP_TOKEN y WHATSAPP_PHONE_ID en .env y
 * descompleta el bloque de envío a Meta Cloud API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, kind = "generic", meta = {} } = body;
    if (!to || !message) {
      return NextResponse.json({ ok: false, error: "Faltan 'to' o 'message'" }, { status: 400 });
    }

    const digits = String(to).replace(/[^\d]/g, "");
    const waLink = `https://wa.me/${digits}?text=${encodeURIComponent(String(message))}`;

    console.log("[whatsapp]", { kind, to: digits, preview: String(message).slice(0, 120), meta });

    // ---- Ejemplo integración Meta WhatsApp Cloud API (descomentar en producción) ----
    // const token = process.env.WHATSAPP_TOKEN;
    // const phoneId = process.env.WHATSAPP_PHONE_ID;
    // let providerResult = null;
    // if (token && phoneId) {
    //   const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    //     method: "POST",
    //     headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       messaging_product: "whatsapp",
    //       to: digits,
    //       type: "text",
    //       text: { body: String(message) },
    //     }),
    //   });
    //   providerResult = await res.json();
    // }

    return NextResponse.json({
      ok: true,
      data: {
        to: digits,
        waLink,
        kind,
        simulated: true,
        hint: "Conecta WHATSAPP_TOKEN para envío automático real. Mientras tanto usa waLink.",
        // provider: providerResult ?? undefined,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST { to, message, kind } -> { waLink }",
  });
}
