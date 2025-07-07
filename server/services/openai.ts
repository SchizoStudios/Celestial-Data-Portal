import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

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

export class OpenAIService {
  
  static async generateChartInterpretation(
    chartData: any,
    birthData: { name: string; birthDate: Date; birthTime?: string; birthLocation: string }
  ): Promise<ChartInterpretation> {
    try {
      const prompt = `Analyze this natal chart for ${birthData.name} born on ${birthData.birthDate.toDateString()} in ${birthData.birthLocation}.

Chart Data:
- Planetary Positions: ${JSON.stringify(chartData.positions)}
- Aspects: ${JSON.stringify(chartData.aspects)}
- Houses: ${JSON.stringify(chartData.houses)}

Provide a comprehensive astrological interpretation in JSON format with the following structure:
{
  "summary": "Overall chart summary (2-3 sentences)",
  "sunSign": "Sun sign interpretation",
  "moonSign": "Moon sign interpretation", 
  "ascendant": "Rising sign interpretation",
  "majorAspects": ["List of 3-5 most significant aspects with interpretations"],
  "personality": "Core personality traits and characteristics",
  "strengths": ["List of 4-6 key strengths"],
  "challenges": ["List of 3-4 potential challenges to work on"],
  "guidance": "Life guidance and advice based on the chart"
}

Focus on practical, empowering interpretations that help the person understand their potential and growth opportunities.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional astrologer with deep knowledge of natal chart interpretation. Provide insightful, balanced, and empowering readings that help people understand themselves better."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        summary: result.summary || "Chart interpretation not available",
        sunSign: result.sunSign || "Sun sign interpretation not available",
        moonSign: result.moonSign || "Moon sign interpretation not available", 
        ascendant: result.ascendant || "Ascendant interpretation not available",
        majorAspects: result.majorAspects || [],
        personality: result.personality || "Personality analysis not available",
        strengths: result.strengths || [],
        challenges: result.challenges || [],
        guidance: result.guidance || "Guidance not available"
      };

    } catch (error) {
      console.error("Failed to generate chart interpretation:", error);
      throw new Error("Failed to generate chart interpretation: " + (error as Error).message);
    }
  }

  static async generatePodcastContent(
    template: string,
    data: { [key: string]: any }
  ): Promise<string> {
    try {
      let content = template;
      
      // Replace template variables
      for (const [key, value] of Object.entries(data)) {
        const placeholder = `{${key}}`;
        content = content.replace(new RegExp(placeholder, 'g'), String(value));
      }

      const prompt = `Enhance this astronomical and astrological podcast content to make it more engaging and informative:

${content}

Make the content:
- More conversational and engaging
- Include interesting astronomical facts
- Add astrological insights that are accessible to beginners
- Maintain accuracy while being entertaining
- Keep it to approximately 500-800 words
- Format as a natural spoken narrative

Return only the enhanced content, no additional formatting or explanations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert astronomical and astrological content creator who makes complex topics accessible and engaging for podcast audiences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      });

      return response.choices[0].message.content || content;

    } catch (error) {
      console.error("Failed to generate podcast content:", error);
      throw new Error("Failed to generate podcast content: " + (error as Error).message);
    }
  }
}
