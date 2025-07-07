import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface EphemerisData {
  date: string;
  location: string;
  solarData: {
    sunrise: string;
    sunset: string;
    dayLength: string;
  };
  lunarData: {
    moonrise: string;
    moonset: string;
    phase: string;
    illumination: number;
  };
  planetaryPositions: Array<{
    name: string;
    symbol: string;
    longitude: number;
    sign: string;
    signSymbol: string;
    degree: number;
    minute: number;
    house?: number;
  }>;
}

export default function EphemerisPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("New York, NY");
  const [latitude, setLatitude] = useState("40.7128");
  const [longitude, setLongitude] = useState("-74.0060");

  // Fetch ephemeris data
  const { data: ephemerisData, isLoading } = useQuery<EphemerisData>({
    queryKey: ["/api/ephemeris", selectedDate, latitude, longitude],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: selectedDate,
        lat: latitude,
        lng: longitude,
        location: location
      });
      const response = await fetch(`/api/ephemeris?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ephemeris data');
      return response.json();
    }
  });

  const formatDegrees = (degrees: number, minutes: number) => {
    return `${degrees}°${minutes.toString().padStart(2, '0')}'`;
  };

  const getMoonPhaseEmoji = (phase: string) => {
    const phases: { [key: string]: string } = {
      'New Moon': '🌑',
      'Waxing Crescent': '🌒',
      'First Quarter': '🌓',
      'Waxing Gibbous': '🌔',
      'Full Moon': '🌕',
      'Waning Gibbous': '🌖',
      'Last Quarter': '🌗',
      'Waning Crescent': '🌘'
    };
    return phases[phase] || '🌙';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Full Ephemeris</h1>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Ephemeris Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : ephemerisData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solar Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                ☀️ Solar Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sunrise:</span>
                <span className="font-medium">{ephemerisData.solarData.sunrise}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sunset:</span>
                <span className="font-medium">{ephemerisData.solarData.sunset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Day Length:</span>
                <span className="font-medium">{ephemerisData.solarData.dayLength}</span>
              </div>
            </CardContent>
          </Card>

          {/* Lunar Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                🌙 Lunar Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Moonrise:</span>
                <span className="font-medium">{ephemerisData.lunarData.moonrise}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Moonset:</span>
                <span className="font-medium">{ephemerisData.lunarData.moonset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phase:</span>
                <span className="font-medium flex items-center">
                  {getMoonPhaseEmoji(ephemerisData.lunarData.phase)} {ephemerisData.lunarData.phase}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Illumination:</span>
                <span className="font-medium">{Math.round(ephemerisData.lunarData.illumination * 100)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Planetary Positions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Planetary Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Planet</th>
                      <th className="text-left py-2">Sign</th>
                      <th className="text-left py-2">Position</th>
                      <th className="text-left py-2">Longitude</th>
                      <th className="text-left py-2">House</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ephemerisData.planetaryPositions.map((planet, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 flex items-center">
                          <span className="text-lg mr-2">{planet.symbol}</span>
                          <span className="font-medium">{planet.name}</span>
                        </td>
                        <td className="py-3">
                          <span className="flex items-center">
                            <span className="text-lg mr-2">{planet.signSymbol}</span>
                            <span>{planet.sign}</span>
                          </span>
                        </td>
                        <td className="py-3 font-mono">
                          {formatDegrees(planet.degree, planet.minute)}
                        </td>
                        <td className="py-3 font-mono text-sm text-gray-600 dark:text-gray-400">
                          {planet.longitude.toFixed(4)}°
                        </td>
                        <td className="py-3">
                          {planet.house ? `House ${planet.house}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
            No ephemeris data available for the selected date and location.
          </CardContent>
        </Card>
      )}
    </div>
  );
}