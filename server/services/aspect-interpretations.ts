import { AstrologyDataService } from './astrology-data.js';

export interface AspectInterpretation {
  body1: string;
  aspect: string;
  body2: string;
  aspectName: string;
  interpretation: string;
  energy: 'harmonious' | 'challenging' | 'neutral';
  keywords: string[];
}

export class AspectInterpretationService {
  // Core aspect interpretations based on traditional astrology principles
  // Enhanced with data from Astrology Arith(m)etic Vault
  
  private static aspectMeanings = {
    // Major Aspects
    Conjunction: {
      meaning: "Unity and fusion of energies",
      energy: "neutral" as const,
      keywords: ["unity", "fusion", "intensification", "focus", "new beginnings"]
    },
    Opposition: {
      meaning: "Tension and polarization requiring balance",
      energy: "challenging" as const,
      keywords: ["tension", "awareness", "projection", "balance", "completion"]
    },
    Trine: {
      meaning: "Harmonious flow and natural talent",
      energy: "harmonious" as const,
      keywords: ["harmony", "ease", "talent", "flow", "grace"]
    },
    Square: {
      meaning: "Dynamic tension motivating action",
      energy: "challenging" as const,
      keywords: ["challenge", "motivation", "action", "growth", "friction"]
    },
    Sextile: {
      meaning: "Opportunity and cooperative energy",
      energy: "harmonious" as const,
      keywords: ["opportunity", "cooperation", "skill", "communication", "growth"]
    },
    
    // Minor Aspects
    Inconjunction: {
      meaning: "Adjustment and adaptation needed",
      energy: "challenging" as const,
      keywords: ["adjustment", "adaptation", "health", "service", "refinement"]
    },
    Semisextile: {
      meaning: "Gentle growth and subtle connection",
      energy: "harmonious" as const,
      keywords: ["growth", "connection", "development", "subtlety", "learning"]
    },
    Semisquare: {
      meaning: "Minor friction requiring attention",
      energy: "challenging" as const,
      keywords: ["friction", "irritation", "adjustment", "focus", "refinement"]
    },
    Sesquiquadrate: {
      meaning: "Creative tension and breakthrough",
      energy: "challenging" as const,
      keywords: ["breakthrough", "creativity", "tension", "innovation", "release"]
    },
    Quindecile: {
      meaning: "Obsessive focus and specialized talent",
      energy: "neutral" as const,
      keywords: ["obsession", "specialization", "focus", "mastery", "intensity"]
    },
    
    // Harmonic Aspects
    Quintile: {
      meaning: "Creative genius and unique expression",
      energy: "harmonious" as const,
      keywords: ["creativity", "genius", "uniqueness", "innovation", "artistry"]
    },
    Biquintile: {
      meaning: "Refined creative expression",
      energy: "harmonious" as const,
      keywords: ["refinement", "artistry", "expression", "sophistication", "mastery"]
    },
    Decile: {
      meaning: "Practical creativity and skill",
      energy: "harmonious" as const,
      keywords: ["skill", "practicality", "craft", "application", "technique"]
    },
    Tridecile: {
      meaning: "Persistent creative effort",
      energy: "neutral" as const,
      keywords: ["persistence", "effort", "development", "patience", "gradual growth"]
    },
    Vigintile: {
      meaning: "Sensitive creative awareness",
      energy: "harmonious" as const,
      keywords: ["sensitivity", "awareness", "intuition", "receptivity", "grace"]
    },
    
    // Septile Aspects
    Septile: {
      meaning: "Mystical inspiration and spiritual insight",
      energy: "neutral" as const,
      keywords: ["mystical", "inspiration", "spirituality", "insight", "destiny"]
    },
    Biseptile: {
      meaning: "Spiritual development and karma",
      energy: "neutral" as const,
      keywords: ["karma", "development", "purpose", "destiny", "evolution"]
    },
    Triseptile: {
      meaning: "Spiritual mastery and enlightenment",
      energy: "neutral" as const,
      keywords: ["mastery", "enlightenment", "wisdom", "transcendence", "fulfillment"]
    },
    
    // Novile Aspects
    Novile: {
      meaning: "Spiritual completion and perfection",
      energy: "harmonious" as const,
      keywords: ["completion", "perfection", "spirituality", "idealism", "vision"]
    },
    Binovile: {
      meaning: "Spiritual creativity and inspiration",
      energy: "harmonious" as const,
      keywords: ["inspiration", "creativity", "vision", "idealism", "transcendence"]
    },
    Quadrinovile: {
      meaning: "Spiritual manifestation and realization",
      energy: "harmonious" as const,
      keywords: ["manifestation", "realization", "completion", "achievement", "mastery"]
    }
  };

