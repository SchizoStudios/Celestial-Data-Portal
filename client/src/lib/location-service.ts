// Comprehensive location service with real mapping APIs
export interface LocationResult {
  name: string;
  lat: number;
  lng: number;
  country: string;
  region?: string;
  displayName: string;
}

export class LocationService {
  private static cache = new Map<string, LocationResult[]>();
  
  // Detect device type for appropriate mapping service
  static isAppleDevice(): boolean {
    return /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
  }

  // Get current location using browser geolocation
  static async getCurrentLocation(): Promise<{lat: number, lng: number} | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  // Search locations using appropriate mapping service
  static async searchLocations(query: string): Promise<LocationResult[]> {
    if (query.length < 3) return [];

    // Check cache first
    const cacheKey = query.toLowerCase();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      let results: LocationResult[] = [];

      // Try different geocoding services based on device and availability
      if (this.isAppleDevice()) {
        results = await this.searchAppleMaps(query);
      }
      
      // Fallback to OpenStreetMap Nominatim (free, no API key required)
      if (results.length === 0) {
        results = await this.searchNominatim(query);
      }

      // Cache results
      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.warn('Location search failed:', error);
      return this.getFallbackLocations(query);
    }
  }

  // Apple Maps search (uses MapKit JS when available)
  private static async searchAppleMaps(query: string): Promise<LocationResult[]> {
    // Apple Maps requires MapKit JS which needs developer token
    // For now, we'll implement a basic search that could be enhanced
    return [];
  }

  // OpenStreetMap Nominatim search (free geocoding service)
  private static async searchNominatim(query: string): Promise<LocationResult[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AstrologyApp/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Nominatim API failed');

      const data = await response.json();
      return data.map((item: any) => ({
        name: this.formatLocationName(item),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        country: item.address?.country || 'Unknown',
        region: item.address?.state || item.address?.region,
        displayName: item.display_name
      })).slice(0, 8);
    } catch (error) {
      console.warn('Nominatim search failed:', error);
      return [];
    }
  }

  // Format location name for display
  private static formatLocationName(item: any): string {
    const address = item.address || {};
    const parts = [];

    if (address.city) parts.push(address.city);
    else if (address.town) parts.push(address.town);
    else if (address.village) parts.push(address.village);
    
    if (address.state) parts.push(address.state);
    else if (address.region) parts.push(address.region);
    
    if (address.country) parts.push(address.country);

    return parts.join(', ') || item.display_name?.split(',')[0] || 'Unknown Location';
  }

  // Fallback locations database for offline/emergency use
  private static getFallbackLocations(query: string): LocationResult[] {
    const fallbackDB = [
      // Major US Cities
      { name: "New York, NY", lat: 40.7128, lng: -74.0060, country: "USA", region: "NY" },
      { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437, country: "USA", region: "CA" },
      { name: "Chicago, IL", lat: 41.8781, lng: -87.6298, country: "USA", region: "IL" },
      { name: "Houston, TX", lat: 29.7604, lng: -95.3698, country: "USA", region: "TX" },
      { name: "Phoenix, AZ", lat: 33.4484, lng: -112.0740, country: "USA", region: "AZ" },
      { name: "Philadelphia, PA", lat: 39.9526, lng: -75.1652, country: "USA", region: "PA" },
      { name: "San Antonio, TX", lat: 29.4241, lng: -98.4936, country: "USA", region: "TX" },
      { name: "San Diego, CA", lat: 32.7157, lng: -117.1611, country: "USA", region: "CA" },
      { name: "Dallas, TX", lat: 32.7767, lng: -96.7970, country: "USA", region: "TX" },
      { name: "San Jose, CA", lat: 37.3382, lng: -121.8863, country: "USA", region: "CA" },
      { name: "Austin, TX", lat: 30.2672, lng: -97.7431, country: "USA", region: "TX" },
      { name: "Jacksonville, FL", lat: 30.3322, lng: -81.6557, country: "USA", region: "FL" },
      { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194, country: "USA", region: "CA" },
      { name: "Columbus, OH", lat: 39.9612, lng: -82.9988, country: "USA", region: "OH" },
      { name: "Fort Worth, TX", lat: 32.7555, lng: -97.3308, country: "USA", region: "TX" },
      { name: "Indianapolis, IN", lat: 39.7684, lng: -86.1581, country: "USA", region: "IN" },
      { name: "Charlotte, NC", lat: 35.2271, lng: -80.8431, country: "USA", region: "NC" },
      { name: "Seattle, WA", lat: 47.6062, lng: -122.3321, country: "USA", region: "WA" },
      { name: "Denver, CO", lat: 39.7392, lng: -104.9903, country: "USA", region: "CO" },
      { name: "Boston, MA", lat: 42.3601, lng: -71.0589, country: "USA", region: "MA" },
      
      // International Cities
      { name: "London, UK", lat: 51.5074, lng: -0.1278, country: "United Kingdom", region: "England" },
      { name: "Paris, France", lat: 48.8566, lng: 2.3522, country: "France", region: "Île-de-France" },
      { name: "Berlin, Germany", lat: 52.5200, lng: 13.4050, country: "Germany", region: "Berlin" },
      { name: "Madrid, Spain", lat: 40.4168, lng: -3.7038, country: "Spain", region: "Madrid" },
      { name: "Rome, Italy", lat: 41.9028, lng: 12.4964, country: "Italy", region: "Lazio" },
      { name: "Amsterdam, Netherlands", lat: 52.3676, lng: 4.9041, country: "Netherlands", region: "North Holland" },
      { name: "Vienna, Austria", lat: 48.2082, lng: 16.3738, country: "Austria", region: "Vienna" },
      { name: "Brussels, Belgium", lat: 50.8503, lng: 4.3517, country: "Belgium", region: "Brussels" },
      { name: "Prague, Czech Republic", lat: 50.0755, lng: 14.4378, country: "Czech Republic", region: "Prague" },
      { name: "Stockholm, Sweden", lat: 59.3293, lng: 18.0686, country: "Sweden", region: "Stockholm" },
      { name: "Copenhagen, Denmark", lat: 55.6761, lng: 12.5683, country: "Denmark", region: "Capital Region" },
      { name: "Oslo, Norway", lat: 59.9139, lng: 10.7522, country: "Norway", region: "Oslo" },
      { name: "Helsinki, Finland", lat: 60.1699, lng: 24.9384, country: "Finland", region: "Uusimaa" },
      { name: "Warsaw, Poland", lat: 52.2297, lng: 21.0122, country: "Poland", region: "Mazovia" },
      { name: "Budapest, Hungary", lat: 47.4979, lng: 19.0402, country: "Hungary", region: "Budapest" },
      
      // Asia-Pacific
      { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, country: "Japan", region: "Tokyo" },
      { name: "Seoul, South Korea", lat: 37.5665, lng: 126.9780, country: "South Korea", region: "Seoul" },
      { name: "Beijing, China", lat: 39.9042, lng: 116.4074, country: "China", region: "Beijing" },
      { name: "Shanghai, China", lat: 31.2304, lng: 121.4737, country: "China", region: "Shanghai" },
      { name: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "Hong Kong", region: "Hong Kong" },
      { name: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore", region: "Singapore" },
      { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, country: "Australia", region: "NSW" },
      { name: "Melbourne, Australia", lat: -37.8136, lng: 144.9631, country: "Australia", region: "VIC" },
      { name: "Mumbai, India", lat: 19.0760, lng: 72.8777, country: "India", region: "Maharashtra" },
      { name: "Delhi, India", lat: 28.7041, lng: 77.1025, country: "India", region: "Delhi" },
      { name: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, country: "Thailand", region: "Bangkok" },
      { name: "Jakarta, Indonesia", lat: -6.2088, lng: 106.8456, country: "Indonesia", region: "Jakarta" },
      
      // Americas
      { name: "Toronto, Canada", lat: 43.6532, lng: -79.3832, country: "Canada", region: "Ontario" },
      { name: "Vancouver, Canada", lat: 49.2827, lng: -123.1207, country: "Canada", region: "BC" },
      { name: "Mexico City, Mexico", lat: 19.4326, lng: -99.1332, country: "Mexico", region: "CDMX" },
      { name: "São Paulo, Brazil", lat: -23.5505, lng: -46.6333, country: "Brazil", region: "SP" },
      { name: "Rio de Janeiro, Brazil", lat: -22.9068, lng: -43.1729, country: "Brazil", region: "RJ" },
      { name: "Buenos Aires, Argentina", lat: -34.6118, lng: -58.3960, country: "Argentina", region: "Buenos Aires" },
      { name: "Lima, Peru", lat: -12.0464, lng: -77.0428, country: "Peru", region: "Lima" },
      { name: "Bogotá, Colombia", lat: 4.7110, lng: -74.0721, country: "Colombia", region: "Bogotá" },
      
      // Africa & Middle East
      { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, country: "Egypt", region: "Cairo" },
      { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241, country: "South Africa", region: "Western Cape" },
      { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708, country: "UAE", region: "Dubai" },
      { name: "Tel Aviv, Israel", lat: 32.0853, lng: 34.7818, country: "Israel", region: "Tel Aviv" },
      { name: "Istanbul, Turkey", lat: 41.0082, lng: 28.9784, country: "Turkey", region: "Istanbul" }
    ];

    const searchLower = query.toLowerCase();
    return fallbackDB
      .filter(location => 
        location.name.toLowerCase().includes(searchLower) ||
        location.country.toLowerCase().includes(searchLower) ||
        (location.region && location.region.toLowerCase().includes(searchLower))
      )
      .map(location => ({
        ...location,
        displayName: `${location.name}, ${location.country}`
      }))
      .slice(0, 8);
  }

  // Reverse geocoding to get location name from coordinates
  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AstrologyApp/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      return this.formatLocationName(data);
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}