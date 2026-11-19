"use client";
import { useState } from "react";
import {
  Crown,
  Phone,
  ShieldCheck,
  Loader2,
  Scissors,
  Gift,
  History,
  LogOut,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TEST_MEMBER, formatDateES } from "@/lib/constants";

interface MemberData {
  member: {
    id: number;
    phone: string;
    name: string;
    stamps: number;
    totalCuts: number;
    freeCutAvailable: boolean;
    freeCutRedeemed: number;
  };
  visits: {
    id: number;
    date: string;
    time: string;
    serviceName: string;
    status: string;
  }[];
  progress: { stamps: number; needed: number; remaining: number; freeCut: boolean };
}

export default function MiembrosPage() {
  const [stage, setStage] = useState<"phone" | "code" | "card">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [simCode, setSimCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<MemberData | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  async function requestCode(prefill?: string) {
    const p = (prefill ?? phone).replace(/\D/g, "");
    if (p.length < 9) {
      setError("Introduce un número de WhatsApp válido (9 dígitos).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/members/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p, name }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "No se pudo enviar el código");
      setPhone(j.data.phone);
      setSimCode(j.data.code);
      setStage("code");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al solicitar código");
    } finally {
      setBusy(false);
    }
  }

  async function verify(prefillCode?: string) {
    const c = (prefillCode ?? code).trim();
    if (c.length !== 4) {
      setError("El código tiene 4 dígitos.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/members/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: c }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Código incorrecto");
      setData(j.data);
      setStage("card");
      localStorage.setItem("navajas_member_phone", phone);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Código incorrecto");
    } finally {
      setBusy(false);
    }
  }

  async function redeem() {
    if (!data) return;
    if (!confirm("¿Canjear tu corte GRATIS ahora? El contador volverá a 0.")) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/members/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "No se pudo canjear");
      // refrescar
      const v = await fetch("/api/members/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: code || TEST_MEMBER.code }),
      });
      // Si el código ya no es el de prueba, re-solicitar verificación silenciosa:
      if (v.ok) {
        const jj = await v.json();
        if (jj.ok) setData(jj.data);
        else {
          setData({
            ...data,
            member: j.data,
            progress: { stamps: 0, needed: 8, remaining: 8, freeCut: false },
          });
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al canjear");
    } finally {
      setRedeeming(false);
    }
  }

  function logout() {
    setStage("phone");
    setPhone("");
    setCode("");
    setSimCode(null);
    setData(null);
    localStorage.removeItem("navajas_member_phone");
  }

  function testLogin() {
    setPhone(TEST_MEMBER.phone);
    setName(TEST_MEMBER.name);
    requestCode(TEST_MEMBER.phone);
  }

  const stamps = data?.member.stamps ?? 0;
  const freeCut = data?.member.freeCutAvailable ?? false;

  return (
    <div className="min-h-screen bg-[#1A1A1A] texture-leather flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          {/* Cabecera */}
          <div className="text-center mb-8">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-[#D4A94E] items-center justify-center shadow-[0_10px_30px_-8px_rgba(212,169,78,0.8)]">
              <Crown size={26} className="text-[#1A140E]" />
            </span>
            <p className="mt-4 text-[0.72rem] tracking-[0.35em] uppercase text-[#D4A94E]">Club de fidelización</p>
            <h1 className="font-display text-3xl sm:text-4xl mt-1">Portal de Miembros</h1>
            <p className="text-sm text-white/55 mt-2">
              8 cortes = 1 gratis · Tu WhatsApp es tu tarjeta
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {/* ETAPA 1: teléfono */}
          {stage === "phone" && (
            <div className="vintage-card rounded-3xl p-6 sm:p-8 animate-fade-up">
              <h2 className="font-display text-xl">Accede con tu WhatsApp</h2>
              <p className="text-sm text-white/50 mt-1 mb-5">
                Te enviaremos un código de 4 dígitos para verificarte.
              </p>
              <label className="block text-sm mb-1.5 text-white/75">
                <Phone size={14} className="inline mr-1.5 -mt-0.5 text-[#D4A94E]" />
                Número de WhatsApp
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 600123456"
                inputMode="tel"
                className="input-dark mb-3"
              />
              <label className="block text-sm mb-1.5 text-white/75">Nombre (solo primera vez)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="input-dark mb-5"
              />
              <button
                onClick={() => requestCode()}
                disabled={busy}
                className="btn-gold w-full py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {busy ? "Enviando…" : "Solicitar código"}
              </button>

              {/* Acceso demo */}
              <div className="mt-5 rounded-2xl border border-dashed border-[#D4A94E]/40 bg-[#D4A94E]/5 p-4 text-sm">
                <p className="text-[#E3C77F] font-semibold text-[0.85rem]">🧪 Acceso de prueba</p>
                <p className="text-white/55 text-[0.82rem] mt-1">
                  Cliente ejemplo: <span className="font-mono text-white/80">{TEST_MEMBER.phone}</span> · código{" "}
                  <span className="font-mono text-white/80">{TEST_MEMBER.code}</span> · Otro miembro casi completo:{" "}
                  <span className="font-mono text-white/80">612345678</span> (solicita código y mira el simulador)
                </p>
                <button
                  onClick={testLogin}
                  disabled={busy}
                  className="mt-3 w-full btn-ghost py-2.5 text-[0.85rem] text-[#E3C77F]"
                >
                  Entrar como cliente de ejemplo
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: código */}
          {stage === "code" && (
            <div className="vintage-card rounded-3xl p-6 sm:p-8 animate-fade-up text-center">
              <h2 className="font-display text-xl">Introduce el código</h2>
              <p className="text-sm text-white/50 mt-1">
                Enviado al <span className="font-mono text-white/80">{phone}</span>
              </p>

              {/* SIMULADOR OTP */}
              {simCode && (
                <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                  <p className="text-[0.7rem] tracking-[0.25em] uppercase text-emerald-300/80">
                    📲 Simulador WhatsApp (demo)
                  </p>
                  <p className="font-mono text-3xl tracking-[0.4em] text-emerald-200 mt-1 font-bold">
                    {simCode}
                  </p>
                  <p className="text-xs text-emerald-200/60 mt-1">
                    En producción este código llegaría por WhatsApp vía /api/whatsapp
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-2.5 mt-6">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    value={code[i] ?? ""}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      const arr = code.split("");
                      arr[i] = v;
                      const next = arr.join("").slice(0, 4);
                      setCode(next);
                      if (v && i < 3) {
                        const el = document.getElementById(`otp-${i + 1}`);
                        el?.focus();
                      }
                      if (next.length === 4) verify(next);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !code[i] && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus();
                      }
                    }}
                    id={`otp-${i}`}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-2xl bg-[#141414] border border-white/15 focus:border-[#D4A94E] outline-none"
                  />
                ))}
              </div>

              <button
                onClick={() => verify()}
                disabled={busy || code.length !== 4}
                className="btn-gold w-full py-3 text-sm mt-6 inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                Verificar y entrar
              </button>
              <div className="flex justify-between mt-3 text-sm">
                <button onClick={() => setStage("phone")} className="text-white/50 hover:text-white">
                  ← Cambiar número
                </button>
                <button onClick={() => requestCode()} className="text-[#E3C77F] hover:underline">
                  Reenviar código
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: tarjeta */}
          {stage === "card" && data && (
            <div className="space-y-5 animate-fade-up">
              {/* Banner corte gratis */}
              {freeCut && (
                <div className="rounded-3xl overflow-hidden border border-[#D4A94E] bg-gradient-to-r from-[#9a7023] via-[#d4a94e] to-[#9a7023] p-[1.5px] animate-stamp-pop">
                  <div className="rounded-3xl bg-[#1c1509] px-6 py-5 text-center">
                    <Gift size={30} className="mx-auto text-[#E3C77F]" />
                    <p className="font-display text-2xl mt-2 text-[#F5F2EB]">
                      ¡Tienes 1 Corte Gratis disponible!
                    </p>
                    <p className="text-sm text-white/60 mt-1">
                      Muestra esta pantalla en la barbería o canjéalo aquí.
                    </p>
                    <button
                      onClick={redeem}
                      disabled={redeeming}
                      className="btn-gold px-6 py-2.5 text-sm mt-4 inline-flex items-center gap-2"
                    >
                      {redeeming ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                      {redeeming ? "Canjeando…" : "Canjear corte gratis"}
                    </button>
                  </div>
                </div>
              )}

              {/* Tarjeta de sellos */}
              <div className="vintage-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 texture-stripes opacity-60" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.68rem] tracking-[0.3em] uppercase text-[#D4A94E]">Navaja&rsquo;s Club · 8+1</p>
                    <h2 className="font-display text-2xl mt-1">
                      {data.member.name || "Miembro del Club"}
                    </h2>
                    <p className="font-mono text-sm text-white/50">{data.member.phone}</p>
                  </div>
                  <span className="w-12 h-12 rounded-2xl bg-[#D4A94E]/12 border border-[#D4A94E]/30 flex items-center justify-center">
                    <Scissors size={22} className="text-[#D4A94E]" />
                  </span>
                </div>

                {/* Progreso */}
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-white/55">
                    Progreso: <span className="text-[#E3C77F] font-bold">{stamps}/8</span>
                  </span>
                  <span className="text-white/55">
                    {freeCut ? "¡Completo!" : `Te faltan ${8 - stamps}`}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-black/50 border border-white/10 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#9a7023] to-[#E3C77F] transition-all duration-700"
                    style={{ width: `${(stamps / 8) * 100}%` }}
                  />
                </div>

                {/* 8 sellos */}
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mt-5">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const full = i < stamps;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 ${
                          full ? "stamp-full animate-stamp-pop" : "stamp-empty bg-black/20"
                        }`}
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        <Scissors size={20} className={full ? "text-[#1A140E]" : "text-white/20"} />
                        <span className={`text-[0.62rem] font-bold ${full ? "text-[#1A140E]" : "text-white/25"}`}>
                          {i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2.5 mt-5 text-center">
                  <div className="rounded-xl bg-black/30 border border-white/8 py-2.5">
                    <p className="font-display text-xl text-[#E3C77F]">{data.member.totalCuts}</p>
                    <p className="text-[0.68rem] text-white/45 uppercase tracking-wider">Cortes totales</p>
                  </div>
                  <div className="rounded-xl bg-black/30 border border-white/8 py-2.5">
                    <p className="font-display text-xl text-[#E3C77F]">{data.member.freeCutRedeemed}</p>
                    <p className="text-[0.68rem] text-white/45 uppercase tracking-wider">Gratis canjeados</p>
                  </div>
                  <div className="rounded-xl bg-black/30 border border-white/8 py-2.5">
                    <p className="font-display text-xl text-[#E3C77F]">{8 - stamps}</p>
                    <p className="text-[0.68rem] text-white/45 uppercase tracking-wider">Para premio</p>
                  </div>
                </div>
              </div>

              {/* Historial */}
              <div className="vintage-card rounded-3xl p-6 sm:p-8">
                <h3 className="font-display text-xl flex items-center gap-2">
                  <History size={19} className="text-[#D4A94E]" /> Historial de cortes
                </h3>
                {data.visits.length === 0 && (
                  <p className="text-sm text-white/45 mt-3">
                    Aún no tienes visitas registradas. Reserva tu primera cita y empieza a sellar.
                  </p>
                )}
                <div className="mt-4 space-y-2.5 max-h-[340px] overflow-y-auto scrollbar-thin pr-1">
                  {data.visits.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/30 border border-white/8"
                    >
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          v.status === "free"
                            ? "bg-[#D4A94E]/25 border border-[#D4A94E]/40"
                            : "bg-emerald-500/10 border border-emerald-400/25"
                        }`}
                      >
                        {v.status === "free" ? (
                          <Gift size={18} className="text-[#E3C77F]" />
                        ) : (
                          <Scissors size={17} className="text-emerald-300" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.serviceName}</p>
                        <p className="text-xs text-white/45 capitalize">
                          {formatDateES(v.date)}{v.time ? ` · ${v.time}` : ""}
                        </p>
                      </div>
                      <span
                        className={`text-[0.68rem] px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                          v.status === "free"
                            ? "bg-[#D4A94E]/20 text-[#E3C77F]"
                            : "bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        {v.status === "free" ? "GRATIS" : "COMPLETADO"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
                  <a href="/#reservar" className="btn-gold flex-1 py-2.5 text-sm text-center">
                    Reservar próxima cita
                  </a>
                  <button
                    onClick={logout}
                    className="btn-ghost px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2"
                  >
                    <LogOut size={15} /> Salir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
