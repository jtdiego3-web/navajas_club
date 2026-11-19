"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  Crown,
  MapPin,
  Phone,
  Star,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import SectionHeading from "../SectionHeading";
import ServiceIcon from "../ServiceIcon";
import BookingWizard from "../booking/BookingWizard";
import { useSiteData } from "@/hooks/useSiteData";
import { SHOP, WEEKDAY_NAMES, formatDateES, formatPrice, todayISO, weekdayOfISO } from "@/lib/constants";

export default function HomeClient() {
  const { services, hero, gallery, hours, closedDates, adminPhone, loaded, refresh } = useSiteData();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const todayWd = weekdayOfISO(todayISO());
  const todayHours = hours.find((h) => h.weekday === todayWd);
  const isClosedToday =
    !todayHours?.isOpen || closedDates.some((c) => c.date === todayISO());
  const openDays = hours.filter((h) => h.isOpen);

  return (
    <div className="min-h-screen bg-[#1A1A1A] texture-leather">
      <Header />

      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex items-end sm:items-center overflow-hidden">
        {/* Fondo */}
        <div className="absolute inset-0">
          {hero ? (
            <Image
              src={hero}
              alt="Navaja's Club barbería"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-[#2B2B2B] animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/72 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/85 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14 pt-36 sm:py-40 w-full">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur border border-[#D4A94E]/40 text-xs tracking-wide">
              <span className={`w-2 h-2 rounded-full ${isClosedToday ? "bg-red-400" : "bg-emerald-400 animate-pulse"}`} />
              {loaded ? (
                isClosedToday ? (
                  <span className="text-[#F5F2EB]/85">Hoy cerrado · Te esperamos pronto</span>
                ) : (
                  <span className="text-[#F5F2EB]/85">
                    Hoy abierto · {todayHours?.openTime}–{todayHours?.closeTime}
                  </span>
                )
              ) : (
                <span className="text-[#F5F2EB]/60">Consultando horario…</span>
              )}
            </div>

            <p className="mt-5 text-[0.72rem] tracking-[0.4em] uppercase text-[#D4A94E] font-medium">
              Barbería · Av. Humboldt
            </p>
            <h1 className="font-display text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl mt-2 text-[#F5F2EB] drop-shadow-2xl">
              El club donde el
              <span className="block italic text-[#E3C77F]">estilo es tradición</span>
            </h1>
            <p className="mt-5 text-[#F5F2EB]/75 text-base sm:text-lg max-w-xl leading-relaxed">
              Cortes de precisión, degradados quirúrgicos y arreglo de barba con toalla
              caliente. Reserva en 30 segundos y acumula sellos 8+1.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="#reservar"
                className="btn-gold px-7 py-3.5 text-[0.95rem] inline-flex items-center justify-center gap-2"
              >
                <CalendarCheck size={18} /> Reservar Cita
              </Link>
              <Link
                href="/miembros"
                className="btn-ghost px-7 py-3.5 text-[0.95rem] inline-flex items-center justify-center gap-2 bg-black/30 backdrop-blur"
              >
                <Crown size={18} className="text-[#D4A94E]" /> Soy Miembro 8+1
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#F5F2EB]/60">
              <span className="inline-flex items-center gap-1.5">
                <Star size={15} className="text-[#D4A94E] fill-[#D4A94E]" /> 4.9 · +800 reseñas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={15} className="text-[#D4A94E]" /> Confirmación por WhatsApp
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} className="text-[#D4A94E]" /> Sin esperas
              </span>
            </div>
          </div>
        </div>

        {/* Marquesina inferior */}
        <div className="absolute bottom-0 inset-x-0 z-10">
          <div className="h-1 texture-stripes" />
          <div className="bg-black/60 backdrop-blur border-t border-[#D4A94E]/20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-6 text-[0.78rem] tracking-[0.2em] uppercase text-[#E3C77F]/80 whitespace-nowrap overflow-x-auto scrollbar-thin">
              <span>Corte de cabello</span><span className="text-white/20">✦</span>
              <span>Degradado</span><span className="text-white/20">✦</span>
              <span>Combo corte + barba</span><span className="text-white/20">✦</span>
              <span>Barba</span><span className="text-white/20">✦</span>
              <span>Toalla caliente</span><span className="text-white/20">✦</span>
              <span>Club 8+1</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICIOS ============ */}
      <section id="servicios" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <SectionHeading
          kicker="Carta de servicios"
          title="Servicios y Precios"
          sub="Precios claros, sin sorpresas. Todo servicio incluye diagnóstico de estilo, acabado y styling final."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="vintage-card rounded-2xl p-6 hover:-translate-y-1 transition-transform group"
            >
              <div className="flex items-start justify-between">
                <span className="w-12 h-12 rounded-2xl bg-[#D4A94E]/10 border border-[#D4A94E]/25 flex items-center justify-center group-hover:bg-[#D4A94E]/20 transition-colors">
                  <ServiceIcon icon={s.icon} size={24} />
                </span>
                <span className="font-display text-3xl text-[#E3C77F]">{formatPrice(s.price)}</span>
              </div>
              <h3 className="font-display text-xl mt-4">{s.name}</h3>
              <p className="text-sm text-[#F5F2EB]/55 mt-1.5 leading-relaxed min-h-[3.2rem]">
                {s.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
                <span className="text-xs text-[#F5F2EB]/45 inline-flex items-center gap-1.5">
                  <Clock size={13} /> {s.durationMin} min
                </span>
                <Link
                  href="#reservar"
                  className="text-sm text-[#E3C77F] hover:underline underline-offset-4"
                >
                  Reservar →
                </Link>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="col-span-full text-center text-white/40 py-10">
              Cargando carta de servicios…
            </div>
          )}
        </div>

        {/* Banner fidelización */}
        <div className="mt-10 rounded-3xl overflow-hidden border border-[#D4A94E]/30 bg-gradient-to-r from-[#2A1F14] via-[#3a2a1a] to-[#2A1F14] p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-5">
          <span className="w-14 h-14 rounded-2xl bg-[#D4A94E] flex items-center justify-center shrink-0 shadow-[0_10px_30px_-8px_rgba(212,169,78,0.8)]">
            <Crown size={26} className="text-[#1A140E]" />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-xl sm:text-2xl text-[#F5F2EB]">
              Club 8+1: cada 8 cortes, el siguiente es <span className="text-[#E3C77F] italic">gratis</span>
            </h3>
            <p className="text-sm text-[#F5F2EB]/60 mt-1">
              Sin tarjetas que perder. Tu número de WhatsApp es tu tarjeta de sellos.
            </p>
          </div>
          <Link href="/miembros" className="btn-gold px-6 py-3 text-sm text-center shrink-0">
            Ver mi tarjeta
          </Link>
        </div>
      </section>

      {/* ============ GALERÍA ============ */}
      <section id="galeria" className="scroll-mt-24 bg-[#141414] border-y border-[#D4A94E]/15 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading
            kicker="El club en imágenes"
            title="Galería"
            sub="Nuestros cortes, la estética de nuestro espacio y la atención personalizada del club."
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {gallery.map((g, i) => (
              <button
                key={g.id}
                onClick={() => setLightbox(i)}
                className={`relative overflow-hidden rounded-2xl group border border-white/8 ${
                  i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2 min-h-[220px] lg:min-h-[420px]" : "min-h-[160px] sm:min-h-[200px]"
                }`}
              >
                <Image
                  src={g.url}
                  alt={g.caption || `Galería ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <p className="absolute bottom-3 left-3 right-3 text-left text-xs sm:text-sm font-medium text-[#F5F2EB]">
                  {g.caption}
                </p>
              </button>
            ))}
            {gallery.length === 0 && (
              <div className="col-span-full text-center text-white/40 py-10">Cargando galería…</div>
            )}
          </div>
        </div>
      </section>

      {/* ============ RESERVA ============ */}
      <section id="reservar" className="scroll-mt-24 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <SectionHeading
          kicker="Reserva online"
          title="Pide tu cita en 3 pasos"
          sub="Elige servicio, fecha y hora. Recibirás el .ics para tu calendario y confirmación por WhatsApp."
        />
        <BookingWizard
          services={services}
          hours={hours}
          closedDates={closedDates}
          adminPhone={adminPhone}
          onBooked={refresh}
        />
      </section>

      {/* ============ HORARIOS + UBICACIÓN ============ */}
      <section id="horarios" className="scroll-mt-24 bg-[#141414] border-t border-[#D4A94E]/15 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading
            kicker="Visítanos"
            title="Horarios y Ubicación"
            sub="Horario actualizado en tiempo real desde la gestión de la barbería."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Horarios */}
            <div className="vintage-card rounded-3xl p-6 sm:p-8">
              <h3 className="font-display text-xl flex items-center gap-2">
                <Clock size={20} className="text-[#D4A94E]" /> Apertura semanal
              </h3>
              <div className="mt-5 space-y-1">
                {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
                  const h = hours.find((x) => x.weekday === wd);
                  const isToday = wd === todayWd;
                  const open = h?.isOpen;
                  return (
                    <div
                      key={wd}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm ${
                        isToday ? "bg-[#D4A94E]/12 border border-[#D4A94E]/30" : "border border-transparent"
                      }`}
                    >
                      <span className={`font-medium ${isToday ? "text-[#E3C77F]" : "text-[#F5F2EB]/80"}`}>
                        {WEEKDAY_NAMES[wd]}
                        {isToday && <span className="ml-2 text-[0.65rem] px-2 py-0.5 rounded-full bg-[#D4A94E] text-[#1A140E] font-bold">HOY</span>}
                      </span>
                      <span className={open ? "text-[#F5F2EB]/75" : "text-red-300/70"}>
                        {open ? `${h?.openTime} – ${h?.closeTime}` : "Cerrado"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {closedDates.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/8">
                  <p className="text-xs tracking-[0.2em] uppercase text-[#F5F2EB]/40 mb-2">Próximos cierres</p>
                  <div className="flex flex-wrap gap-2">
                    {closedDates.slice(0, 5).map((c) => (
                      <span key={c.id} className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 border border-red-400/25 text-red-200 capitalize">
                        {formatDateES(c.date)}{c.reason ? ` · ${c.reason}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs text-white/35">
                {openDays.length} días abiertos a la semana · Última cita 30 min antes del cierre
              </p>
            </div>

            {/* Ubicación */}
            <div className="flex flex-col gap-5">
              <div className="vintage-card rounded-3xl p-6 sm:p-8 flex-1">
                <h3 className="font-display text-xl flex items-center gap-2">
                  <MapPin size={20} className="text-[#D4A94E]" /> Encuéntranos
                </h3>
                <p className="mt-3 text-[#F5F2EB]/80">{SHOP.address}</p>
                <p className="text-sm text-[#F5F2EB]/50 mt-1">Edificio Humboldt · Fácil acceso y estacionamiento cercano</p>
                <div className="mt-5 grid sm:grid-cols-2 gap-2.5">
                  <a
                    href={SHOP.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-gold px-4 py-3 text-sm text-center"
                  >
                    Ver ubicación en Google Maps
                  </a>
                  <a
                    href={`tel:${adminPhone}`}
                    className="btn-ghost px-4 py-3 text-sm text-center inline-flex items-center justify-center gap-2"
                  >
                    <Phone size={15} className="text-[#D4A94E]" /> {SHOP.phoneDisplay}
                  </a>
                </div>
                {/* Mapa embebido */}
                <div className="mt-5 rounded-2xl overflow-hidden border border-white/10 h-[220px] relative bg-[#0e0e0e]">
                  <iframe
                    title="Mapa Navaja's Club"
                    src="https://www.google.com/maps?q=Av.+Humboldt+1231,+Edificio+Humboldt&output=embed"
                    className="w-full h-full grayscale-[35%] contrast-[1.05]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Lightbox */}
      {lightbox !== null && gallery[lightbox] && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20">
            <X size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + gallery.length) % gallery.length); }}
            className="absolute left-3 p-2.5 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="relative w-full max-w-3xl aspect-[4/3] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Image src={gallery[lightbox].url} alt={gallery[lightbox].caption} fill className="object-contain bg-black" />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % gallery.length); }}
            className="absolute right-3 p-2.5 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ChevronRight size={20} />
          </button>
          <p className="absolute bottom-6 text-sm text-white/70">{gallery[lightbox].caption}</p>
        </div>
      )}
    </div>
  );
}
