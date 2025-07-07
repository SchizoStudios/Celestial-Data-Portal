import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertNatalChartSchema,
  insertAspectMonitorSchema,
  insertPodcastTemplateSchema,
  insertPodcastContentSchema,
  insertEphemerisDataSchema
} from "@shared/schema";
import { AstronomicalService } from "./services/astronomical";
import { GeminiService } from "./services/gemini";
import { AspectInterpretationService } from "./services/aspect-interpretations";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Natal Charts
  app.get("/api/natal-charts", async (req, res) => {
    try {
      const charts = await storage.getAllNatalCharts();
      res.json(charts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch natal charts" });
    }
  });

  app.get("/api/natal-charts/:id", async (req, res) => {
    try {
      const chart = await storage.getNatalChart(parseInt(req.params.id));
      if (!chart) {
        return res.status(404).json({ message: "Chart not found" });
      }
      res.json(chart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chart" });
    }
  });

  app.post("/api/natal-charts", async (req, res) => {
    try {
      // Convert birthDate string to Date object and ensure arrays
      const bodyWithDate = {
        ...req.body,
        birthDate: new Date(req.body.birthDate),
        enabledBodies: Array.isArray(req.body.enabledBodies) ? req.body.enabledBodies : [],
        enabledAspects: Array.isArray(req.body.enabledAspects) ? req.body.enabledAspects : [],
        majorAspects: Array.isArray(req.body.majorAspects) ? req.body.majorAspects : ["Conjunction", "Opposition", "Trine", "Square"]
      };
      const validatedData = insertNatalChartSchema.parse(bodyWithDate);
      
      // Calculate chart data
      const enabledBodies = validatedData.enabledBodies && validatedData.enabledBodies.length > 0 
        ? validatedData.enabledBodies 
        : ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
      
      const positions = await AstronomicalService.calculatePlanetaryPositions(
        validatedData.birthDate,
        validatedData.latitude,
        validatedData.longitude
      );
      
      const enabledAspects = validatedData.enabledAspects && validatedData.enabledAspects.length > 0 
        ? validatedData.enabledAspects 
        : ["Conjunction", "Opposition", "Trine", "Square", "Sextile"];
      
      const aspects = AstronomicalService.calculateAspects(positions, enabledAspects as string[]);
      
      const chartData = {
        positions: positions || [],
        aspects: aspects || [],
        houses: [], // Simplified - would calculate houses in full implementation
      } as any;
      
      const chart = await storage.createNatalChart({
        ...validatedData,
        chartData,
      });
      
      res.json(chart);
    } catch (error) {
      res.status(400).json({ message: "Failed to create chart: " + (error as Error).message });
    }
  });

  app.post("/api/natal-charts/:id/interpretation", async (req, res) => {
    try {
      const chart = await storage.getNatalChart(parseInt(req.params.id));
      if (!chart) {
        return res.status(404).json({ message: "Chart not found" });
      }

      const interpretation = await GeminiService.generateChartInterpretation(
        chart.chartData,
        {
          name: chart.name,
          birthDate: chart.birthDate,
          birthTime: chart.birthTime || undefined,
          birthLocation: chart.birthLocation
        }
      );

      // Update chart with interpretation
      await storage.updateNatalChart(chart.id, {
        interpretation: JSON.stringify(interpretation)
      });

      res.json(interpretation);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate interpretation: " + (error as Error).message });
    }
  });

  app.delete("/api/natal-charts/:id", async (req, res) => {
    try {
      const success = await storage.deleteNatalChart(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Chart not found" });
      }
      res.json({ message: "Chart deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chart" });
    }
  });

  // Aspect Monitors
  app.get("/api/aspect-monitors", async (req, res) => {
    try {
      const monitors = await storage.getAllAspectMonitors();
      res.json(monitors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch aspect monitors" });
    }
  });

  app.post("/api/aspect-monitors", async (req, res) => {
    try {
      const validatedData = insertAspectMonitorSchema.parse(req.body);
      const monitor = await storage.createAspectMonitor(validatedData);
      res.json(monitor);
    } catch (error) {
      res.status(400).json({ message: "Failed to create aspect monitor: " + (error as Error).message });
    }
  });

  app.put("/api/aspect-monitors/:id", async (req, res) => {
    try {
      const partialData = insertAspectMonitorSchema.partial().parse(req.body);
      const monitor = await storage.updateAspectMonitor(parseInt(req.params.id), partialData);
      if (!monitor) {
        return res.status(404).json({ message: "Monitor not found" });
      }
      res.json(monitor);
    } catch (error) {
      res.status(400).json({ message: "Failed to update monitor: " + (error as Error).message });
    }
  });

  app.delete("/api/aspect-monitors/:id", async (req, res) => {
    try {
      const success = await storage.deleteAspectMonitor(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Monitor not found" });
      }
      res.json({ message: "Monitor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete monitor" });
    }
  });

  // Ephemeris Data
  app.get("/api/ephemeris", async (req, res) => {
    try {
      const { date, latitude, longitude, location } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const requestedDate = new Date(date as string);
      
      // Location coordinate mapping
      const locationCoords: Record<string, { lat: number; lng: number }> = {
        "New York, NY": { lat: 40.7128, lng: -74.0060 },
        "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
        "London, UK": { lat: 51.5074, lng: -0.1278 },
        "Paris, France": { lat: 48.8566, lng: 2.3522 },
        "Tokyo, Japan": { lat: 35.6762, lng: 139.6503 },
        "Sydney, Australia": { lat: -33.8688, lng: 151.2093 },
      };
      
      let lat: number, lng: number;
      
      if (latitude && longitude) {
        // Use provided coordinates
        lat = parseFloat(latitude as string);
        lng = parseFloat(longitude as string);
      } else if (location && locationCoords[location as string]) {
        // Use mapped coordinates
        const coords = locationCoords[location as string];
        lat = coords.lat;
        lng = coords.lng;
      } else {
        // Default to NYC
        lat = 40.7128;
        lng = -74.0060;
      }
      const loc = location as string || "New York, NY";
      
      // Check cache first
      let ephemerisData = await storage.getEphemerisData(requestedDate, loc);
      
      if (!ephemerisData) {
        // Calculate new data
        const solarData = await AstronomicalService.calculateSolarData(requestedDate, lat, lng);
        const lunarData = await AstronomicalService.calculateLunarData(requestedDate, lat, lng);
        const planetaryPositions = await AstronomicalService.calculatePlanetaryPositions(requestedDate, lat, lng);
        
        ephemerisData = await storage.createEphemerisData({
          date: requestedDate,
          location: loc,
          latitude: lat,
          longitude: lng,
          solarData,
          lunarData,
          planetaryPositions: planetaryPositions as any,
        });
      }
      
      res.json(ephemerisData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ephemeris data: " + (error as Error).message });
    }
  });

  app.get("/api/ephemeris/current-aspects", async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      const lat = parseFloat(latitude as string) || 40.7128;
      const lng = parseFloat(longitude as string) || -74.0060;
      
      const today = new Date();
      const positions = await AstronomicalService.calculatePlanetaryPositions(today, lat, lng);
      const aspects = AstronomicalService.calculateAspects(positions, [
        "Conjunction", "Opposition", "Trine", "Square", "Sextile"
      ]);
      
      res.json(aspects);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate current aspects" });
    }
  });

  // Aspect interpretation endpoint
  app.get("/api/aspects/:body1/:aspectType/:body2/interpretation", async (req, res) => {
    try {
      const { body1, aspectType, body2 } = req.params;
      const interpretation = AspectInterpretationService.getCachedInterpretation(body1, aspectType, body2);
      res.json(interpretation);
    } catch (error) {
      res.status(500).json({ message: "Failed to get aspect interpretation" });
    }
  });

  // Podcast Templates
  app.get("/api/podcast-templates", async (req, res) => {
    try {
      const templates = await storage.getAllPodcastTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch podcast templates" });
    }
  });

  app.post("/api/podcast-templates", async (req, res) => {
    try {
      const validatedData = insertPodcastTemplateSchema.parse(req.body);
      const template = await storage.createPodcastTemplate(validatedData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Failed to create template: " + (error as Error).message });
    }
  });

  app.put("/api/podcast-templates/:id", async (req, res) => {
    try {
      const partialData = insertPodcastTemplateSchema.partial().parse(req.body);
      const template = await storage.updatePodcastTemplate(parseInt(req.params.id), partialData);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Failed to update template: " + (error as Error).message });
    }
  });

  app.delete("/api/podcast-templates/:id", async (req, res) => {
    try {
      const success = await storage.deletePodcastTemplate(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Podcast Content Generation
  app.post("/api/podcast-content/generate", async (req, res) => {
    try {
      const { templateId, startDate, endDate, outputFormats } = req.body;
      
      const template = await storage.getPodcastTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const generatedContent = [];
      
      // Generate content for each day in range
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const ephemerisData = await storage.getEphemerisData(date);
        let templateData = {};
        
        if (ephemerisData) {
          templateData = {
            date: date.toDateString(),
            sunrise_time: ephemerisData.solarData?.sunrise || "Unknown",
            sunset_time: ephemerisData.solarData?.sunset || "Unknown",
            moon_phase: ephemerisData.lunarData?.phase || "Unknown",
            moon_illumination: ephemerisData.lunarData?.illumination || 0,
            planetary_positions: JSON.stringify(ephemerisData.planetaryPositions || []),
            active_aspects: "Current planetary aspects", // Simplified
          };
        }
        
        let textContent = template.content;
        for (const [key, value] of Object.entries(templateData)) {
          textContent = textContent.replace(new RegExp(`{${key}}`, 'g'), String(value));
        }
        
        // Enhance with AI if enabled
        if (outputFormats?.enhanceWithAI) {
          textContent = await GeminiService.generatePodcastContent(textContent, templateData);
        }
        
        const content = await storage.createPodcastContent({
          templateId,
          date: new Date(date),
          textContent,
          status: "generated",
        });
        
        generatedContent.push(content);
      }
      
      res.json({ 
        message: "Content generated successfully",
        content: generatedContent 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content: " + (error as Error).message });
    }
  });

  app.get("/api/podcast-content", async (req, res) => {
    try {
      const content = await storage.getAllPodcastContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch podcast content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
