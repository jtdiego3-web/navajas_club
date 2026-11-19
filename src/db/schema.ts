import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  varchar,
} from "drizzle-orm/pg-core";

// Servicios de la barbería (CMS)
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  durationMin: integer("duration_min").notNull().default(30),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  icon: varchar("icon", { length: 50 }).notNull().default("scissors"),
});

// Imágenes del sitio (hero + galería)
export const siteImages = pgTable("site_images", {
  id: serial("id").primaryKey(),
  slot: varchar("slot", { length: 30 }).notNull().default("gallery"), // hero | gallery
  url: text("url").notNull(),
  caption: text("caption").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Horario semanal (0=Domingo ... 6=Sábado)
export const businessHours = pgTable("business_hours", {
  id: serial("id").primaryKey(),
  weekday: integer("weekday").notNull().unique(),
  isOpen: boolean("is_open").notNull().default(true),
  openTime: varchar("open_time", { length: 5 }).notNull().default("10:00"),
  closeTime: varchar("close_time", { length: 5 }).notNull().default("20:00"),
});

// Fechas cerradas concretas (festivos)
export const closedDates = pgTable("closed_dates", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD
  reason: text("reason").notNull().default(""),
});

// Reservas
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id"),
  serviceName: text("service_name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  time: varchar("time", { length: 5 }).notNull(), // HH:MM
  clientName: text("client_name").notNull(),
  clientPhone: varchar("client_phone", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | completed | cancelled
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Miembros (fidelización por teléfono)
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: text("name").notNull().default(""),
  stamps: integer("stamps").notNull().default(0),
  totalCuts: integer("total_cuts").notNull().default(0),
  freeCutAvailable: boolean("free_cut_available").notNull().default(false),
  freeCutRedeemed: integer("free_cut_redeemed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Historial de cortes
export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  memberPhone: varchar("member_phone", { length: 20 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  time: varchar("time", { length: 5 }).notNull().default(""),
  serviceName: text("service_name").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("completed"), // completed | free | cancelled
  bookingId: integer("booking_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Ajustes generales (clave-valor)
export const shopSettings = pgTable("shop_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 60 }).notNull().unique(),
  value: text("value").notNull().default(""),
});

// OTPs de miembros (simulador)
export const memberOtps = pgTable("member_otps", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type SiteImage = typeof siteImages.$inferSelect;
export type BusinessHour = typeof businessHours.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Visit = typeof visits.$inferSelect;
