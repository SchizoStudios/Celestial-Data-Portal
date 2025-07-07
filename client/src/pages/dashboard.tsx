import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, Share2, Globe, Plus, Download, Calendar, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLocation, setSelectedLocation] = useState("New York, NY");
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [selectedTime, setSelectedTime] = useState("12:00");

  const handleLocationChange = (value: string) => {
    if (value === "Custom Location...") {
      setShowCustomLocation(true);
      setSelectedLocation("");
    } else {
      setShowCustomLocation(false);
      setSelectedLocation(value);
    }
  };

  // Get current location for API call
  const currentLocation = showCustomLocation ? customLocation : selectedLocation;

  // Fetch ephemeris data for today
  const { data: ephemerisData, isLoading: ephemerisLoading } = useQuery({
    queryKey: ["/api/ephemeris", { 
      date: selectedDate,
      location: currentLocation
    }],
    enabled: !!currentLocation, // Only fetch when we have a location
  });

  // Fetch current aspects
  const { data: currentAspects, isLoading: aspectsLoading } = useQuery({
    queryKey: ["/api/ephemeris/current-aspects"],
  });

  // Fetch natal charts
  const { data: natalCharts } = useQuery({
    queryKey: ["/api/natal-charts"],
  });

  const getAspectColor = (aspectType: string) => {
    switch (aspectType) {
      case "Conjunction": return "bg-red-400";
      case "Opposition": return "bg-red-400";
      case "Square": return "bg-red-400";
      case "Trine": return "bg-blue-400";
      case "Sextile": return "bg-green-400";
      default: return "bg-gray-400";
    }
  };

  const getAspectStatus = (orb: number) => {
    if (orb < 1) return { label: "Exact", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" };
    if (orb < 3) return { label: "Applying", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" };
    return { label: "Separating", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" };
  };

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Astronomical Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Real-time celestial data and astrological insights</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/natal-charts">
              <Button className="bg-celestial-blue hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Chart
              </Button>
            </Link>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Date and Location Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-celestial-blue" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-celestial-blue" />
                {showCustomLocation ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter custom location..."
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="w-48"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowCustomLocation(false);
                        setSelectedLocation("New York, NY");
                        setCustomLocation("");
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                ) : (
                  <Select value={selectedLocation} onValueChange={handleLocationChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New York, NY">New York, NY</SelectItem>
                      <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                      <SelectItem value="London, UK">London, UK</SelectItem>
                      <SelectItem value="Paris, France">Paris, France</SelectItem>
                      <SelectItem value="Tokyo, Japan">Tokyo, Japan</SelectItem>
                      <SelectItem value="Sydney, Australia">Sydney, Australia</SelectItem>
                      <SelectItem value="Custom Location...">Custom Location...</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-celestial-blue" />
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-auto"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Solar/Lunar Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="text-stellar-amber mr-2 h-5 w-5" />
              Solar & Lunar Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ephemerisLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sunrise</span>
                  <span className="font-medium">{ephemerisData?.solarData?.sunrise || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sunset</span>
                  <span className="font-medium">{ephemerisData?.solarData?.sunset || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Day Length</span>
                  <span className="font-medium">{ephemerisData?.solarData?.dayLength || "N/A"}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Moonrise</span>
                  <span className="font-medium">{ephemerisData?.lunarData?.moonrise || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Moonset</span>
                  <span className="font-medium">{ephemerisData?.lunarData?.moonset || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Moon Phase</span>
                  <span className="font-medium flex items-center">
                    🌔 {ephemerisData?.lunarData?.phase || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Illumination</span>
                  <span className="font-medium">{ephemerisData?.lunarData?.illumination || 0}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Aspects Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="text-mystical-purple mr-2 h-5 w-5" />
              Current Aspects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aspectsLoading ? (
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : currentAspects && currentAspects.length > 0 ? (
              <div className="space-y-3">
                {currentAspects.slice(0, 3).map((aspect: any, index: number) => {
                  const status = getAspectStatus(aspect.orb);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${getAspectColor(aspect.aspectType)} rounded-full`}></div>
                        <div>
                          <p className="font-medium text-sm">
                            {aspect.body1} {aspect.aspectSymbol} {aspect.body2}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Orb: {aspect.orb.toFixed(1)}°
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
                <Link href="/aspect-monitor">
                  <Button variant="link" className="w-full text-celestial-blue hover:text-blue-700">
                    View All Aspects →
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No current aspects found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Planetary Positions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="text-celestial-blue mr-2 h-5 w-5" />
              Planetary Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ephemerisLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : ephemerisData?.planetaryPositions ? (
              <div className="space-y-2">
                {ephemerisData.planetaryPositions.slice(0, 5).map((planet: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{planet.symbol}</span>
                      <span className="font-medium text-sm">{planet.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {planet.degree}°{planet.minute.toString().padStart(2, '0')}' {planet.signSymbol}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {planet.house || "N/A"} House
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="w-full text-celestial-blue hover:text-blue-700 mt-3">
                  View Full Ephemeris →
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No planetary data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Charts */}
      {natalCharts && natalCharts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Natal Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {natalCharts.slice(0, 6).map((chart: any) => (
                <div key={chart.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">{chart.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(chart.birthDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{chart.birthLocation}</p>
                  <div className="mt-2 flex space-x-2">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" variant="outline">Export</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
