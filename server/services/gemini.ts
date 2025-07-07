import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChartInterpretation {
  summary: string;
  sunSign: string;
  moonSign: string;
  ascendant: string;
  majorAspects: string[];
  personality: string;
  strengths: string[];
  challenges: string[];
  guidance: string;
}

export class GeminiService {
  static async generateChartInterpretation(
    chartData: any,
    birthData: { name: string; birthDate: Date; birthTime?: string; birthLocation: string }
  ): Promise<ChartInterpretation> {
    try {
      const systemPrompt = `You are a professional astrologer with decades of experience. 
Analyze the natal chart data and provide a comprehensive interpretation.
Focus on practical insights and guidance. Respond with JSON in this exact format:
{
  "summary": "string",
  "sunSign": "string", 
  "moonSign": "string",
  "ascendant": "string",
  "majorAspects": ["string"],
  "personality": "string",
  "strengths": ["string"],
  "challenges": ["string"],
  "guidance": "string"
}`;

      const prompt = `Please analyze this natal chart:

Birth Data:
- Name: ${birthData.name}
- Date: ${birthData.birthDate.toDateString()}
- Time: ${birthData.birthTime || 'Unknown'}
- Location: ${birthData.birthLocation}

Planetary Positions:
${chartData.positions?.map((p: any) => `${p.name}: ${p.sign} ${p.degree}°${p.minute}'`).join('\n') || 'No planetary positions available'}

Major Aspects:
${chartData.aspects?.map((a: any) => `${a.body1} ${a.aspectType} ${a.body2} (orb: ${a.orb}°)`).join('\n') || 'No aspects available'}

Provide a detailed astrological interpretation focusing on personality traits, life themes, strengths, challenges, and practical guidance.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              sunSign: { type: "string" },
              moonSign: { type: "string" },
              ascendant: { type: "string" },
              majorAspects: {
                type: "array",
                items: { type: "string" }
              },
              personality: { type: "string" },
              strengths: {
                type: "array",
                items: { type: "string" }
              },
              challenges: {
                type: "array",
                items: { type: "string" }
              },
              guidance: { type: "string" }
            },
            required: ["summary", "sunSign", "moonSign", "ascendant", "majorAspects", "personality", "strengths", "challenges", "guidance"],
          },
        },
        contents: prompt,
      });

      const rawJson = response.text;
      console.log(`Raw JSON: ${rawJson}`);

      if (rawJson) {
        const data: ChartInterpretation = JSON.parse(rawJson);
        return data;
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(`Failed to generate chart interpretation: ${error}`);
    }
  }

  static async generatePodcastContent(
    template: string,
    ephemerisData: any,
    date: Date = new Date()
  ): Promise<string> {
    try {
      const prompt = `Generate podcast content using this template and astronomical data:

Template:
${template}

Current Date: ${date.toDateString()}

Astronomical Data:
${JSON.stringify(ephemerisData, null, 2)}

Replace any template variables with actual data and create engaging, informative content suitable for an astronomy/astrology podcast. Keep the tone professional yet accessible.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "Unable to generate podcast content";
    } catch (error) {
      console.error("Gemini Podcast Generation Error:", error);
      throw new Error(`Failed to generate podcast content: ${error}`);
    }
  }

  static async enhanceAstrologyContent(
    baseContent: string,
    astrologyData: any
  ): Promise<string> {
    try {
      const prompt = `Enhance this astrology content with deeper insights:

Base Content:
${baseContent}

Astrology Data:
${JSON.stringify(astrologyData, null, 2)}

Provide enhanced content that includes:
- Deeper astrological significance
- Historical and mythological context
- Practical applications
- Connection to current cosmic events

Keep the content engaging and educational.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || baseContent;
    } catch (error) {
      console.error("Gemini Content Enhancement Error:", error);
      return baseContent; // Return original content if enhancement fails
    }
  }

  static async analyzeCelestialEvent(
    eventData: any,
    historicalContext?: string
  ): Promise<string> {
    try {
      const prompt = `Analyze this celestial event from an astrological perspective:

Event Data:
${JSON.stringify(eventData, null, 2)}

${historicalContext ? `Historical Context:\n${historicalContext}\n` : ''}

Provide:
- Astrological significance
- Potential influences and themes
- Historical parallels
- Practical guidance for this period

Format as engaging, informative content suitable for an astrology audience.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "Unable to analyze celestial event";
    } catch (error) {
      console.error("Gemini Event Analysis Error:", error);
      throw new Error(`Failed to analyze celestial event: ${error}`);
    }
  }

  static async generateTransitInterpretation(
    natalPositions: any[],
    transitPositions: any[],
    significantTransits: any[],
    context: { natalDate: string; transitDate: string; natalLocation: string; transitLocation: string }
  ): Promise<any> {
    try {
      const prompt = `You are an expert astrologer with access to comprehensive astrological data from the Astrology Arith(m)etic vault. Analyze this transit comparison and provide detailed interpretations.

NATAL CHART DETAILS:
Date: ${context.natalDate}
Location: ${context.natalLocation}

TRANSIT CHART DETAILS:
Date: ${context.transitDate}
Location: ${context.transitLocation}

SIGNIFICANT TRANSIT ASPECTS:
${JSON.stringify(significantTransits, null, 2)}

Please provide a comprehensive interpretation including:
1. Overall transit theme and energy
2. Detailed analysis of the top 5 most significant transit aspects
3. Timing and duration insights
4. Practical guidance and advice
5. Areas of life most affected

Use the Astrology Arith(m)etic principles for accurate interpretations. Respond in JSON format:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              overallTheme: { type: "string" },
              significantAspects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    aspect: { type: "string" },
                    interpretation: { type: "string" },
                    timing: { type: "string" },
                    advice: { type: "string" }
                  }
                }
              },
              practicalGuidance: { type: "string" },
              areasAffected: { type: "array", items: { type: "string" } },
              timelineInsights: { type: "string" }
            }
          }
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      }
      
      return null;
    } catch (error) {
      console.error("Failed to generate transit interpretation:", error);
      return null;
    }
  }
}