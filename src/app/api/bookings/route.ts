import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, businessHours, closedDates, members, visits } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

/**
 * GET /api/bookings?date=YYYY-MM-DD  -> lista (orden fecha/hora)
 * POST /api/bookings {serviceId,serviceName,price,date,time,clientName,clientPhone}
 * PATCH /api/bookings {id, status}  -> pending|completed|cancelled
 *    - Si status=completed: suma +1 sello al miembro (lo crea si no existe) y registra visita.
 * DELETE /api/bookings?id=1
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    let rows;
    if (date) {
      rows = await db
        .select()
        .from(bookings)
        .where(eq(bookings.date, date))
        .orderBy(asc(bookings.time));
    } else {
      rows = await db
        .select()
        .from(bookings)
        .orderBy(desc(bookings.date), desc(bookings.time))
        .limit(200);
    }
    return NextResponse.json({
      ok: true,
      data: rows.map((r) => ({ ...r, price: Number(r.price), createdAt: r.createdAt?.toISOString() })),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, serviceName, price, date, time, clientName, clientPhone, notes } = body;
    if (!serviceName || !date || !time || !clientName || !clientPhone) {
      return NextResponse.json({ ok: false, error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Validar día abierto
    const [y, m, d] = String(date).split("-").map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    const hours = await db.select().from(businessHours).where(eq(businessHours.weekday, weekday));
    if (hours.length && !hours[0].isOpen) {
      return NextResponse.json({ ok: false, error: "Ese día la barbería está cerrada" }, { status: 400 });
    }
    if (hours.length && hours[0].isOpen) {
      if (time < hours[0].openTime || time >= hours[0].closeTime) {
        return NextResponse.json({ ok: false, error: "Hora fuera del horario de apertura" }, { status: 400 });
      }
    }
    const closed = await db.select().from(closedDates).where(eq(closedDates.date, String(date)));
    if (closed.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Fecha cerrada: ${closed[0].reason || "festivo"}` },
        { status: 400 }
      );
    }

    // Evitar doble reserva misma fecha+hora pendiente
    const existing = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.date, String(date)), eq(bookings.time, String(time)), eq(bookings.status, "pending")));
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, error: "Esa hora ya está ocupada" }, { status: 409 });
    }

    const phone = String(clientPhone).replace(/[^\d]/g, "");
    const [row] = await db
      .insert(bookings)
      .values({
        serviceId: serviceId ? Number(serviceId) : null,
        serviceName: String(serviceName),
        price: String(price ?? 0),
        date: String(date),
        time: String(time),
        clientName: String(clientName),
        clientPhone: phone,
        status: "pending",
        notes: String(notes ?? ""),
      })
      .returning();

    // Asegurar que existe el miembro (para fidelización futura)
    const found = await db.select().from(members).where(eq(members.phone, phone));
    if (found.length === 0) {
      await db.insert(members).values({ phone, name: String(clientName), stamps: 0, totalCuts: 0 });
    }

    return NextResponse.json({
      ok: true,
      data: { ...row, price: Number(row.price), createdAt: row.createdAt?.toISOString() },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return NextResponse.json({ ok: false, error: "Falta id o status" }, { status: 400 });
    if (!["pending", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Estado no válido" }, { status: 400 });
    }

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, Number(id)));
    if (!booking) return NextResponse.json({ ok: false, error: "Reserva no encontrada" }, { status: 404 });

    // Si ya estaba completada y se vuelve a completar, no duplicar sellos
    const wasCompleted = booking.status === "completed";

    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, Number(id)))
      .returning();

    let memberInfo = null;
    if (status === "completed" && !wasCompleted) {
      // Buscar o crear miembro
      let [member] = await db.select().from(members).where(eq(members.phone, booking.clientPhone));
      if (!member) {
        [member] = await db
          .insert(members)
          .values({ phone: booking.clientPhone, name: booking.clientName, stamps: 0, totalCuts: 0 })
          .returning();
      }
      let newStamps = (member.stamps ?? 0) + 1;
      let freeCut = member.freeCutAvailable;
      // Al llegar a 8 -> corte gratis disponible y reseteo a 0 tras canje? Aquí: marcar disponible y mantener 8 hasta canjear.
      if (newStamps >= 8) {
        freeCut = true;
        newStamps = 8;
      }
      const [m2] = await db
        .update(members)
        .set({ stamps: newStamps, totalCuts: (member.totalCuts ?? 0) + 1, freeCutAvailable: freeCut })
        .where(eq(members.id, member.id))
        .returning();
      memberInfo = m2;

      await db.insert(visits).values({
        memberId: member.id,
        memberPhone: member.phone,
        date: booking.date,
        time: booking.time,
        serviceName: booking.serviceName,
        status: "completed",
        bookingId: booking.id,
      });
    }

    return NextResponse.json({
      ok: true,
      data: { ...updated, price: Number(updated.price) },
      member: memberInfo,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 });
    await db.delete(bookings).where(eq(bookings.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
