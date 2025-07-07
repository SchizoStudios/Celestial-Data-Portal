// Astronomical calculation service using simplified algorithms
// In production, this would use Swiss Ephemeris or similar libraries

export interface PlanetaryPosition {
  name: string;
  symbol: string;
  longitude: number; // 0-360 degrees
  latitude: number;
  sign: string;
  signSymbol: string;
  degree: number;
  minute: number;
  house?: number;
}

export interface SolarData {
  sunrise: string;
  sunset: string;
  dayLength: string;
}

export interface LunarData {
  moonrise: string;
  moonset: string;
  phase: string;
  illumination: number;
}

export interface AspectData {
  body1: string;
  body2: string;
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  exact: boolean;
  applying: boolean;
}

const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈" },
  { name: "Taurus", symbol: "♉" },
  { name: "Gemini", symbol: "♊" },
  { name: "Cancer", symbol: "♋" },
  { name: "Leo", symbol: "♌" },
  { name: "Virgo", symbol: "♍" },
  { name: "Libra", symbol: "♎" },
  { name: "Scorpio", symbol: "♏" },
  { name: "Sagittarius", symbol: "♐" },
  { name: "Capricorn", symbol: "♑" },
  { name: "Aquarius", symbol: "♒" },
  { name: "Pisces", symbol: "♓" },
];

const PLANET_SYMBOLS = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  Chiron: "⚷",
  Ceres: "⚳",
};

export class AstronomicalService {
  
  // Calculate planetary positions for a given date/time/location
  static async calculatePlanetaryPositions(
    date: Date,
    latitude: number,
    longitude: number
  ): Promise<PlanetaryPosition[]> {
    // Simplified calculation - in production would use ephemeris data
    const positions: PlanetaryPosition[] = [];
    
    const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
    
    for (const planet of planets) {
      // Simplified position calculation (would use real ephemeris)
      const basePosition = this.getBasePlanetPosition(planet, date);
      const adjustedPosition = this.adjustForLocation(basePosition, latitude, longitude);
      
      const sign = this.getZodiacSign(adjustedPosition);
      const { degree, minute } = this.degreesToDegreeMinute(adjustedPosition % 30);
      
      positions.push({
        name: planet,
        symbol: PLANET_SYMBOLS[planet as keyof typeof PLANET_SYMBOLS] || planet,
        longitude: adjustedPosition,
        latitude: 0, // Simplified
        sign: sign.name,
        signSymbol: sign.symbol,
        degree,
        minute,
      });
    }
    
    return positions;
  }

  // Calculate solar data (sunrise, sunset)
  static async calculateSolarData(
    date: Date,
    latitude: number,
    longitude: number
  ): Promise<SolarData> {
    // Simplified solar calculation
    const dayOfYear = this.getDayOfYear(date);
    const solarDeclination = 23.45 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);
    
    const hourAngle = Math.acos(
      -Math.tan(latitude * Math.PI / 180) * Math.tan(solarDeclination * Math.PI / 180)
    );
    
    const sunriseHour = 12 - hourAngle * 12 / Math.PI;
    const sunsetHour = 12 + hourAngle * 12 / Math.PI;
    
    // Adjust for longitude and timezone
    const timeOffset = longitude / 15; // Basic timezone adjustment
    
    const sunrise = this.formatTime(sunriseHour - timeOffset);
    const sunset = this.formatTime(sunsetHour - timeOffset);
    const dayLength = this.calculateDayLength(sunriseHour, sunsetHour);
    