  private static planetaryNatures = {
    Sun: { nature: "core identity, vitality, ego, life force", element: "fire" },
    Moon: { nature: "emotions, instincts, subconscious, nurturing", element: "water" },
    Mercury: { nature: "communication, intellect, learning, adaptability", element: "air" },
    Venus: { nature: "love, beauty, values, relationships, harmony", element: "earth" },
    Mars: { nature: "action, desire, aggression, courage, passion", element: "fire" },
    Jupiter: { nature: "expansion, wisdom, optimism, growth, abundance", element: "fire" },
    Saturn: { nature: "structure, discipline, responsibility, limitation, mastery", element: "earth" },
    Uranus: { nature: "innovation, revolution, independence, awakening", element: "air" },
    Neptune: { nature: "spirituality, illusion, compassion, transcendence", element: "water" },
    Pluto: { nature: "transformation, power, regeneration, depth", element: "water" },
    Chiron: { nature: "healing, teaching, wounding, wisdom", element: "earth" },
    Ceres: { nature: "nurturing, cycles, mother earth, sustenance", element: "earth" },
    Vesta: { nature: "devotion, focus, sacred flame, service", element: "fire" },
    Pallas: { nature: "wisdom, strategy, creative intelligence", element: "air" }
  };

  static generateInterpretation(body1: string, aspectType: string, body2: string): AspectInterpretation {
    const aspectData = this.aspectMeanings[aspectType as keyof typeof this.aspectMeanings];
    const planet1 = this.planetaryNatures[body1 as keyof typeof this.planetaryNatures];
    const planet2 = this.planetaryNatures[body2 as keyof typeof this.planetaryNatures];

    if (!aspectData || !planet1 || !planet2) {
      return {
        body1,
        aspect: aspectType,
        body2,
        aspectName: aspectType,
        interpretation: `${body1} ${aspectType} ${body2}: This aspect combines the energies of ${body1} and ${body2} in a ${aspectType} relationship.`,
        energy: 'neutral',
        keywords: ['connection', 'relationship', 'energy']
      };
    }

    // Generate comprehensive interpretation
    const interpretation = this.createDetailedInterpretation(
      body1, body2, aspectType, aspectData, planet1, planet2
    );

    return {
      body1,
      aspect: aspectType,
      body2,
      aspectName: aspectType,
      interpretation,
      energy: aspectData.energy,
      keywords: aspectData.keywords
    };
  }

  private static createDetailedInterpretation(
    body1: string, 
    body2: string, 
    aspectType: string,
    aspectData: any,
    planet1: any,
    planet2: any
  ): string {
    const energyDescription = aspectData.energy === 'harmonious' ? 
      'flows smoothly and naturally' : 
      aspectData.energy === 'challenging' ? 
      'creates dynamic tension that motivates growth' : 
      'blends energies in a unique way';

    return `The ${aspectType} between ${body1} and ${body2} ${energyDescription}. ${body1} represents ${planet1.nature}, while ${body2} embodies ${planet2.nature}. ${aspectData.meaning}. This aspect encourages ${aspectData.keywords.slice(0, 3).join(', ')}, creating opportunities for personal development through the integration of these planetary energies.`;
  }

  // Get enhanced interpretation using Astrology Vault data
  static getEnhancedInterpretation(body1: string, aspectType: string, body2: string): AspectInterpretation {
    const baseInterpretation = this.generateInterpretation(body1, aspectType, body2);
    
    try {
      // Enhance with specific planetary data from the vault
      const planet1Data = AstrologyDataService.getPlanetData(body1);
      const planet2Data = AstrologyDataService.getPlanetData(body2);
      const aspectTypeData = AstrologyDataService.getAspectData(aspectType);

      if (planet1Data?.keywords && planet2Data?.keywords) {
        const enhancedKeywords = [
          ...baseInterpretation.keywords,
          ...(planet1Data.keywords || []).slice(0, 2),
          ...(planet2Data.keywords || []).slice(0, 2)
        ].filter((keyword, index, array) => array.indexOf(keyword) === index);

        return {
          ...baseInterpretation,
          keywords: enhancedKeywords.slice(0, 8),
          interpretation: `${baseInterpretation.interpretation} ${aspectTypeData?.meaning || ''} ${planet1Data?.meaning || ''} ${planet2Data?.meaning || ''}`
        };
      }
    } catch (error) {
      console.warn('Could not enhance interpretation with vault data:', error);
    }

    return baseInterpretation;
  }

  // Cache for storing interpretations to avoid regeneration
  private static interpretationCache = new Map<string, AspectInterpretation>();

  static getCachedInterpretation(body1: string, aspectType: string, body2: string): AspectInterpretation {
    const key = `${body1}-${aspectType}-${body2}`;
    
    if (this.interpretationCache.has(key)) {
      return this.interpretationCache.get(key)!;
    }

    const interpretation = this.getEnhancedInterpretation(body1, aspectType, body2);
    this.interpretationCache.set(key, interpretation);
    
    return interpretation;
  }
}