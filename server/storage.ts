import { 
  NatalChart, 
  InsertNatalChart,
  AspectMonitor,
  InsertAspectMonitor,
  PodcastTemplate,
  InsertPodcastTemplate,
  PodcastContent,
  InsertPodcastContent,
  EphemerisData,
  InsertEphemerisData
} from "@shared/schema";

export interface IStorage {
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

  // Podcast Templates
  getPodcastTemplate(id: number): Promise<PodcastTemplate | undefined>;
  getAllPodcastTemplates(): Promise<PodcastTemplate[]>;
  createPodcastTemplate(template: InsertPodcastTemplate): Promise<PodcastTemplate>;
  updatePodcastTemplate(id: number, template: Partial<InsertPodcastTemplate>): Promise<PodcastTemplate | undefined>;
  deletePodcastTemplate(id: number): Promise<boolean>;

  // Podcast Content
  getPodcastContent(id: number): Promise<PodcastContent | undefined>;
  getAllPodcastContent(): Promise<PodcastContent[]>;
  getPodcastContentByDateRange(startDate: Date, endDate: Date): Promise<PodcastContent[]>;
  createPodcastContent(content: InsertPodcastContent): Promise<PodcastContent>;
  updatePodcastContent(id: number, content: Partial<InsertPodcastContent>): Promise<PodcastContent | undefined>;

  // Ephemeris Data
  getEphemerisData(date: Date, location?: string): Promise<EphemerisData | undefined>;
  createEphemerisData(data: InsertEphemerisData): Promise<EphemerisData>;
}

export class MemStorage implements IStorage {
  private natalCharts: Map<number, NatalChart> = new Map();
  private aspectMonitors: Map<number, AspectMonitor> = new Map();
  private podcastTemplates: Map<number, PodcastTemplate> = new Map();
  private podcastContent: Map<number, PodcastContent> = new Map();
  private ephemerisData: Map<string, EphemerisData> = new Map();
  private currentId: number = 1;

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
      createdAt: new Date(),
      interpretation: chart.interpretation || null,
      birthTime: chart.birthTime || null,
      enabledBodies: (chart.enabledBodies as string[]) || ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"],
      enabledAspects: (chart.enabledAspects as string[]) || ["Conjunction", "Opposition", "Trine", "Square", "Sextile"],
      majorAspects: (chart.majorAspects as string[]) || ["Conjunction", "Opposition", "Trine", "Square"],
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
      enabledBodies: Array.isArray(chart.enabledBodies) ? chart.enabledBodies : existing.enabledBodies,
      enabledAspects: Array.isArray(chart.enabledAspects) ? chart.enabledAspects : existing.enabledAspects,
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

  // Podcast Templates
  async getPodcastTemplate(id: number): Promise<PodcastTemplate | undefined> {
    return this.podcastTemplates.get(id);
  }

  async getAllPodcastTemplates(): Promise<PodcastTemplate[]> {
    return Array.from(this.podcastTemplates.values());
  }

  async createPodcastTemplate(template: InsertPodcastTemplate): Promise<PodcastTemplate> {
    const id = this.currentId++;
    const now = new Date();
    const newTemplate: PodcastTemplate = {
      ...template,
      id,
      createdAt: now,
      updatedAt: now,
      availableFields: (template.availableFields as string[]) || [],
    };
    this.podcastTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async updatePodcastTemplate(id: number, template: Partial<InsertPodcastTemplate>): Promise<PodcastTemplate | undefined> {
    const existing = this.podcastTemplates.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...template, 
      updatedAt: new Date(),
      availableFields: Array.isArray(template.availableFields) ? template.availableFields : existing.availableFields,
    };
    this.podcastTemplates.set(id, updated);
    return updated;
  }

  async deletePodcastTemplate(id: number): Promise<boolean> {
    return this.podcastTemplates.delete(id);
  }

  // Podcast Content
  async getPodcastContent(id: number): Promise<PodcastContent | undefined> {
    return this.podcastContent.get(id);
  }

  async getAllPodcastContent(): Promise<PodcastContent[]> {
    return Array.from(this.podcastContent.values());
  }

  async getPodcastContentByDateRange(startDate: Date, endDate: Date): Promise<PodcastContent[]> {
    return Array.from(this.podcastContent.values()).filter(
      content => content.date >= startDate && content.date <= endDate
    );
  }

  async createPodcastContent(content: InsertPodcastContent): Promise<PodcastContent> {
    const id = this.currentId++;
    const newContent: PodcastContent = {
      ...content,
      id,
      createdAt: new Date(),
      status: content.status || 'draft',
      templateId: content.templateId || null,
      audioUrl: content.audioUrl || null,
      videoUrl: content.videoUrl || null,
      visualizationStyle: content.visualizationStyle || null,
    };
    this.podcastContent.set(id, newContent);
    return newContent;
  }

  async updatePodcastContent(id: number, content: Partial<InsertPodcastContent>): Promise<PodcastContent | undefined> {
    const existing = this.podcastContent.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...content };
    this.podcastContent.set(id, updated);
    return updated;
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

export const storage = new MemStorage();
