"use client";
import { useCallback, useEffect, useState } from "react";
import {
  BookingDTO,
  BusinessHourDTO,
  DEFAULT_HOURS,
  ServiceDTO,
  SiteImageDTO,
} from "@/lib/constants";
import { LS_KEYS, readJSON, seedLocalIfEmpty, writeJSON } from "@/lib/store";

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return (j.data ?? j) as T;
  } catch {
    return null;
  }
}

export function useSiteData() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [hero, setHero] = useState<string>("");
  const [gallery, setGallery] = useState<SiteImageDTO[]>([]);
  const [hours, setHours] = useState<BusinessHourDTO[]>([]);
  const [closedDates, setClosedDates] = useState<{ id: number; date: string; reason: string }[]>([]);
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [adminPhone, setAdminPhone] = useState("34612345678");
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    seedLocalIfEmpty();

    // 1) Pintar al instante desde localStorage
    const lsServices = readJSON<ServiceDTO[]>(LS_KEYS.services, []);
    const lsHero = readJSON<string>(LS_KEYS.hero, "");
    const lsGallery = readJSON<SiteImageDTO[]>(LS_KEYS.gallery, []);
    const lsHours = readJSON<BusinessHourDTO[]>(LS_KEYS.hours, []);
    const lsBookings = readJSON<BookingDTO[]>(LS_KEYS.bookings, []);
    const lsClosed = readJSON<{ id: number; date: string; reason: string }[]>(LS_KEYS.closedDates, []);
    if (lsServices.length) setServices(lsServices);
    if (lsHero) setHero(lsHero);
    if (lsGallery.length) setGallery(lsGallery);
    if (lsHours.length) setHours(lsHours);
    else
      setHours(
        DEFAULT_HOURS.map((h, i) => ({ id: i + 1, ...h }))
      );
    if (lsClosed.length !== undefined) setClosedDates(lsClosed);
    setBookings(lsBookings);

    // 2) Intentar sincronizar con Postgres vía API
    try {
      let [apiServices, apiGallery, apiHours, apiClosed, apiBookings, apiSettings] =
        await Promise.all([
          getJSON<ServiceDTO[]>("/api/services"),
          getJSON<SiteImageDTO[]>("/api/gallery"),
          getJSON<BusinessHourDTO[]>("/api/hours"),
          getJSON<{ id: number; date: string; reason: string }[]>("/api/closed-dates"),
          getJSON<BookingDTO[]>("/api/bookings"),
          getJSON<Record<string, string>>("/api/settings"),
        ]);

      // Auto-seed: si la DB está vacía (primer arranque), poblar datos de prueba
      if (apiServices && apiServices.length === 0 && (!apiHours || apiHours.length === 0)) {
        try {
          await fetch("/api/seed", { method: "POST" });
          [apiServices, apiGallery, apiHours, apiClosed, apiBookings, apiSettings] =
            await Promise.all([
              getJSON<ServiceDTO[]>("/api/services"),
              getJSON<SiteImageDTO[]>("/api/gallery"),
              getJSON<BusinessHourDTO[]>("/api/hours"),
              getJSON<{ id: number; date: string; reason: string }[]>("/api/closed-dates"),
              getJSON<BookingDTO[]>("/api/bookings"),
              getJSON<Record<string, string>>("/api/settings"),
            ]);
        } catch {}
      }

      if (apiServices && apiServices.length) {
        setServices(apiServices);
        writeJSON(LS_KEYS.services, apiServices);
      }
      if (apiGallery && apiGallery.length) {
        const heroImg = apiGallery.find((g) => g.slot === "hero");
        const gal = apiGallery.filter((g) => g.slot === "gallery");
        if (heroImg) {
          setHero(heroImg.url);
          writeJSON(LS_KEYS.hero, heroImg.url);
        }
        if (gal.length) {
          setGallery(gal);
          writeJSON(LS_KEYS.gallery, gal);
        }
      }
      if (apiHours && apiHours.length) {
        setHours(apiHours);
        writeJSON(LS_KEYS.hours, apiHours);
      }
      if (apiClosed) {
        setClosedDates(apiClosed);
        writeJSON(LS_KEYS.closedDates, apiClosed);
      }
      if (apiBookings) {
        setBookings(apiBookings);
        writeJSON(LS_KEYS.bookings, apiBookings);
      }
      if (apiSettings?.admin_phone) setAdminPhone(apiSettings.admin_phone);
    } catch {
      // sin red/DB -> seguimos con localStorage
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => {
      // re-leer localStorage cuando el admin edita en otra pestaña/vista
      setServices(readJSON<ServiceDTO[]>(LS_KEYS.services, []));
      setHero(readJSON<string>(LS_KEYS.hero, ""));
      setGallery(readJSON<SiteImageDTO[]>(LS_KEYS.gallery, []));
      setHours(readJSON<BusinessHourDTO[]>(LS_KEYS.hours, []));
      setClosedDates(readJSON(LS_KEYS.closedDates, []));
      setBookings(readJSON<BookingDTO[]>(LS_KEYS.bookings, []));
    };
    window.addEventListener("navajas:update", onUpdate);
    const t = setInterval(refresh, 20000); // refresco suave cada 20s (bandeja casi en tiempo real)
    return () => {
      window.removeEventListener("navajas:update", onUpdate);
      clearInterval(t);
    };
  }, [refresh]);

  return {
    services: services.filter((s) => s.active),
    allServices: services,
    hero,
    gallery,
    hours,
    closedDates,
    bookings,
    adminPhone,
    loaded,
    refresh,
  };
}
