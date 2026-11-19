"use client";
// Store local (localStorage) que se sincroniza con la API/Postgres.
// Si la API falla, la web sigue funcionando con localStorage.

import {
  BusinessHourDTO,
  BookingDTO,
  DEFAULT_GALLERY,
  DEFAULT_HERO,
  DEFAULT_HOURS,
  DEFAULT_SERVICES,
  ServiceDTO,
  SiteImageDTO,
} from "./constants";

const K = {
  services: "navajas_services",
  hero: "navajas_hero",
  gallery: "navajas_gallery",
  hours: "navajas_hours",
  closedDates: "navajas_closed_dates",
  bookings: "navajas_bookings",
  adminPhone: "navajas_admin_phone",
};

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // avisar a otras pestañas / componentes
    window.dispatchEvent(new CustomEvent("navajas:update", { detail: { key } }));
  } catch {}
}

export function seedLocalIfEmpty() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(K.services)) {
    const services: ServiceDTO[] = DEFAULT_SERVICES.map((s, i) => ({
      ...s,
      id: i + 1,
    }));
    writeJSON(K.services, services);
  }
  if (!localStorage.getItem(K.hero)) {
    writeJSON(K.hero, DEFAULT_HERO);
  }
  if (!localStorage.getItem(K.gallery)) {
    const g: SiteImageDTO[] = DEFAULT_GALLERY.map((img, i) => ({
      id: i + 1,
      slot: "gallery",
      url: img.url,
      caption: img.caption,
      sortOrder: i,
    }));
    writeJSON(K.gallery, g);
  }
  if (!localStorage.getItem(K.hours)) {
    const h: BusinessHourDTO[] = DEFAULT_HOURS.map((hh, i) => ({ id: i + 1, ...hh }));
    writeJSON(K.hours, h);
  }
  if (!localStorage.getItem(K.closedDates)) {
    // ejemplo: cerrar un festivo próximo
    writeJSON(K.closedDates, [{ id: 1, date: nextSundayPlus(14), reason: "Festivo local" }]);
  }
  if (!localStorage.getItem(K.bookings)) {
    writeJSON(K.bookings, defaultBookings());
  }
}

function nextSundayPlus(extra: number): string {
  const d = new Date();
  d.setDate(d.getDate() + extra);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function defaultBookings(): BookingDTO[] {
  return [
    {
      id: 1,
      serviceId: 2,
      serviceName: "Degradado / Fade",
      price: 20,
      date: isoPlus(1),
      time: "11:00",
      clientName: "Javier Ruiz",
      clientPhone: "612345678",
      status: "pending",
      notes: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      serviceId: 3,
      serviceName: "Combo Corte + Barba",
      price: 30,
      date: isoPlus(1),
      time: "12:30",
      clientName: "Marco Polo",
      clientPhone: "655987321",
      status: "pending",
      notes: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      serviceId: 1,
      serviceName: "Corte de Cabello",
      price: 18,
      date: isoPlus(0),
      time: "18:00",
      clientName: "Carlos Ejemplo",
      clientPhone: "600123456",
      status: "pending",
      notes: "Cliente miembro (prueba 1234)",
      createdAt: new Date().toISOString(),
    },
  ];
}

export const LS_KEYS = K;