    return { sunrise, sunset, dayLength };
  }

  // Calculate lunar data (moonrise, moonset, phase)
  static async calculateLunarData(
    date: Date,
    latitude: number,
    longitude: number
  ): Promise<LunarData> {
    // Simplified lunar calculation
    const daysSinceNewMoon = (date.getTime() - new Date(2024, 0, 11).getTime()) / (1000 * 60 * 60 * 24);
    const lunarCycle = 29.53059; // Average lunar cycle
    const phase = (daysSinceNewMoon % lunarCycle) / lunarCycle;
    
    const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) * 50);
    
    // Simplified moonrise/moonset calculation
    const moonriseHour = 18 + (phase * 12); // Simplified
    const moonsetHour = 6 + (phase * 12); // Simplified
    
    return {
      moonrise: this.formatTime(moonriseHour % 24),
      moonset: this.formatTime(moonsetHour % 24),
      phase: this.getMoonPhaseName(phase),
      illumination,
    };
  }

  // Calculate aspects between planets
  static calculateAspects(positions: PlanetaryPosition[], enabledAspects: string[]): AspectData[] {
    const aspects: AspectData[] = [];
    const aspectTypes = [
      // Major Aspects
      { name: "Conjunction", symbol: "☌", degrees: 0, orb: 8 },
      { name: "Opposition", symbol: "☍", degrees: 180, orb: 8 },
      { name: "Sextile", symbol: "⚹", degrees: 60, orb: 4 },
      { name: "Square", symbol: "□", degrees: 90, orb: 6 },
      { name: "Trine", symbol: "△", degrees: 120, orb: 6 },
      
      // Minor Aspects
      { name: "Inconjunction", symbol: "⚻", degrees: 150, orb: 3 },
      { name: "Quindecile", symbol: "24°", degrees: 24, orb: 1 },
      { name: "Semisextile", symbol: "⚺", degrees: 30, orb: 2 },
      { name: "Semisquare", symbol: "◻︎", degrees: 45, orb: 2 },
      { name: "Sesquiquadrate", symbol: "⚼", degrees: 135, orb: 2 },
      
      // Harmonic Aspects
      { name: "Biquintile", symbol: "⛤", degrees: 144, orb: 1 },
      { name: "Decile", symbol: "✷", degrees: 36, orb: 1 },
      { name: "Quintile", symbol: "⬠", degrees: 72, orb: 1 },
      { name: "Tridecile", symbol: "108°", degrees: 108, orb: 1 },
      { name: "Vigintile", symbol: "1/20", degrees: 18, orb: 1 },
      
      // Septile Aspects
      { name: "Biseptile", symbol: "⚯", degrees: 102.86, orb: 1 },
      { name: "Septile", symbol: "⚯", degrees: 51.43, orb: 1 },
      { name: "Triseptile", symbol: "⚯", degrees: 154.29, orb: 1 },
      
      // Novile Aspects
      { name: "Binovile", symbol: "∟", degrees: 80, orb: 1 },
      { name: "Novile", symbol: "☊", degrees: 40, orb: 1 },
      { name: "Quadrinovile", symbol: "⅘", degrees: 160, orb: 1 },
    ];

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const planet1 = positions[i];
        const planet2 = positions[j];
        
        const angle = Math.abs(planet1.longitude - planet2.longitude);
        const normalizedAngle = angle > 180 ? 360 - angle : angle;
        
        for (const aspectType of aspectTypes) {
          if (!enabledAspects.includes(aspectType.name)) continue;
          
          const orb = Math.abs(normalizedAngle - aspectType.degrees);
          if (orb <= aspectType.orb) {
            aspects.push({
              body1: planet1.name,
              body2: planet2.name,
              aspectType: aspectType.name,
              aspectSymbol: aspectType.symbol,
              orb: Math.round(orb * 60) / 60, // Round to minutes
              exact: orb < 1,
              applying: orb > 0, // Simplified
            });
          }
        }
      }
    }
    
    return aspects;
  }

  // Helper methods
  private static getBasePlanetPosition(planet: string, date: Date): number {
    // Simplified ephemeris calculation
    const daysSince2000 = (date.getTime() - new Date(2000, 0, 1).getTime()) / (1000 * 60 * 60 * 24);
    
    const rates: { [key: string]: number } = {
      Sun: 0.9856,
      Moon: 13.1763,
      Mercury: 4.0923,
      Venus: 1.6021,
      Mars: 0.5240,
      Jupiter: 0.0831,
      Saturn: 0.0334,
      Uranus: 0.0117,
      Neptune: 0.0060,
      Pluto: 0.0040,
    };
    
    const basePositions: { [key: string]: number } = {
      Sun: 280,
      Moon: 120,
      Mercury: 50,
      Venus: 180,
      Mars: 350,
      Jupiter: 45,
      Saturn: 120,
      Uranus: 300,
      Neptune: 280,
      Pluto: 250,
    };
    
    const rate = rates[planet] || 1;
    const base = basePositions[planet] || 0;
    
    return (base + rate * daysSince2000) % 360;
  }

  private static adjustForLocation(position: number, latitude: number, longitude: number): number {
    // Simplified location adjustment
    return (position + longitude / 4) % 360;
  }

  private static getZodiacSign(longitude: number): { name: string; symbol: string } {
    const signIndex = Math.floor(longitude / 30);
    return ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
  }

  private static degreesToDegreeMinute(degrees: number): { degree: number; minute: number } {
    const degree = Math.floor(degrees);
    const minute = Math.round((degrees - degree) * 60);
    return { degree, minute };
  }

  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private static formatTime(hour: number): string {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private static calculateDayLength(sunriseHour: number, sunsetHour: number): string {
    const totalMinutes = Math.round((sunsetHour - sunriseHour) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  private static getMoonPhaseName(phase: number): string {
    if (phase < 0.0625) return "New Moon";
    if (phase < 0.1875) return "Waxing Crescent";
    if (phase < 0.3125) return "First Quarter";
    if (phase < 0.4375) return "Waxing Gibbous";
    if (phase < 0.5625) return "Full Moon";
    if (phase < 0.6875) return "Waning Gibbous";
    if (phase < 0.8125) return "Last Quarter";
    return "Waning Crescent";
  }
}
