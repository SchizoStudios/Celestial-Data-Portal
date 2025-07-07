import { 
  users,
  natalCharts,
  aspectMonitors,
  ephemerisData,
  NatalChart, 
  InsertNatalChart,
  AspectMonitor,
  InsertAspectMonitor,
  EphemerisData,
  InsertEphemerisData,
  User,
  UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Natal Charts
  getNatalChart(id: number): Promise<NatalChart | undefined>;
  getAllNatalCharts(): Promise<NatalChart[]>;
  createNatalChart(chart: InsertNatalChart): Promise<NatalChart>;
  updateNatalChart(id: number, chart: Partial<InsertNatalChart>): Promise<NatalChart | undefined>;
  deleteNatalChart(id: number): Promise<boolean>;

  // Aspect Monitors
  getAspectMonitor(id: number): Promise<AspectMonitor | undefined>;
  getAllAspectMonitors(): Promise<AspectMonitor[]>;
  getActiveAspectMonitors(): Promise<AspectMonitor[]>;
  createAspectMonitor(monitor: InsertAspectMonitor): Promise<AspectMonitor>;
  updateAspectMonitor(id: number, monitor: Partial<InsertAspectMonitor>): Promise<AspectMonitor | undefined>;
  deleteAspectMonitor(id: number): Promise<boolean>;



  // Ephemeris Data
  getEphemerisData(date: Date, location?: string): Promise<EphemerisData | undefined>;
  createEphemerisData(data: InsertEphemerisData): Promise<EphemerisData>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private natalCharts: Map<number, NatalChart> = new Map();
  private aspectMonitors: Map<number, AspectMonitor> = new Map();
  private ephemerisData: Map<string, EphemerisData> = new Map();
  private currentId: number = 1;

  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id);
    const user: User = {
      ...userData,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      email: userData.email || existing?.email || null,
      firstName: userData.firstName || existing?.firstName || null,
      lastName: userData.lastName || existing?.lastName || null,
      profileImageUrl: userData.profileImageUrl || existing?.profileImageUrl || null,
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Natal Charts
  async getNatalChart(id: number): Promise<NatalChart | undefined> {
    return this.natalCharts.get(id);
  }

  async getAllNatalCharts(): Promise<NatalChart[]> {
    return Array.from(this.natalCharts.values());
  }

  async createNatalChart(chart: InsertNatalChart): Promise<NatalChart> {
    const id = this.currentId++;
    const newChart: NatalChart = {
      ...chart,
      id,
      birthDate: new Date(chart.birthDate),
      createdAt: new Date(),
      interpretation: chart.interpretation || null,
      birthTime: chart.birthTime || null,
      enabledBodies: (chart.enabledBodies && Array.isArray(chart.enabledBodies)) ? chart.enabledBodies as string[] : ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"],
      enabledAspects: (chart.enabledAspects && Array.isArray(chart.enabledAspects)) ? chart.enabledAspects as string[] : ["Conjunction", "Opposition", "Trine", "Square", "Sextile"],
      majorAspects: (chart.majorAspects && Array.isArray(chart.majorAspects)) ? chart.majorAspects as string[] : ["Conjunction", "Opposition", "Trine", "Square"],
      minorAspects: (chart.minorAspects && Array.isArray(chart.minorAspects)) ? chart.minorAspects as string[] : [],
      harmonicAspects: (chart.harmonicAspects && Array.isArray(chart.harmonicAspects)) ? chart.harmonicAspects as string[] : [],
      septileAspects: (chart.septileAspects && Array.isArray(chart.septileAspects)) ? chart.septileAspects as string[] : [],
      novileAspects: (chart.novileAspects && Array.isArray(chart.novileAspects)) ? chart.novileAspects as string[] : [],
      chartData: chart.chartData || null,
    };
    this.natalCharts.set(id, newChart);
    return newChart;
  }

  async updateNatalChart(id: number, chart: Partial<InsertNatalChart>): Promise<NatalChart | undefined> {
    const existing = this.natalCharts.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...chart,
      birthDate: chart.birthDate ? new Date(chart.birthDate) : existing.birthDate,
      updatedAt: new Date(),
      enabledBodies: (chart.enabledBodies && Array.isArray(chart.enabledBodies)) ? chart.enabledBodies as string[] : existing.enabledBodies,
      enabledAspects: (chart.enabledAspects && Array.isArray(chart.enabledAspects)) ? chart.enabledAspects as string[] : existing.enabledAspects,
      majorAspects: (chart.majorAspects && Array.isArray(chart.majorAspects)) ? chart.majorAspects as string[] : existing.majorAspects,
      minorAspects: (chart.minorAspects && Array.isArray(chart.minorAspects)) ? chart.minorAspects as string[] : existing.minorAspects,
      harmonicAspects: (chart.harmonicAspects && Array.isArray(chart.harmonicAspects)) ? chart.harmonicAspects as string[] : existing.harmonicAspects,
      septileAspects: (chart.septileAspects && Array.isArray(chart.septileAspects)) ? chart.septileAspects as string[] : existing.septileAspects,
      novileAspects: (chart.novileAspects && Array.isArray(chart.novileAspects)) ? chart.novileAspects as string[] : existing.novileAspects,
    };
    this.natalCharts.set(id, updated);
    return updated;
  }

  async deleteNatalChart(id: number): Promise<boolean> {
    return this.natalCharts.delete(id);
  }

  // Aspect Monitors
  async getAspectMonitor(id: number): Promise<AspectMonitor | undefined> {
    return this.aspectMonitors.get(id);
  }

  async getAllAspectMonitors(): Promise<AspectMonitor[]> {
    return Array.from(this.aspectMonitors.values());
  }

  async getActiveAspectMonitors(): Promise<AspectMonitor[]> {
    return Array.from(this.aspectMonitors.values()).filter(m => m.isActive);
  }

  async createAspectMonitor(monitor: InsertAspectMonitor): Promise<AspectMonitor> {
    const id = this.currentId++;
    const newMonitor: AspectMonitor = {
      ...monitor,
      id,
      createdAt: new Date(),
      orb: monitor.orb || 3,
      monitorType: monitor.monitorType || 'exact',
      dailyNotifications: monitor.dailyNotifications || false,
      weeklyDigest: monitor.weeklyDigest || true,
      emailNotifications: monitor.emailNotifications || false,
      isActive: monitor.isActive !== undefined ? monitor.isActive : true,
    };
    this.aspectMonitors.set(id, newMonitor);
    return newMonitor;
  }

  async updateAspectMonitor(id: number, monitor: Partial<InsertAspectMonitor>): Promise<AspectMonitor | undefined> {
    const existing = this.aspectMonitors.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...monitor };
    this.aspectMonitors.set(id, updated);
    return updated;
  }

  async deleteAspectMonitor(id: number): Promise<boolean> {
    return this.aspectMonitors.delete(id);
  }



  // Ephemeris Data
  async getEphemerisData(date: Date, location?: string): Promise<EphemerisData | undefined> {
    const key = `${date.toISOString().split('T')[0]}-${location || 'default'}`;
    return this.ephemerisData.get(key);
  }

  async createEphemerisData(data: InsertEphemerisData): Promise<EphemerisData> {
    const id = this.currentId++;
    const newData: EphemerisData = {
      ...data,
      id,
      cachedAt: new Date(),
      location: data.location || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      solarData: data.solarData || null,
      lunarData: data.lunarData || null,
      planetaryPositions: data.planetaryPositions || [],
    };
    const key = `${data.date.toISOString().split('T')[0]}-${data.location || 'default'}`;
    this.ephemerisData.set(key, newData);
    return newData;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
          // Preserve user preferences on update
          defaultLocation: userData.defaultLocation,
          defaultLatitude: userData.defaultLatitude,
          defaultLongitude: userData.defaultLongitude,
          timeFormat: userData.timeFormat,
          zodiacSystem: userData.zodiacSystem,
          houseSystem: userData.houseSystem,
          enabledAspects: userData.enabledAspects,
        },
      })
      .returning();
    return user;
  }

  async getNatalChart(id: number): Promise<NatalChart | undefined> {
    const [chart] = await db.select().from(natalCharts).where(eq(natalCharts.id, id));
    return chart || undefined;
  }

  async getAllNatalCharts(): Promise<NatalChart[]> {
    return await db.select().from(natalCharts);
  }

  async createNatalChart(chart: InsertNatalChart): Promise<NatalChart> {
    const [newChart] = await db
      .insert(natalCharts)
      .values(chart)
      .returning();
    return newChart;
  }

  async updateNatalChart(id: number, chart: Partial<InsertNatalChart>): Promise<NatalChart | undefined> {
    const [updatedChart] = await db
      .update(natalCharts)
      .set(chart)
      .where(eq(natalCharts.id, id))
      .returning();
    return updatedChart || undefined;
  }

  async deleteNatalChart(id: number): Promise<boolean> {
    const result = await db.delete(natalCharts).where(eq(natalCharts.id, id));
    return result.rowCount > 0;
  }

  async getAspectMonitor(id: number): Promise<AspectMonitor | undefined> {
    const [monitor] = await db.select().from(aspectMonitors).where(eq(aspectMonitors.id, id));
    return monitor || undefined;
  }

  async getAllAspectMonitors(): Promise<AspectMonitor[]> {
    return await db.select().from(aspectMonitors);
  }

  async getActiveAspectMonitors(): Promise<AspectMonitor[]> {
    return await db.select().from(aspectMonitors).where(eq(aspectMonitors.isActive, true));
  }

  async createAspectMonitor(monitor: InsertAspectMonitor): Promise<AspectMonitor> {
    const [newMonitor] = await db
      .insert(aspectMonitors)
      .values(monitor)
      .returning();
    return newMonitor;
  }

  async updateAspectMonitor(id: number, monitor: Partial<InsertAspectMonitor>): Promise<AspectMonitor | undefined> {
    const [updatedMonitor] = await db
      .update(aspectMonitors)
      .set(monitor)
      .where(eq(aspectMonitors.id, id))
      .returning();
    return updatedMonitor || undefined;
  }

  async deleteAspectMonitor(id: number): Promise<boolean> {
    const result = await db.delete(aspectMonitors).where(eq(aspectMonitors.id, id));
    return result.rowCount > 0;
  }



  async getEphemerisData(date: Date, location?: string): Promise<EphemerisData | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    const [data] = await db.select().from(ephemerisData)
      .where(and(
        eq(ephemerisData.date, date),
        location ? eq(ephemerisData.location, location) : undefined
      ));
    return data || undefined;
  }

  async createEphemerisData(data: InsertEphemerisData): Promise<EphemerisData> {
    const [newData] = await db
      .insert(ephemerisData)
      .values(data)
      .returning();
    return newData;
  }
}

export const storage = new MemStorage();
