"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Crown, Menu, X, Lock } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { href: "/#servicios", label: "Servicios y Precios" },
  { href: "/#galeria", label: "Galería" },
  { href: "/#horarios", label: "Horarios y Ubicación" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#D4A94E]/20 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)]"
          : "bg-gradient-to-b from-black/70 to-transparent"
      }`}
    >
      {/* Filete barber superior */}
      <div className="h-1 texture-stripes opacity-80" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[68px]">
          <Logo size={46} />

          {/* Links centrales - desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[0.92rem] tracking-wide text-[#F5F2EB]/85 hover:text-[#E3C77F] transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[#D4A94E] hover:after:w-full after:transition-all"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Acciones derecha */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href="/#reservar"
              className="btn-gold inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <CalendarCheck size={16} />
              Reservar Cita
            </Link>
            <Link
              href="/miembros"
              className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm text-[#F5F2EB]"
            >
              <Crown size={16} className="text-[#D4A94E]" />
              Miembros
            </Link>
            <Link
              href="/admin"
              title="Acceso administración"
              className="ml-1 p-2 rounded-lg text-[#F5F2EB]/30 hover:text-[#D4A94E] hover:bg-white/5 transition-colors"
            >
              <Lock size={15} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg text-[#F5F2EB] hover:bg-white/10"
            aria-label="Menú"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className="lg:hidden bg-[#141414]/98 backdrop-blur-md border-t border-[#D4A94E]/15 px-4 pb-6 pt-3 space-y-1 animate-fade-up">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-3 py-3 rounded-xl text-[#F5F2EB]/90 hover:bg-white/5 hover:text-[#E3C77F] font-medium"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2.5 pt-3">
            <Link href="/#reservar" className="btn-gold inline-flex items-center justify-center gap-2 px-4 py-3">
              <CalendarCheck size={17} /> Reservar Cita
            </Link>
            <Link
              href="/miembros"
              className="btn-ghost inline-flex items-center justify-center gap-2 px-4 py-3 text-[#F5F2EB]"
            >
              <Crown size={17} className="text-[#D4A94E]" /> Portal de Miembros 8+1
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs text-[#F5F2EB]/30"
            >
              <Lock size={12} /> Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
