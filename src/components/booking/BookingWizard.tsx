"use client";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  MessageCircle,
  Scissors,
  User,
  Phone,
  PartyPopper,
} from "lucide-react";
import {
  BookingDTO,
  BusinessHourDTO,
  ServiceDTO,
  WEEKDAY_SHORT,
  addDaysISO,
  buildSlots,
  formatDateES,
  formatPrice,
  todayISO,
  weekdayOfISO,
} from "@/lib/constants";
import ServiceIcon from "../ServiceIcon";
import { downloadICS, googleCalendarUrl } from "@/lib/calendar";
import { bookingMessageToAdmin, waLink } from "@/lib/whatsapp";
import { SHOP } from "@/lib/constants";

interface Props {
  services: ServiceDTO[];
  hours: BusinessHourDTO[];
  closedDates: { id: number; date: string; reason: string }[];
  adminPhone: string;
  onBooked?: () => void;
}

export default function BookingWizard({ services, hours, closedDates, adminPhone, onBooked }: Props) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dayBookings, setDayBookings] = useState<BookingDTO[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [done, setDone] = useState<BookingDTO | null>(null);
  const [waSent, setWaSent] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [services, serviceId]);

  const hoursByDay = useMemo(() => {
    const m = new Map<number, BusinessHourDTO>();
    hours.forEach((h) => m.set(h.weekday, h));
    return m;
  }, [hours]);

  const closedSet = useMemo(() => new Set(closedDates.map((c) => c.date)), [closedDates]);

  // Próximos 21 días navegables por semanas
  const days = useMemo(() => {
    const base = todayISO();
    const list: { iso: string; weekday: number; open: boolean; reason?: string }[] = [];
    for (let i = weekOffset * 7; i < weekOffset * 7 + 7; i++) {
      const iso = addDaysISO(base, i);
      const wd = weekdayOfISO(iso);
      const h = hoursByDay.get(wd);
      const isClosedDate = closedSet.has(iso);
      const open = !!h?.isOpen && !isClosedDate;
      list.push({
        iso,
        weekday: wd,
        open,
        reason: isClosedDate
          ? closedDates.find((c) => c.date === iso)?.reason || "Cerrado"
          : !h?.isOpen
            ? "Cerrado"
            : undefined,
      });
    }
    return list;
  }, [weekOffset, hoursByDay, closedSet, closedDates]);

  // Cargar reservas del día para bloquear horas ocupadas
  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    fetch(`/api/bookings?date=${date}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const rows: BookingDTO[] = j.data ?? [];
        setDayBookings(rows.filter((b) => b.status === "pending"));
      })
      .catch(() => setDayBookings([]))
      .finally(() => setLoadingSlots(false));
  }, [date]);

  const slots = useMemo(() => {
    if (!date) return [];
    const wd = weekdayOfISO(date);
    const h = hoursByDay.get(wd);
    if (!h || !h.isOpen || closedSet.has(date)) return [];
    const all = buildSlots(h.openTime, h.closeTime, 30);
    const taken = new Set(dayBookings.map((b) => b.time));
    // Si es hoy, ocultar horas pasadas
    const now = new Date();
    const isToday = date === todayISO();
    const nowHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return all.map((s) => ({
      time: s,
      taken: taken.has(s),
      past: isToday && s <= nowHM,
    }));
  }, [date, hoursByDay, closedSet, dayBookings]);

  const canNext1 = !!service;
  const canNext2 = !!date && !!time;
  const canConfirm = canNext1 && canNext2 && name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 9;

  async function confirm() {
    if (!canConfirm || !service) return;
    setBusy(true);
    setError("");
    try {
      const payload = {
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        date,
        time,
        clientName: name.trim(),
        clientPhone: phone.replace(/[^\D]/g, "").length ? phone : phone,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "No se pudo crear la reserva");

      const booking: BookingDTO = j.data;
      setDone(booking);
      onBooked?.();

      // 1) Descarga automática .ics
      setTimeout(() => {
        downloadICS({
          serviceName: booking.serviceName,
          date: booking.date,
          time: booking.time,
          durationMin: service.durationMin,
          clientName: booking.clientName,
        });
      }, 600);

      // 2) Notificación WhatsApp al admin (webhook listo para proveedor real)
      try {
        await fetch("/api/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: adminPhone || SHOP.phoneAdmin,
            kind: "booking_admin",
            message: bookingMessageToAdmin({
              serviceName: booking.serviceName,
              date: booking.date,
              time: booking.time,
              clientName: booking.clientName,
              clientPhone: booking.clientPhone,
              price: booking.price,
            }),
            meta: { bookingId: booking.id },
          }),
        });
        setWaSent(true);
      } catch {
        /* silencioso */
      }

      setStep(4);
      window.scrollTo({ top: document.getElementById("reservar")?.offsetTop ?? 0, behavior: "smooth" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al reservar");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep(1);
    setServiceId(null);
    setDate("");
    setTime("");
    setName("");
    setPhone("");
    setDone(null);
    setError("");
    setWaSent(false);
  }

  const adminWa = done
    ? waLink(
        adminPhone || SHOP.phoneAdmin,
        bookingMessageToAdmin({
          serviceName: done.serviceName,
          date: done.date,
          time: done.time,
          clientName: done.clientName,
          clientPhone: done.clientPhone,
          price: done.price,
        })
      )
    : "";

  return (
    <div className="vintage-card rounded-3xl overflow-hidden">
      {/* Pasos */}
      <div className="flex items-center gap-1 px-4 sm:px-6 pt-5">
        {[
          { n: 1, label: "Servicio", icon: Scissors },
          { n: 2, label: "Fecha y hora", icon: Clock },
          { n: 3, label: "Tus datos", icon: User },
          { n: 4, label: "Confirmado", icon: CheckCircle2 },
        ].map((s, i) => (
          <div key={s.n} className="flex-1 flex items-center gap-1">
            <div className="flex-1">
              <div
                className={`flex items-center gap-1.5 text-[0.7rem] sm:text-xs font-medium ${
                  step >= s.n ? "text-[#E3C77F]" : "text-[#F5F2EB]/35"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-bold shrink-0 ${
                    step >= s.n
                      ? "bg-[#D4A94E] text-[#1A140E]"
                      : "border border-white/15 text-white/40"
                  }`}
                >
                  {step > s.n ? "✓" : s.n}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              <div
                className={`h-1 mt-2 rounded-full ${
                  step >= s.n ? "bg-[#D4A94E]" : "bg-white/10"
                }`}
              />
            </div>
            {i < 3 && <div className="w-1" />}
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-8">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* PASO 1: Servicio */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h3 className="font-display text-xl sm:text-2xl mb-1">Elige tu servicio</h3>
            <p className="text-sm text-[#F5F2EB]/55 mb-5">Precios con IVA · Duración aproximada</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.length === 0 && (
                <p className="text-sm text-white/50">Cargando servicios…</p>
              )}
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setServiceId(s.id);
                    setTimeout(() => setStep(2), 150);
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                    serviceId === s.id
                      ? "border-[#D4A94E] bg-[#D4A94E]/10 shadow-[0_8px_30px_-10px_rgba(212,169,78,0.5)]"
                      : "border-white/10 bg-black/30 hover:border-[#D4A94E]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#D4A94E]/10 border border-[#D4A94E]/25 flex items-center justify-center shrink-0">
                        <ServiceIcon icon={s.icon} />
                      </span>
                      <div>
                        <p className="font-semibold text-[0.95rem]">{s.name}</p>
                        <p className="text-xs text-[#F5F2EB]/50 mt-0.5 line-clamp-2">{s.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-[#F5F2EB]/50 inline-flex items-center gap-1">
                      <Clock size={12} /> {s.durationMin} min
                    </span>
                    <span className="font-display text-xl text-[#E3C77F]">{formatPrice(s.price)}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                disabled={!canNext1}
                onClick={() => setStep(2)}
                className="btn-gold px-6 py-2.5 text-sm inline-flex items-center gap-2"
              >
                Continuar <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Fecha y hora */}
        {step === 2 && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl sm:text-2xl">Fecha y hora</h3>
                <p className="text-sm text-[#F5F2EB]/55">
                  {service?.name} · {service && formatPrice(service.price)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                  disabled={weekOffset === 0}
                  className="btn-ghost p-2 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setWeekOffset(weekOffset + 1)} className="btn-ghost p-2">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Calendario semanal */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {days.map((d) => {
                const [y, m, dd] = d.iso.split("-");
                const selected = date === d.iso;
                return (
                  <button
                    key={d.iso}
                    disabled={!d.open}
                    onClick={() => {
                      setDate(d.iso);
                      setTime("");
                    }}
                    title={d.open ? formatDateES(d.iso) : d.reason}
                    className={`rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-1 text-center border transition-all ${
                      selected
                        ? "border-[#D4A94E] bg-[#D4A94E] text-[#1A140E] font-bold shadow-lg"
                        : d.open
                          ? "border-white/10 bg-black/30 hover:border-[#D4A94E]/50"
                          : "border-white/5 bg-black/10 opacity-35 cursor-not-allowed"
                    }`}
                  >
                    <span className={`block text-[0.62rem] sm:text-xs uppercase tracking-wide ${selected ? "text-[#1A140E]/70" : "text-[#F5F2EB]/45"}`}>
                      {WEEKDAY_SHORT[d.weekday]}
                    </span>
                    <span className="block text-base sm:text-xl font-bold leading-tight">{Number(dd)}</span>
                    <span className={`hidden sm:block text-[0.65rem] ${selected ? "text-[#1A140E]/70" : "text-[#F5F2EB]/40"}`}>
                      {["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][Number(m) - 1]}
                    </span>
                    {!d.open && <span className="block text-[0.55rem] mt-0.5">✕</span>}
                  </button>
                );
              })}
            </div>
            {date && (
              <p className="mt-3 text-sm text-[#E3C77F] capitalize">
                {formatDateES(date)}
                {hoursByDay.get(weekdayOfISO(date)) && (
                  <span className="text-[#F5F2EB]/50 normal-case">
                    {" "}
                    · {hoursByDay.get(weekdayOfISO(date))!.openTime}–
                    {hoursByDay.get(weekdayOfISO(date))!.closeTime}
                  </span>
                )}
              </p>
            )}

            {/* Horas */}
            <div className="mt-5">
              <p className="text-sm font-medium mb-3 text-[#F5F2EB]/80">
                Horas disponibles {loadingSlots && <Loader2 size={14} className="inline animate-spin ml-1" />}
              </p>
              {!date && <p className="text-sm text-white/40">Primero elige un día abierto en el calendario.</p>}
              {date && slots.length === 0 && (
                <p className="text-sm text-white/40">Sin huecos este día. Prueba con otra fecha.</p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {slots.map((s) => {
                  const disabled = s.taken || s.past;
                  const selected = time === s.time;
                  return (
                    <button
                      key={s.time}
                      disabled={disabled}
                      onClick={() => setTime(s.time)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        selected
                          ? "bg-[#D4A94E] text-[#1A140E] border-[#D4A94E] font-bold shadow"
                          : disabled
                            ? "border-white/5 bg-black/10 text-white/25 line-through cursor-not-allowed"
                            : "border-white/10 bg-black/30 hover:border-[#D4A94E]/50"
                      }`}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
              {slots.some((s) => s.taken) && (
                <p className="mt-2 text-xs text-white/35">Las horas tachadas ya están reservadas.</p>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="btn-ghost px-5 py-2.5 text-sm inline-flex items-center gap-2">
                <ChevronLeft size={16} /> Atrás
              </button>
              <button
                disabled={!canNext2}
                onClick={() => setStep(3)}
                className="btn-gold px-6 py-2.5 text-sm inline-flex items-center gap-2"
              >
                Continuar <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Datos */}
        {step === 3 && (
          <div className="animate-fade-up max-w-lg mx-auto">
            <h3 className="font-display text-xl sm:text-2xl text-center">Tus datos</h3>
            <p className="text-sm text-[#F5F2EB]/55 text-center mb-6">
              Te avisaremos por WhatsApp para confirmar
            </p>

            {/* Resumen */}
            <div className="rounded-2xl bg-black/40 border border-[#D4A94E]/25 p-4 mb-5 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-white/50">Servicio</span>
                <span className="font-semibold">{service?.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/50">Fecha</span>
                <span className="font-semibold capitalize">{date && formatDateES(date)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/50">Hora</span>
                <span className="font-semibold">{time}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-white/10 mt-1 pt-2">
                <span className="text-white/50">Precio</span>
                <span className="font-display text-lg text-[#E3C77F]">
                  {service && formatPrice(service.price)}
                </span>
              </div>
            </div>

            <label className="block text-sm mb-1.5 text-[#F5F2EB]/75">
              <User size={14} className="inline mr-1.5 -mt-0.5 text-[#D4A94E]" />
              Nombre
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Javier Ruiz"
              className="input-dark mb-4"
              autoComplete="name"
            />
            <label className="block text-sm mb-1.5 text-[#F5F2EB]/75">
              <Phone size={14} className="inline mr-1.5 -mt-0.5 text-[#D4A94E]" />
              WhatsApp
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 612345678"
              inputMode="tel"
              className="input-dark"
              autoComplete="tel"
            />
            <p className="text-xs text-white/35 mt-1.5">
              Con este número entrarás también al Portal de Miembros 8+1.
            </p>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="btn-ghost px-5 py-2.5 text-sm inline-flex items-center gap-2">
                <ChevronLeft size={16} /> Atrás
              </button>
              <button
                disabled={!canConfirm || busy}
                onClick={confirm}
                className="btn-gold px-6 py-2.5 text-sm inline-flex items-center gap-2"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
                {busy ? "Reservando…" : "Confirmar cita"}
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: Confirmación */}
        {step === 4 && done && (
          <div className="animate-fade-up text-center max-w-xl mx-auto py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
              <PartyPopper size={28} className="text-emerald-300" />
            </div>
            <h3 className="font-display text-2xl sm:text-3xl mt-4">¡Cita registrada, {done.clientName.split(" ")[0]}!</h3>
            <p className="text-sm text-[#F5F2EB]/60 mt-2">
              <span className="text-[#E3C77F] font-semibold">{done.serviceName}</span> ·{" "}
              <span className="capitalize">{formatDateES(done.date)}</span> a las{" "}
              <span className="font-semibold">{done.time}</span>
            </p>
            <p className="text-xs text-white/40 mt-1">
              {SHOP.address} · Hemos descargado el .ics y avisado a la barbería.
            </p>

            <div className="grid sm:grid-cols-2 gap-2.5 mt-6 text-left">
              <a
                href={googleCalendarUrl({
                  serviceName: done.serviceName,
                  date: done.date,
                  time: done.time,
                  durationMin: service?.durationMin ?? 30,
                  clientName: done.clientName,
                })}
                target="_blank"
                rel="noreferrer"
                className="btn-gold px-4 py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                <CalendarPlus size={17} /> Añadir a Google Calendar
              </a>
              <button
                onClick={() =>
                  downloadICS({
                    serviceName: done.serviceName,
                    date: done.date,
                    time: done.time,
                    durationMin: service?.durationMin ?? 30,
                    clientName: done.clientName,
                  })
                }
                className="btn-ghost px-4 py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                <Download size={17} className="text-[#D4A94E]" /> Descargar .ics (Apple/Outlook)
              </button>
              <a
                href={adminWa}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 text-sm rounded-xl inline-flex items-center justify-center gap-2 bg-[#25D366] text-[#0b3d1f] font-semibold hover:brightness-110 transition"
              >
                <MessageCircle size={17} /> Confirmar por WhatsApp
              </a>
              <button
                onClick={reset}
                className="btn-ghost px-4 py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                <CalendarCheck size={17} /> Hacer otra reserva
              </button>
            </div>

            {waSent && (
              <p className="mt-4 text-xs text-emerald-300/80 inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Aviso enviado a la bandeja del administrador
              </p>
            )}

            <div className="mt-6 rounded-2xl border border-[#D4A94E]/25 bg-[#D4A94E]/5 p-4 text-sm">
              <p className="text-[#E3C77F] font-semibold">¿Sabías que cada corte suma un sello?</p>
              <p className="text-white/55 text-[0.85rem] mt-1">
                Entra al Portal de Miembros con tu WhatsApp <span className="font-mono">{done.clientPhone}</span> y
                acumula 8 sellos para un corte gratis.
              </p>
              <a href="/miembros" className="inline-block mt-2 text-[#E3C77F] underline underline-offset-4 text-[0.85rem]">
                Ir al Portal de Miembros →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
