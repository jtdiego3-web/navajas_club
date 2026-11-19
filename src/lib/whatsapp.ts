import { SHOP } from "./constants";

export function waLink(phoneDigits: string, message: string): string {
  const digits = phoneDigits.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function bookingMessageToAdmin(opts: {
  serviceName: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  price?: number;
}): string {
  return (
    `✂️ *NUEVA RESERVA — Navaja's Club*\n` +
    `———————————\n` +
    `👤 Cliente: ${opts.clientName}\n` +
    `📱 Tel: ${opts.clientPhone}\n` +
    `💈 Servicio: ${opts.serviceName}${opts.price ? ` (${opts.price}€)` : ""}\n` +
    `📅 Fecha: ${opts.date}\n` +
    `⏰ Hora: ${opts.time}\n` +
    `📍 ${SHOP.address}\n` +
    `———————————\n` +
    `Confirma la cita respondiendo a este mensaje.`
  );
}

export function bookingConfirmToClient(opts: {
  serviceName: string;
  date: string;
  time: string;
  clientName: string;
}): string {
  return (
    `Hola ${opts.clientName}, tu cita en *Navaja's Club* está pre-registrada:\n` +
    `💈 ${opts.serviceName} · 📅 ${opts.date} ${opts.time}\n` +
    `📍 ${SHOP.address}\n` +
    `Te esperamos. ¡Gracias por confiar en el Club!`
  );
}

export function adminToClientMessage(opts: {
  clientName: string;
  date: string;
  time: string;
  serviceName: string;
}): string {
  return (
    `Hola ${opts.clientName}, soy de *Navaja's Club* 💈\n` +
    `Te escribo sobre tu cita: ${opts.serviceName} el ${opts.date} a las ${opts.time}.\n` +
    `¿Confirmas tu asistencia?`
  );
}
