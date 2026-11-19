import { SHOP } from "./constants";

function toGoogleDate(dateISO: string, timeHM: string): string {
  // dateISO YYYY-MM-DD, time HM
  const [y, mo, d] = dateISO.split("-");
  const [h, mi] = timeHM.split(":");
  return `${y}${mo}${d}T${h}${mi}00`;
}

function addMinutes(timeHM: string, mins: number): string {
  const [h, m] = timeHM.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function googleCalendarUrl(opts: {
  serviceName: string;
  date: string;
  time: string;
  durationMin?: number;
  clientName?: string;
}): string {
  const { serviceName, date, time, durationMin = 30, clientName = "" } = opts;
  const start = toGoogleDate(date, time);
  const end = toGoogleDate(date, addMinutes(time, durationMin));
  const title = encodeURIComponent(`Cita Navaja's Club — ${serviceName}`);
  const details = encodeURIComponent(
    `Reserva de ${clientName || "cliente"} en Navaja's Club.\nServicio: ${serviceName}\nFecha: ${date} ${time}\nDirección: ${SHOP.address}`
  );
  const location = encodeURIComponent(SHOP.address);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export function icsContent(opts: {
  serviceName: string;
  date: string;
  time: string;
  durationMin?: number;
  clientName?: string;
}): string {
  const { serviceName, date, time, durationMin = 30, clientName = "" } = opts;
  const start = toGoogleDate(date, time);
  const end = toGoogleDate(date, addMinutes(time, durationMin));
  const uid = `navajas-${date.replaceAll("-", "")}-${time.replace(":", "")}-${Math.floor(
    Math.random() * 100000
  )}@navajasclub.es`;
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NavajasClub//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Cita Navaja's Club — ${serviceName}`,
    `DESCRIPTION:Reserva de ${clientName} en Navaja's Club. Servicio: ${serviceName}. Fecha: ${date} ${time}.`,
    `LOCATION:${SHOP.address}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Tu cita en Navaja's Club es en 2 horas",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadICS(opts: {
  serviceName: string;
  date: string;
  time: string;
  durationMin?: number;
  clientName?: string;
}) {
  const content = icsContent(opts);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cita-navajas-club-${opts.date}-${opts.time.replace(":", "")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
