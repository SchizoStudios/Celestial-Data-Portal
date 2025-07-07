// Frontend astronomical utilities for calculations and formatting

export interface ZodiacSign {
  name: string;
  symbol: string;
  element: string;
  modality: string;
  ruler: string;
}

export interface PlanetaryPosition {
  name: string;
  symbol: string;
  longitude: number;
  latitude: number;
  sign: string;
  signSymbol: string;
  degree: number;
  minute: number;
  house?: number;
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

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: "Aries", symbol: "♈", element: "Fire", modality: "Cardinal", ruler: "Mars" },
  { name: "Taurus", symbol: "♉", element: "Earth", modality: "Fixed", ruler: "Venus" },
  { name: "Gemini", symbol: "♊", element: "Air", modality: "Mutable", ruler: "Mercury" },
  { name: "Cancer", symbol: "♋", element: "Water", modality: "Cardinal", ruler: "Moon" },
  { name: "Leo", symbol: "♌", element: "Fire", modality: "Fixed", ruler: "Sun" },
  { name: "Virgo", symbol: "♍", element: "Earth", modality: "Mutable", ruler: "Mercury" },
  { name: "Libra", symbol: "♎", element: "Air", modality: "Cardinal", ruler: "Venus" },
  { name: "Scorpio", symbol: "♏", element: "Water", modality: "Fixed", ruler: "Mars" },
  { name: "Sagittarius", symbol: "♐", element: "Fire", modality: "Mutable", ruler: "Jupiter" },
  { name: "Capricorn", symbol: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn" },
  { name: "Aquarius", symbol: "♒", element: "Air", modality: "Fixed", ruler: "Saturn" },
  { name: "Pisces", symbol: "♓", element: "Water", modality: "Mutable", ruler: "Jupiter" },
];

export const PLANET_SYMBOLS: { [key: string]: string } = {
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
  Vesta: "⚴",
  Pallas: "⚵",
};

export const ASPECT_SYMBOLS: { [key: string]: string } = {
  Conjunction: "☌",
  Opposition: "☍",
  Trine: "△",
  Square: "☐",
  Sextile: "⚹",
  Quincunx: "⚻",
};

export const HOUSE_MEANINGS = [
  "Self, Identity, First Impressions",
  "Money, Possessions, Values",
  "Communication, Siblings, Short Trips",
  "Home, Family, Roots",
  "Creativity, Children, Romance",
  "Health, Work, Daily Routine",
  "Partnerships, Marriage, Open Enemies",
  "Transformation, Shared Resources, Death",
  "Philosophy, Higher Education, Long Trips",
  "Career, Reputation, Public Image",
  "Friends, Groups, Hopes and Dreams",
  "Spirituality, Hidden Enemies, Subconscious",
];

// Utility functions
export function degreesToDegreeMinute(degrees: number): { degree: number; minute: number } {
  const degree = Math.floor(degrees);
  const minute = Math.round((degrees - degree) * 60);
  return { degree, minute };
}

export function getZodiacSign(longitude: number): ZodiacSign {
  const signIndex = Math.floor(longitude / 30);
  return ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
}

export function formatDegree(longitude: number): string {
  const sign = getZodiacSign(longitude);
  const degreeInSign = longitude % 30;
  const { degree, minute } = degreesToDegreeMinute(degreeInSign);
  return `${degree}°${minute.toString().padStart(2, '0')}' ${sign.symbol}`;
}

export function calculateMidpoint(pos1: number, pos2: number): number {
  let midpoint = (pos1 + pos2) / 2;
  
  // Handle the case where positions are on opposite sides of 0°
  if (Math.abs(pos1 - pos2) > 180) {
    midpoint = (midpoint + 180) % 360;
  }
  
  return midpoint;
}

export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

export function calculateAspectAngle(pos1: number, pos2: number): number {
  const diff = Math.abs(pos1 - pos2);
  return Math.min(diff, 360 - diff);
}

export function getAspectColor(aspectType: string): string {
  switch (aspectType) {
    case "Conjunction":
      return "#ef4444"; // red
    case "Opposition":
      return "#ef4444"; // red
    case "Square":
      return "#ef4444"; // red
    case "Trine":
      return "#3b82f6"; // blue
    case "Sextile":
      return "#10b981"; // green
    case "Quincunx":
      return "#8b5cf6"; // purple
    default:
      return "#6b7280"; // gray
  }
}

export function getElementColor(element: string): string {
  switch (element) {
    case "Fire":
      return "#ef4444"; // red
    case "Earth":
      return "#10b981"; // green
    case "Air":
      return "#3b82f6"; // blue
    case "Water":
      return "#8b5cf6"; // purple
    default:
      return "#6b7280"; // gray
  }
}

export function calculateHousePosition(longitude: number, ascendant: number): number {
  // Simplified house calculation (equal house system)
  const houseSize = 30; // degrees per house
  const relativePosition = normalizeAngle(longitude - ascendant);
  return Math.floor(relativePosition / houseSize) + 1;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getMoonPhaseEmoji(phase: string): string {
  switch (phase) {
    case "New Moon":
      return "🌑";
    case "Waxing Crescent":
      return "🌒";
    case "First Quarter":
      return "🌓";
    case "Waxing Gibbous":
      return "🌔";
    case "Full Moon":
      return "🌕";
    case "Waning Gibbous":
      return "🌖";
    case "Last Quarter":
      return "🌗";
    case "Waning Crescent":
      return "🌘";
    default:
      return "🌙";
  }
}
