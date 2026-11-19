import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  bookings,
  businessHours,
  closedDates,
  members,
  services,
  siteImages,
  visits,
  shopSettings,
} from "@/db/schema";
import { DEFAULT_GALLERY, DEFAULT_HERO, DEFAULT_HOURS, DEFAULT_SERVICES } from "@/lib/constants";

function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    // Limpiar e insertar semilla si está vacío (idempotente simple: borra todo)
    await db.delete(visits);
    await db.delete(bookings);
    await db.delete(members);
    await db.delete(closedDates);
    await db.delete(businessHours);
    await db.delete(siteImages);
    await db.delete(services);
    await db.delete(shopSettings);

    for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
      const s = DEFAULT_SERVICES[i];
      await db.insert(services).values({
        name: s.name,
        description: s.description,
        price: String(s.price),
        durationMin: s.durationMin,
        active: s.active,
        sortOrder: s.sortOrder,
        icon: s.icon,
      });
    }

    await db.insert(siteImages).values({
      slot: "hero",
      url: DEFAULT_HERO,
      caption: "Portada principal",
      sortOrder: 0,
    });
    for (let i = 0; i < DEFAULT_GALLERY.length; i++) {
      await db.insert(siteImages).values({
        slot: "gallery",
        url: DEFAULT_GALLERY[i].url,
        caption: DEFAULT_GALLERY[i].caption,
        sortOrder: i,
      });
    }

    for (const h of DEFAULT_HOURS) {
      await db.insert(businessHours).values(h);
    }

    const festivo = isoPlus(14);
    await db.insert(closedDates).values({ date: festivo, reason: "Festivo local" });

    // Miembro de prueba con 5 sellos
    const [member] = await db
      .insert(members)
      .values({
        phone: "600123456",
        name: "Carlos Ejemplo",
        stamps: 5,
        totalCuts: 5,
        freeCutAvailable: false,
        freeCutRedeemed: 0,
      })
      .returning();

    // Historial de 5 visitas
    const pastServices = ["Corte de Cabello", "Degradado / Fade", "Corte de Cabello", "Combo Corte + Barba", "Arreglo de Barba"];
    for (let i = 0; i < 5; i++) {
      await db.insert(visits).values({
        memberId: member.id,
        memberPhone: "600123456",
        date: isoPlus(-(5 - i) * 12),
        time: "12:00",
        serviceName: pastServices[i],
        status: "completed",
      });
    }

    // Segundo miembro casi completo (7 sellos) para probar el corte gratis
    const [member2] = await db
      .insert(members)
      .values({
        phone: "612345678",
        name: "Javier Ruiz",
        stamps: 7,
        totalCuts: 7,
        freeCutAvailable: false,
        freeCutRedeemed: 0,
      })
      .returning();
    for (let i = 0; i < 7; i++) {
      await db.insert(visits).values({
        memberId: member2.id,
        memberPhone: "612345678",
        date: isoPlus(-(7 - i) * 9),
        time: "11:00",
        serviceName: "Degradado / Fade",
        status: "completed",
      });
    }

    // Reservas de ejemplo
    await db.insert(bookings).values([
      {
        serviceId: 2,
        serviceName: "Degradado / Fade",
        price: "20",
        date: isoPlus(1),
        time: "11:00",
        clientName: "Javier Ruiz",
        clientPhone: "612345678",
        status: "pending",
        notes: "",
      },
      {
        serviceId: 3,
        serviceName: "Combo Corte + Barba",
        price: "30",
        date: isoPlus(1),
        time: "12:30",
        clientName: "Marco Polo",
        clientPhone: "655987321",
        status: "pending",
        notes: "",
      },
      {
        serviceId: 1,
        serviceName: "Corte de Cabello",
        price: "18",
        date: isoPlus(0),
        time: "18:00",
        clientName: "Carlos Ejemplo",
        clientPhone: "600123456",
        status: "pending",
        notes: "Cliente miembro (prueba 1234)",
      },
    ]);

    await db.insert(shopSettings).values([
      { key: "admin_phone", value: "34612345678" },
      { key: "address", value: "Av. Humboldt 1231, Edificio Humboldt" },
      { key: "hero_title", value: "El club donde el estilo es tradición" },
      { key: "hero_subtitle", value: "Cortes de precisión, arreglo de barba y trato de club privado en Av. Humboldt 1231." },
    ]);

    return NextResponse.json({ ok: true, message: "Seed completado" });
  } catch (e: unknown) {
    console.error("seed error", e);
    const msg = e instanceof Error ? e.message : "Error seed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
