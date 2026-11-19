import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Crown } from "lucide-react";
import Logo from "./Logo";
import { SHOP } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#101010] border-t border-[#D4A94E]/20">
      <div className="h-1 texture-stripes opacity-70" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size={54} />
          <p className="mt-4 text-sm text-[#F5F2EB]/60 max-w-sm leading-relaxed">
            Barbería clásica con alma moderna. Tijera, navaja y toalla caliente.
            Únete al club y cada 8 cortes, el 9º es gratis.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#D4A94E]/30 text-[#E3C77F] bg-[#D4A94E]/5">
            <Crown size={13} /> Programa 8+1 activo para miembros
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg text-[#E3C77F] mb-4">Contacto</h4>
          <ul className="space-y-3 text-sm text-[#F5F2EB]/70">
            <li className="flex gap-2.5"><MapPin size={16} className="text-[#8B5E3C] shrink-0 mt-0.5" />{SHOP.address}</li>
            <li>
              <a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#E3C77F] hover:underline underline-offset-4 text-[0.83rem]">
                <MapPin size={13} /> Ver ubicación en Google Maps
              </a>
            </li>
            <li className="flex gap-2.5"><Phone size={16} className="text-[#8B5E3C] shrink-0 mt-0.5" />{SHOP.phoneDisplay}</li>
            <li className="flex gap-2.5"><Mail size={16} className="text-[#8B5E3C] shrink-0 mt-0.5" />{SHOP.email}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg text-[#E3C77F] mb-4">Explora</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/#servicios" className="text-[#F5F2EB]/70 hover:text-[#E3C77F]">Servicios y precios</Link></li>
            <li><Link href="/#galeria" className="text-[#F5F2EB]/70 hover:text-[#E3C77F]">Galería</Link></li>
            <li><Link href="/#reservar" className="text-[#F5F2EB]/70 hover:text-[#E3C77F]">Reservar cita</Link></li>
            <li><Link href="/miembros" className="text-[#F5F2EB]/70 hover:text-[#E3C77F]">Portal de Miembros</Link></li>
            <li><Link href="/admin" className="text-[#F5F2EB]/30 hover:text-[#D4A94E] text-xs inline-flex items-center gap-1.5"><Clock size={12}/> Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-[#F5F2EB]/35 px-4">
        © {new Date().getFullYear()} {SHOP.name} · Todos los derechos reservados · Hecho con navaja y código
      </div>
    </footer>
  );
}
