import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800", "900"],
});

const body = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Navaja's Club — Barbería | Reservas, Miembros 8+1",
  description:
    "Barbería Navaja's Club en Av. Humboldt 1231, Edificio Humboldt. Reserva tu cita online, únete al club de fidelización 8+1 y disfruta del ritual del barbero clásico.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="bg-[#1A1A1A] text-[#F5F2EB] antialiased min-h-screen">{children}</body>
    </html>
  );
}
