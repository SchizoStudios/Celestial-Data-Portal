import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Natal Charts
export const natalCharts = pgTable("natal_charts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  birthTime: text("birth_time"), // HH:MM format
  birthLocation: text("birth_location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  timezone: text("timezone").notNull(),
  enabledBodies: jsonb("enabled_bodies").$type<string[]>().notNull().default([]),
  enabledAspects: jsonb("enabled_aspects").$type<string[]>().notNull().default([]),
  majorAspects: jsonb("major_aspects").$type<string[]>().notNull().default(["Conjunction", "Opposition", "Trine", "Square"]),
  chartData: jsonb("chart_data").$type<any>(), // Planetary positions, houses, aspects
  interpretation: text("interpretation"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Aspect Monitors
export const aspectMonitors = pgTable("aspect_monitors", {
  id: serial("id").primaryKey(),
  body1: text("body1").notNull(),
  aspectType: text("aspect_type").notNull(),
  body2: text("body2").notNull(),
  orb: real("orb").notNull().default(5),
  monitorType: text("monitor_type").notNull().default("transit"),
  dailyNotifications: boolean("daily_notifications").notNull().default(true),
  weeklyDigest: boolean("weekly_digest").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Podcast Templates
export const podcastTemplates = pgTable("podcast_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  availableFields: jsonb("available_fields").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generated Podcast Content
export const podcastContent = pgTable("podcast_content", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => podcastTemplates.id),
  date: timestamp("date").notNull(),
  textContent: text("text_content").notNull(),
  audioUrl: text("audio_url"),
  videoUrl: text("video_url"),
  visualizationStyle: text("visualization_style").default("geometric"),
  status: text("status").notNull().default("generated"), // generated, processing, completed
  createdAt: timestamp("created_at").defaultNow(),
});

// Ephemeris Data Cache
export const ephemerisData = pgTable("ephemeris_data", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  location: text("location"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  solarData: jsonb("solar_data").$type<{
    sunrise: string;
    sunset: string;
    dayLength: string;
  }>(),
  lunarData: jsonb("lunar_data").$type<{
    moonrise: string;
    moonset: string;
    phase: string;
    illumination: number;
  }>(),
  planetaryPositions: jsonb("planetary_positions").$type<any>(),
  cachedAt: timestamp("cached_at").defaultNow(),
});

// Insert schemas
export const insertNatalChartSchema = createInsertSchema(natalCharts).omit({
  id: true,
  createdAt: true,
});

export const insertAspectMonitorSchema = createInsertSchema(aspectMonitors).omit({
  id: true,
  createdAt: true,
});

export const insertPodcastTemplateSchema = createInsertSchema(podcastTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPodcastContentSchema = createInsertSchema(podcastContent).omit({
  id: true,
  createdAt: true,
});

export const insertEphemerisDataSchema = createInsertSchema(ephemerisData).omit({
  id: true,
  cachedAt: true,
});

// Types
export type NatalChart = typeof natalCharts.$inferSelect;
export type InsertNatalChart = z.infer<typeof insertNatalChartSchema>;

export type AspectMonitor = typeof aspectMonitors.$inferSelect;
export type InsertAspectMonitor = z.infer<typeof insertAspectMonitorSchema>;

export type PodcastTemplate = typeof podcastTemplates.$inferSelect;
export type InsertPodcastTemplate = z.infer<typeof insertPodcastTemplateSchema>;

export type PodcastContent = typeof podcastContent.$inferSelect;
export type InsertPodcastContent = z.infer<typeof insertPodcastContentSchema>;

export type EphemerisData = typeof ephemerisData.$inferSelect;
export type InsertEphemerisData = z.infer<typeof insertEphemerisDataSchema>;

// Constants
export const CELESTIAL_BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", 
  "Uranus", "Neptune", "Pluto", "Chiron", "Ceres", "Vesta", "Pallas"
];

export const ASPECT_TYPES = [
  { name: "Conjunction", symbol: "☌", degrees: 0 },
  { name: "Opposition", symbol: "☍", degrees: 180 },
  { name: "Trine", symbol: "△", degrees: 120 },
  { name: "Square", symbol: "☐", degrees: 90 },
  { name: "Sextile", symbol: "⚹", degrees: 60 },
  { name: "Quincunx", symbol: "⚻", degrees: 150 },
];

export const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", element: "Fire" },
  { name: "Taurus", symbol: "♉", element: "Earth" },
  { name: "Gemini", symbol: "♊", element: "Air" },
  { name: "Cancer", symbol: "♋", element: "Water" },
  { name: "Leo", symbol: "♌", element: "Fire" },
  { name: "Virgo", symbol: "♍", element: "Earth" },
  { name: "Libra", symbol: "♎", element: "Air" },
  { name: "Scorpio", symbol: "♏", element: "Water" },
  { name: "Sagittarius", symbol: "♐", element: "Fire" },
  { name: "Capricorn", symbol: "♑", element: "Earth" },
  { name: "Aquarius", symbol: "♒", element: "Air" },
  { name: "Pisces", symbol: "♓", element: "Water" },
];
