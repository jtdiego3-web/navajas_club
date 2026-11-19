"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  CalendarDays,
  Image as ImageIcon,
  Scissors,
  Clock,
  LogOut,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Save,
  Loader2,
  RefreshCw,
  Eye,
  Phone,
  ChevronLeft,
  Settings2,
} from "lucide-react";
import Logo from "@/components/Logo";
import ServiceIcon from "@/components/ServiceIcon";
import {
  ADMIN_CREDENTIALS,
  BookingDTO,
  BusinessHourDTO,
  ServiceDTO,
  SiteImageDTO,
  WEEKDAY_NAMES,
  formatDateES,
  formatPrice,
} from "@/lib/constants";
import { LS_KEYS, readJSON, writeJSON } from "@/lib/store";
import { adminToClientMessage, waLink } from "@/lib/whatsapp";

type Tab = "bookings" | "services" | "images" | "hours" | "settings";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("bookings");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("navajas_admin") === "1") {
      setAuthed(true);
    }
  }, []);

  function login() {
    // CREDENCIALES DE PRUEBA: admin / 2024 (visibles para testear)
    if (user.trim() === ADMIN_CREDENTIALS.user && pin.trim() === ADMIN_CREDENTIALS.pin) {
      sessionStorage.setItem("navajas_admin", "1");
      setAuthed(true);
      setLoginError("");
    } else {
      setLoginError("Credenciales incorrectas. Prueba con admin / 2024.");
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#101010] texture-leather flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="flex justify-center"><Logo size={72} withText={false} /></div>
            <h1 className="font-display text-2xl mt-3">Panel de Administración</h1>
            <p className="text-sm text-white/50">Acceso exclusivo · Navaja&rsquo;s Club</p>
          </div>
          <div className="vintage-card rounded-3xl p-6 sm:p-8">
            <label className="block text-sm mb-1.5 text-white/70">Usuario</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" className="input-dark mb-3" onKeyDown={(e) => e.key === "Enter" && login()} />
            <label className="block text-sm mb-1.5 text-white/70">PIN / Contraseña</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" type="password" inputMode="numeric" className="input-dark mb-4" onKeyDown={(e) => e.key === "Enter" && login()} />
            {loginError && <p className="text-xs text-red-300 mb-3">{loginError}</p>}
            <button onClick={login} className="btn-gold w-full py-3 text-sm inline-flex items-center justify-center gap-2">
              <Lock size={15} /> Entrar al panel
            </button>
            {/* Credenciales visibles para testear, como pide el encargo */}
            <div className="mt-4 rounded-xl border border-dashed border-[#D4A94E]/40 bg-[#D4A94E]/5 p-3 text-xs text-white/60 text-center">
              🧪 Credenciales de prueba — <span className="font-mono text-[#E3C77F]">admin / 2024</span>
              <button
                onClick={() => { setUser("admin"); setPin("2024"); }}
                className="block mx-auto mt-2 text-[#E3C77F] underline underline-offset-4"
              >
                Autocompletar
              </button>
            </div>
            <Link href="/" className="block text-center mt-4 text-xs text-white/40 hover:text-white">
              ← Volver a la web
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell tab={tab} setTab={setTab} onLogout={() => { sessionStorage.removeItem("navajas_admin"); setAuthed(false); }} />;
}

/* ================= SHELL ================= */
function AdminShell({ tab, setTab, onLogout }: { tab: Tab; setTab: (t: Tab) => void; onLogout: () => void }) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "bookings", label: "Reservas", icon: <CalendarDays size={17} /> },
    { id: "services", label: "Servicios", icon: <Scissors size={17} /> },
    { id: "images", label: "Fotos Home", icon: <ImageIcon size={17} /> },
    { id: "hours", label: "Horarios", icon: <Clock size={17} /> },
    { id: "settings", label: "Ajustes", icon: <Settings2 size={17} /> },
  ];

  return (
    <div className="min-h-screen bg-[#141414] texture-leather">
      <div className="h-1 texture-stripes" />
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur border-b border-[#D4A94E]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <span className="hidden sm:inline text-[0.7rem] px-2.5 py-1 rounded-full bg-[#D4A94E]/15 border border-[#D4A94E]/30 text-[#E3C77F] font-semibold tracking-wider uppercase">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost px-3.5 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5">
              <Eye size={15} /> <span className="hidden sm:inline">Ver web</span>
            </Link>
            <button onClick={onLogout} className="btn-ghost px-3.5 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5 text-red-200">
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-[#D4A94E] text-[#1A140E] font-bold"
                  : "bg-white/5 text-white/65 hover:bg-white/10 border border-white/10"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {tab === "bookings" && <BookingsTab />}
        {tab === "services" && <ServicesTab />}
        {tab === "images" && <ImagesTab />}
        {tab === "hours" && <HoursTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

/* ================= RESERVAS ================= */
function BookingsTab() {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const r = await fetch("/api/bookings", { cache: "no-store" });
      const j = await r.json();
      if (j.ok) {
        setBookings(j.data);
        writeJSON(LS_KEYS.bookings, j.data);
      } else {
        setBookings(readJSON(LS_KEYS.bookings, []));
      }
    } catch {
      setBookings(readJSON(LS_KEYS.bookings, []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000); // tiempo real suave
    return () => clearInterval(t);
  }, []);

  async function setStatus(id: number, status: "completed" | "cancelled" | "pending") {
    setBusyId(id);
    setMsg("");
    try {
      const r = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Error");
      await load();
      if (status === "completed") {
        const m = j.member;
        setMsg(
          m
            ? `✓ Corte completado. ${m.name || m.phone} ahora tiene ${m.stamps}/8 sellos${m.freeCutAvailable ? " 🎁 ¡CORTE GRATIS DESBLOQUEADO!" : ""}.`
            : "✓ Corte marcado como completado y sello sumado."
        );
      } else setMsg("Estado actualizado.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta reserva?")) return;
    await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    load();
  }

  const filtered = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter]
  );
  const pending = bookings.filter((b) => b.status === "pending").length;

  // Agrupar por fecha
  const grouped = useMemo(() => {
    const m = new Map<string, BookingDTO[]>();
    filtered.forEach((b) => {
      if (!m.has(b.date)) m.set(b.date, []);
      m.get(b.date)!.push(b);
    });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-2xl">Bandeja de reservas</h2>
          <p className="text-sm text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Actualización en tiempo real (cada 8s)
            </span>{" "}
            · {pending} pendientes
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1.5 bg-black/40 border border-white/10 rounded-xl p-1">
            {(["all", "pending", "completed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                  filter === f ? "bg-[#D4A94E] text-[#1A140E] font-bold" : "text-white/55 hover:text-white"
                }`}
              >
                {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : f === "completed" ? "Completadas" : "Canceladas"}
              </button>
            ))}
          </div>
          <button onClick={load} className="btn-ghost p-2.5" title="Recargar">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-sm">
          {msg}
        </div>
      )}

      {loading && <p className="text-white/40 text-sm">Cargando bandeja…</p>}
      {!loading && filtered.length === 0 && (
        <div className="vintage-card rounded-2xl p-10 text-center text-white/45">
          No hay reservas en este filtro.
        </div>
      )}

      {grouped.map(([date, list]) => (
        <div key={date} className="mb-6">
          <p className="text-sm font-semibold capitalize text-[#E3C77F] mb-2.5 flex items-center gap-2">
            <CalendarDays size={15} /> {formatDateES(date)}
            <span className="text-white/35 font-normal">· {list.length} cita(s)</span>
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {list
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((b) => (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    b.status === "pending"
                      ? "vintage-card border-l-4 !border-l-[#D4A94E]"
                      : b.status === "completed"
                        ? "bg-emerald-950/30 border-emerald-400/20 border-l-4 !border-l-emerald-400"
                        : "bg-black/30 border-white/10 opacity-70 border-l-4 !border-l-red-400/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-center bg-black/50 rounded-xl px-2.5 py-1.5 border border-white/10 min-w-[64px]">
                        <span className="block font-bold text-lg leading-none">{b.time}</span>
                        <span className="block text-[0.62rem] text-white/40 mt-0.5">{formatPrice(b.price)}</span>
                      </span>
                      <div>
                        <p className="font-semibold">{b.clientName}</p>
                        <p className="text-xs text-white/50 font-mono inline-flex items-center gap-1">
                          <Phone size={11} /> {b.clientPhone}
                        </p>
                        <p className="text-xs text-[#E3C77F] mt-0.5">{b.serviceName}</p>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  {b.notes && <p className="text-xs text-white/40 mt-2 italic">“{b.notes}”</p>}

                  <div className="flex flex-wrap gap-2 mt-3.5">
                    <a
                      href={waLink(
                        b.clientPhone.startsWith("34") ? b.clientPhone : `34${b.clientPhone}`,
                        adminToClientMessage({
                          clientName: b.clientName,
                          date: b.date,
                          time: b.time,
                          serviceName: b.serviceName,
                        })
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#25D366] text-[#0b3d1f] hover:brightness-110"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                    {b.status !== "completed" && (
                      <button
                        onClick={() => setStatus(b.id, "completed")}
                        disabled={busyId === b.id}
                        className="btn-gold inline-flex items-center gap-1.5 px-3.5 py-2 text-xs"
                      >
                        {busyId === b.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Marcar corte completado (+1 sello)
                      </button>
                    )}
                    {b.status === "pending" && (
                      <button
                        onClick={() => setStatus(b.id, "cancelled")}
                        disabled={busyId === b.id}
                        className="btn-ghost inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-red-200"
                      >
                        <XCircle size={14} /> Cancelar
                      </button>
                    )}
                    {b.status !== "pending" && (
                      <button
                        onClick={() => setStatus(b.id, "pending")}
                        disabled={busyId === b.id}
                        className="btn-ghost inline-flex items-center gap-1.5 px-3.5 py-2 text-xs"
                      >
                        <ChevronLeft size={14} /> Reabrir
                      </button>
                    )}
                    <button
                      onClick={() => remove(b.id)}
                      className="ml-auto p-2 rounded-xl text-white/30 hover:text-red-300 hover:bg-red-500/10"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-[#D4A94E]/15 text-[#E3C77F] border-[#D4A94E]/30",
    completed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    cancelled: "bg-red-500/10 text-red-300 border-red-400/25",
  };
  const label: Record<string, string> = { pending: "PENDIENTE", completed: "COMPLETADO", cancelled: "CANCELADA" };
  return (
    <span className={`text-[0.62rem] px-2.5 py-1 rounded-full border font-bold shrink-0 ${map[status] ?? map.pending}`}>
      {label[status] ?? status}
    </span>
  );
}

/* ================= SERVICIOS CMS ================= */
function ServicesTab() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const r = await fetch("/api/services", { cache: "no-store" });
      const j = await r.json();
      if (j.ok && j.data.length) {
        setServices(j.data);
        writeJSON(LS_KEYS.services, j.data);
      } else setServices(readJSON(LS_KEYS.services, []));
    } catch {
      setServices(readJSON(LS_KEYS.services, []));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  function updateLocal(id: number, patch: Partial<ServiceDTO>) {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function save(s: ServiceDTO) {
    setSaving(s.id);
    setMsg("");
    // 1) Instantáneo en localStorage (Home se actualiza al momento)
    const next = services.map((x) => (x.id === s.id ? s : x));
    writeJSON(LS_KEYS.services, next);
    // 2) Persistir en Postgres
    try {
      const r = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Error al guardar");
      setMsg(`✓ “${s.name}” guardado y publicado en la Home.`);
    } catch (e: unknown) {
      setMsg(`${e instanceof Error ? e.message : "Error"} (guardado solo local)`);
    } finally {
      setSaving(null);
    }
  }

  async function create() {
    const payload = {
      name: "Nuevo servicio",
      description: "Describe el servicio…",
      price: 15,
      durationMin: 30,
      active: true,
      sortOrder: services.length,
      icon: "scissors",
    };
    try {
      const r = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (j.ok) {
        const next = [...services, j.data];
        setServices(next);
        writeJSON(LS_KEYS.services, next);
        setMsg("✓ Servicio creado.");
      }
    } catch { setMsg("No se pudo crear (solo local no soporta crear, edita los existentes)."); }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar este servicio?")) return;
    await fetch(`/api/services?id=${id}`, { method: "DELETE" });
    const next = services.filter((s) => s.id !== id);
    setServices(next);
    writeJSON(LS_KEYS.services, next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="font-display text-2xl">Editor de servicios</h2>
          <p className="text-sm text-white/50">Cambios visibles al instante en la Home (localStorage + Postgres).</p>
        </div>
        <button onClick={create} className="btn-gold px-4 py-2.5 text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Nuevo
        </button>
      </div>
      {msg && <div className="my-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-sm">{msg}</div>}
      {loading && <p className="text-white/40 text-sm mt-4">Cargando…</p>}
      <div className="grid gap-4 lg:grid-cols-2 mt-4">
        {services.map((s) => (
          <div key={s.id} className="vintage-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <ServiceIcon icon={s.icon} size={18} /> #{s.id}
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/50 flex items-center gap-2 cursor-pointer">
                  Visible
                  <button
                    onClick={() => updateLocal(s.id, { active: !s.active })}
                    className={`w-10 h-6 rounded-full transition-colors relative ${s.active ? "bg-emerald-500" : "bg-white/15"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${s.active ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </label>
                <button onClick={() => remove(s.id)} className="p-1.5 text-white/30 hover:text-red-300"><Trash2 size={15} /></button>
              </div>
            </div>
            <label className="text-xs text-white/50">Nombre</label>
            <input value={s.name} onChange={(e) => updateLocal(s.id, { name: e.target.value })} className="input-dark mt-1 mb-2.5 !py-2 text-sm" />
            <label className="text-xs text-white/50">Descripción</label>
            <textarea value={s.description} onChange={(e) => updateLocal(s.id, { description: e.target.value })} rows={2} className="input-dark mt-1 mb-2.5 !py-2 text-sm resize-none" />
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-xs text-white/50">Precio (€)</label>
                <input type="number" min={0} value={s.price} onChange={(e) => updateLocal(s.id, { price: Number(e.target.value) })} className="input-dark mt-1 !py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/50">Minutos</label>
                <input type="number" min={5} step={5} value={s.durationMin} onChange={(e) => updateLocal(s.id, { durationMin: Number(e.target.value) })} className="input-dark mt-1 !py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/50">Icono</label>
                <select value={s.icon} onChange={(e) => updateLocal(s.id, { icon: e.target.value })} className="input-dark mt-1 !py-2 text-sm">
                  <option value="scissors">Tijeras</option>
                  <option value="zap">Fade</option>
                  <option value="razor">Navaja</option>
                  <option value="crown">Premium</option>
                  <option value="brush">Barba</option>
                  <option value="smile">General</option>
                </select>
              </div>
            </div>
            <button onClick={() => save(s)} disabled={saving === s.id} className="btn-gold w-full mt-3 py-2.5 text-sm inline-flex items-center justify-center gap-2">
              {saving === s.id ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Guardar y publicar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= IMÁGENES CMS ================= */
function ImagesTab() {
  const [images, setImages] = useState<SiteImageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const fileHero = useRef<HTMLInputElement>(null);
  const fileGal = useRef<HTMLInputElement>(null);

  const hero = images.find((i) => i.slot === "hero");
  const gallery = images.filter((i) => i.slot === "gallery").sort((a, b) => a.sortOrder - b.sortOrder);

  const load = async () => {
    try {
      const r = await fetch("/api/gallery", { cache: "no-store" });
      const j = await r.json();
      if (j.ok && j.data.length) setImages(j.data);
      else {
        const lsHero = readJSON<string>(LS_KEYS.hero, "");
        const lsGal = readJSON<SiteImageDTO[]>(LS_KEYS.gallery, []);
        const arr: SiteImageDTO[] = [
          ...(lsHero ? [{ id: 0, slot: "hero" as const, url: lsHero, caption: "Portada", sortOrder: 0 }] : []),
          ...lsGal,
        ];
        setImages(arr);
      }
    } catch {
      const lsGal = readJSON<SiteImageDTO[]>(LS_KEYS.gallery, []);
      setImages(lsGal);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  function syncLocal(next: SiteImageDTO[]) {
    const h = next.find((i) => i.slot === "hero");
    const g = next.filter((i) => i.slot === "gallery");
    if (h) writeJSON(LS_KEYS.hero, h.url);
    writeJSON(LS_KEYS.gallery, g);
  }

  async function setHeroUrl(url: string) {
    setMsg("");
    if (!url) return;
    try {
      if (hero && hero.id > 0) {
        const r = await fetch("/api/gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: hero.id, url, slot: "hero" }),
        });
        const j = await r.json();
        if (j.ok) {
          const next = images.map((i) => (i.id === hero.id ? { ...i, url } : i));
          setImages(next);
          syncLocal(next);
          setMsg("✓ Portada actualizada. Visible al instante en la Home.");
        }
      } else {
        const r = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot: "hero", url, caption: "Portada", sortOrder: 0 }),
        });
        const j = await r.json();
        if (j.ok) {
          const next = [...images, j.data];
          setImages(next);
          syncLocal(next);
          setMsg("✓ Portada creada.");
        }
      }
    } catch { setMsg("Error al guardar portada."); }
  }

  async function addGallery(url: string, caption: string) {
    if (!url) return;
    try {
      const r = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: "gallery", url, caption, sortOrder: gallery.length }),
      });
      const j = await r.json();
      if (j.ok) {
        const next = [...images, j.data];
        setImages(next);
        syncLocal(next);
        setNewUrl("");
        setNewCaption("");
        setMsg("✓ Foto añadida a la galería.");
      }
    } catch { setMsg("Error al añadir foto."); }
  }

  async function updateCaption(img: SiteImageDTO, caption: string) {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, caption } : i)));
  }
  async function saveCaption(img: SiteImageDTO) {
    await fetch("/api/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: img.id, caption: img.caption }),
    });
    syncLocal(images);
    setMsg("✓ Pie de foto guardado.");
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta foto?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    const next = images.filter((i) => i.id !== id);
    setImages(next);
    syncLocal(next);
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(String(reader.result));
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div>
      <h2 className="font-display text-2xl">Gestor visual de la Home</h2>
      <p className="text-sm text-white/50 mb-4">Sube desde tu dispositivo o pega una URL. Se refleja al instante.</p>
      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-sm">{msg}</div>}
      {loading && <p className="text-white/40 text-sm">Cargando…</p>}

      {/* HERO */}
      <div className="vintage-card rounded-2xl p-5 mb-5">
        <h3 className="font-semibold mb-3">📸 Foto de portada (Hero)</h3>
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div className="relative h-48 rounded-xl overflow-hidden border border-white/10 bg-black">
            {hero?.url && <Image src={hero.url} alt="Portada" fill className="object-cover" />}
          </div>
          <div className="space-y-2.5">
            <input
              placeholder="Pegar URL de imagen…"
              className="input-dark text-sm"
              defaultValue={hero?.url ?? ""}
              id="hero-url"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const el = document.getElementById("hero-url") as HTMLInputElement;
                  setHeroUrl(el.value);
                }}
                className="btn-gold flex-1 py-2.5 text-sm"
              >
                Usar URL
              </button>
              <button onClick={() => fileHero.current?.click()} className="btn-ghost flex-1 py-2.5 text-sm">
                Subir local
              </button>
              <input
                ref={fileHero}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const url = await fileToDataUrl(f);
                    setHeroUrl(url);
                  }
                }}
              />
            </div>
            <p className="text-xs text-white/35">Recomendado: horizontal 1600×900 o superior.</p>
          </div>
        </div>
      </div>

      {/* GALERÍA */}
      <div className="vintage-card rounded-2xl p-5">
        <h3 className="font-semibold mb-3">🖼️ Galería ({gallery.length} fotos)</h3>
        <div className="grid sm:grid-cols-3 gap-2.5 mb-4">
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL de la foto…" className="input-dark text-sm sm:col-span-2" />
          <input value={newCaption} onChange={(e) => setNewCaption(e.target.value)} placeholder="Pie de foto…" className="input-dark text-sm" />
        </div>
        <div className="flex gap-2 mb-5">
          <button onClick={() => addGallery(newUrl, newCaption)} className="btn-gold flex-1 py-2.5 text-sm inline-flex items-center justify-center gap-2">
            <Plus size={15} /> Añadir por URL
          </button>
          <button onClick={() => fileGal.current?.click()} className="btn-ghost flex-1 py-2.5 text-sm">
            Subir foto local
          </button>
          <input
            ref={fileGal}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = await fileToDataUrl(f);
                addGallery(url, newCaption || f.name);
              }
            }}
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {gallery.map((g) => (
            <div key={g.id} className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <div className="relative h-36">
                <Image src={g.url} alt={g.caption} fill className="object-cover" />
                <button onClick={() => remove(g.id)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-red-300 hover:bg-red-500/30">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-2 flex gap-1.5">
                <input
                  value={g.caption}
                  onChange={(e) => updateCaption(g, e.target.value)}
                  className="input-dark !py-1.5 !px-2.5 text-xs flex-1"
                />
                <button onClick={() => saveCaption(g)} className="btn-ghost px-2.5 text-xs">OK</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= HORARIOS ================= */
function HoursTab() {
  const [hours, setHours] = useState<BusinessHourDTO[]>([]);
  const [closed, setClosed] = useState<{ id: number; date: string; reason: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const load = async () => {
    try {
      const [rh, rc] = await Promise.all([
        fetch("/api/hours", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/closed-dates", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (rh.ok && rh.data.length) {
        setHours(rh.data);
        writeJSON(LS_KEYS.hours, rh.data);
      } else setHours(readJSON(LS_KEYS.hours, []));
      if (rc.ok) {
        setClosed(rc.data);
        writeJSON(LS_KEYS.closedDates, rc.data);
      }
    } catch {
      setHours(readJSON(LS_KEYS.hours, []));
      setClosed(readJSON(LS_KEYS.closedDates, []));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  function patch(wd: number, p: Partial<BusinessHourDTO>) {
    setHours((prev) => prev.map((h) => (h.weekday === wd ? { ...h, ...p } : h)));
  }

  async function saveAll() {
    setMsg("");
    writeJSON(LS_KEYS.hours, hours); // instantáneo
    try {
      const r = await fetch("/api/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Error");
      setHours(j.data);
      setMsg("✓ Horario publicado. El calendario de reservas ya muestra los nuevos huecos.");
    } catch (e: unknown) {
      setMsg(`${e instanceof Error ? e.message : "Error"} (guardado solo local)`);
    }
  }

  async function addClosed() {
    if (!newDate) return;
    try {
      const r = await fetch("/api/closed-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, reason: newReason }),
      });
      const j = await r.json();
      if (j.ok) {
        const next = [...closed, j.data].sort((a, b) => a.date.localeCompare(b.date));
        setClosed(next);
        writeJSON(LS_KEYS.closedDates, next);
        setNewDate("");
        setNewReason("");
        setMsg("✓ Fecha cerrada añadida.");
      }
    } catch { setMsg("Error al añadir cierre."); }
  }

  async function removeClosed(id: number) {
    await fetch(`/api/closed-dates?id=${id}`, { method: "DELETE" });
    const next = closed.filter((c) => c.id !== id);
    setClosed(next);
    writeJSON(LS_KEYS.closedDates, next);
  }

  const ordered = [...hours].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.weekday) - order.indexOf(b.weekday);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="font-display text-2xl">Días y horarios</h2>
          <p className="text-sm text-white/50">Activa/desactiva días y ajusta apertura/cierre. El calendario se actualiza en tiempo real.</p>
        </div>
        <button onClick={saveAll} className="btn-gold px-5 py-2.5 text-sm inline-flex items-center gap-2">
          <Save size={15} /> Publicar horario
        </button>
      </div>
      {msg && <div className="my-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-sm">{msg}</div>}
      {loading && <p className="text-white/40 text-sm">Cargando…</p>}

      <div className="grid gap-3 mt-4">
        {ordered.map((h) => (
          <div
            key={h.weekday}
            className={`vintage-card rounded-2xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
              !h.isOpen ? "opacity-70" : ""
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => patch(h.weekday, { isOpen: !h.isOpen })}
                className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${h.isOpen ? "bg-emerald-500" : "bg-white/15"}`}
                title={h.isOpen ? "Cerrar día" : "Abrir día"}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${h.isOpen ? "left-[22px]" : "left-0.5"}`} />
              </button>
              <span className="font-semibold w-24">{WEEKDAY_NAMES[h.weekday]}</span>
              <span className={`text-[0.65rem] px-2.5 py-1 rounded-full font-bold ${h.isOpen ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                {h.isOpen ? "ABIERTO" : "CERRADO"}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <label className="text-xs text-white/45">Apertura</label>
              <input
                type="time"
                value={h.openTime}
                disabled={!h.isOpen}
                onChange={(e) => patch(h.weekday, { openTime: e.target.value })}
                className="input-dark !w-auto !py-2 text-sm disabled:opacity-40"
              />
              <span className="text-white/30">→</span>
              <label className="text-xs text-white/45">Cierre</label>
              <input
                type="time"
                value={h.closeTime}
                disabled={!h.isOpen}
                onChange={(e) => patch(h.weekday, { closeTime: e.target.value })}
                className="input-dark !w-auto !py-2 text-sm disabled:opacity-40"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Fechas concretas */}
      <div className="vintage-card rounded-2xl p-5 mt-6">
        <h3 className="font-semibold">📅 Cierres concretos (festivos, vacaciones…)</h3>
        <p className="text-xs text-white/45 mt-0.5 mb-4">Estas fechas se bloquean en el calendario aunque el día de la semana esté abierto.</p>
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input-dark sm:max-w-[200px]" />
          <input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="Motivo (ej. Festivo local)" className="input-dark flex-1" />
          <button onClick={addClosed} className="btn-gold px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2">
            <Plus size={15} /> Cerrar fecha
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {closed.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-red-500/10 border border-red-400/25 text-red-200 capitalize">
              {formatDateES(c.date)}{c.reason ? ` · ${c.reason}` : ""}
              <button onClick={() => removeClosed(c.id)} className="hover:text-white"><XCircle size={14} /></button>
            </span>
          ))}
          {closed.length === 0 && <p className="text-xs text-white/35">Sin cierres programados.</p>}
        </div>
      </div>
    </div>
  );
}

/* ================= AJUSTES ================= */
function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setSettings(j.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setMsg("");
    const r = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    const j = await r.json();
    setMsg(j.ok ? "✓ Ajustes guardados." : "Error al guardar.");
  }

  async function reseed() {
    if (!confirm("¿Restaurar datos de prueba? Se borrarán los cambios actuales.")) return;
    setMsg("Restaurando…");
    const r = await fetch("/api/seed", { method: "POST" });
    const j = await r.json();
    setMsg(j.ok ? "✓ Datos de prueba restaurados. Recarga la web." : `Error: ${j.error}`);
  }

  const fields: { key: string; label: string; ph: string }[] = [
    { key: "admin_phone", label: "WhatsApp del administrador (con prefijo, sin +)", ph: "34612345678" },
    { key: "address", label: "Dirección de la barbería", ph: "Av. Humboldt 1231, Edificio Humboldt" },
    { key: "hero_title", label: "Titular portada", ph: "El club donde el estilo es tradición" },
    { key: "hero_subtitle", label: "Subtítulo portada", ph: "Cortes clásicos…" },
  ];

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl">Ajustes generales</h2>
      <p className="text-sm text-white/50 mb-4">WhatsApp de avisos, dirección y textos de portada.</p>
      {loading && <p className="text-white/40 text-sm">Cargando…</p>}
      <div className="vintage-card rounded-2xl p-5 sm:p-6 space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs text-white/55">{f.label}</label>
            <input
              value={settings[f.key] ?? ""}
              onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
              placeholder={f.ph}
              className="input-dark mt-1 text-sm"
            />
          </div>
        ))}
        <button onClick={save} className="btn-gold w-full py-2.5 text-sm inline-flex items-center justify-center gap-2">
          <Save size={15} /> Guardar ajustes
        </button>
        {msg && <p className="text-sm text-emerald-300">{msg}</p>}
      </div>

      <div className="vintage-card rounded-2xl p-5 sm:p-6 mt-5">
        <h3 className="font-semibold text-red-200">Zona de pruebas</h3>
        <p className="text-xs text-white/45 mt-1 mb-3">
          Restaura servicios, horarios, galería, reservas y miembros de ejemplo.
        </p>
        <button onClick={reseed} className="btn-ghost px-5 py-2.5 text-sm text-red-200">
          Restaurar datos de prueba
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 mt-5 text-xs text-white/50 leading-relaxed">
        <p className="font-semibold text-white/70 mb-1.5">🔌 Rutas API listas para producción</p>
        <p><span className="font-mono text-[#E3C77F]">POST /api/bookings</span> — crear reserva (valida horario y huecos)</p>
        <p><span className="font-mono text-[#E3C77F]">PATCH /api/bookings</span> — completar/cancelar (+1 sello auto)</p>
        <p><span className="font-mono text-[#E3C77F]">POST /api/whatsapp</span> — webhook WhatsApp (conectar Twilio/Meta Cloud)</p>
        <p><span className="font-mono text-[#E3C77F]">POST /api/members/request-code</span> + <span className="font-mono text-[#E3C77F]">/verify</span> — OTP fidelización</p>
      </div>
    </div>
  );
}
