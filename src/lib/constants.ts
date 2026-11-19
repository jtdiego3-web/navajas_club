export const SHOP = {
  name: "Navaja's Club",
  tagline: "Tradición y estilo desde el primer corte",
  address: "Av. Humboldt 1231, Edificio Humboldt",
  phoneAdmin: "34612345678", // WhatsApp del administrador (con código país, sin +)
  phoneDisplay: "+34 612 345 678",
  email: "hola@navajasclub.es",
  mapsUrl: "https://maps.app.goo.gl/6faVf6xhc3vKWSEX7",
};

// Credenciales de prueba para Admin (visibles para testear)
export const ADMIN_CREDENTIALS = {
  user: "admin",
  pin: "2024",
  hint: "Usuario: admin · PIN: 2024",
};

export const TEST_MEMBER = {
  phone: "600123456",
  code: "1234",
  name: "Carlos Ejemplo",
};

export type WeekdayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const WEEKDAY_NAMES: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};
export const WEEKDAY_SHORT: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};

export interface ServiceDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  active: boolean;
  sortOrder: number;
  icon: string;
}

export interface SiteImageDTO {
  id: number;
  slot: "hero" | "gallery";
  url: string;
  caption: string;
  sortOrder: number;
}

export interface BusinessHourDTO {
  id: number;
  weekday: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface BookingDTO {
  id: number;
  serviceId: number | null;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  status: "pending" | "completed" | "cancelled";
  notes: string;
  createdAt: string;
}

export interface MemberDTO {
  id: number;
  phone: string;
  name: string;
  stamps: number;
  totalCuts: number;
  freeCutAvailable: boolean;
  freeCutRedeemed: number;
}

export interface VisitDTO {
  id: number;
  memberId: number;
  memberPhone: string;
  date: string;
  time: string;
  serviceName: string;
  status: string;
  bookingId: number | null;
  createdAt: string;
}

// ---------- Seed por defecto (localStorage + DB) ----------
export const DEFAULT_SERVICES: Omit<ServiceDTO, "id">[] = [
  {
    name: "Corte de Cabello",
    description: "Tijera y máquina, perfilado detallado y acabado con toalla caliente.",
    price: 18,
    durationMin: 30,
    active: true,
    sortOrder: 0,
    icon: "scissors",
  },
  {
    name: "Degradado / Fade",
    description: "Fade quirúrgico (low, mid o high), contornos definidos y styling final.",
    price: 20,
    durationMin: 35,
    active: true,
    sortOrder: 1,
    icon: "zap",
  },
  {
    name: "Combo Corte + Barba",
    description: "El ritual completo Navaja's: corte, arreglo de barba y perfilado.",
    price: 30,
    durationMin: 55,
    active: true,
    sortOrder: 2,
    icon: "crown",
  },
  {
    name: "Arreglo de Barba",
    description: "Diseño, perfilado y acondicionado con aceites esenciales.",
    price: 12,
    durationMin: 20,
    active: true,
    sortOrder: 3,
    icon: "brush",
  },
];

export const DEFAULT_HERO =
  "https://images.pexels.com/photos/18090355/pexels-photo-18090355.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export const DEFAULT_GALLERY: { url: string; caption: string }[] = [
  {
    url: "https://images.pexels.com/photos/4625626/pexels-photo-4625626.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    caption: "Fade de precisión",
  },
  {
    url: "https://images.pexels.com/photos/13138476/pexels-photo-13138476.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Nuestro espacio de atención",
  },
  {
    url: "https://images.pexels.com/photos/12464841/pexels-photo-12464841.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    caption: "Acabado de precisión",
  },
  {
    url: "https://images.pexels.com/photos/4969838/pexels-photo-4969838.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Salón principal",
  },
  {
    url: "https://images.pexels.com/photos/18503633/pexels-photo-18503633.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    caption: "Detalle de contornos",
  },
  {
    url: "https://images.pexels.com/photos/20785318/pexels-photo-20785318.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Rincón vintage del club",
  },
];

export const DEFAULT_HOURS: { weekday: number; isOpen: boolean; openTime: string; closeTime: string }[] = [
  { weekday: 0, isOpen: false, openTime: "10:00", closeTime: "14:00" },
  { weekday: 1, isOpen: true, openTime: "10:00", closeTime: "20:00" },
  { weekday: 2, isOpen: true, openTime: "10:00", closeTime: "20:00" },
  { weekday: 3, isOpen: true, openTime: "10:00", closeTime: "20:00" },
  { weekday: 4, isOpen: true, openTime: "10:00", closeTime: "20:00" },
  { weekday: 5, isOpen: true, openTime: "10:00", closeTime: "21:00" },
  { weekday: 6, isOpen: true, openTime: "10:00", closeTime: "15:00" },
];

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

export function formatPrice(n: number): string {
  return `${Number(n).toFixed(0)}€`;
}

export function formatDateES(iso: string): string {
  // iso YYYY-MM-DD
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
}

export function weekdayOfISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

// Genera franjas cada X min entre apertura y cierre
export function buildSlots(openTime: string, closeTime: string, stepMin = 30): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const start = toMin(openTime);
  const end = toMin(closeTime);
  const slots: string[] = [];
  for (let t = start; t + stepMin <= end + 1; t += stepMin) {
    // la última cita debe empezar al menos 30 min antes del cierre
    if (t + stepMin > end && t !== end) {
      // permitir última hora exacta si cuadra
    }
    if (t >= end) break;
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return slots;
}
