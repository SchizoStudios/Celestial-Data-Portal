import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Settings, MapPin, Clock, Info, AlertCircle } from "lucide-react";
import { CELESTIAL_BODIES, ASPECT_CATEGORIES } from "@shared/schema";
import { LocationService, type LocationResult } from "@/lib/location-service";

interface DashboardSettings {
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  useCurrentTime: boolean;
  customTime: string;
  zodiacSystem: 'tropical' | 'sidereal' | 'both';
  houseSystem: string;
  enabledBodies: string[];
  enabledAspectCategories: string[];
}

const HOUSE_SYSTEMS = {
  'placidus': {
    name: 'Placidus',
    description: 'Most popular modern system. Divides houses based on time rather than space. Best for psychological interpretation and personal development.',
    uses: ['Personal psychology', 'Life events timing', 'Modern astrology']
  },
  'koch': {
    name: 'Koch',
    description: 'Time-based system similar to Placidus but with different calculations. Good for natal chart interpretation.',
    uses: ['Natal charts', 'Personal analysis', 'European astrology']
  },
  'equal': {
    name: 'Equal House',
    description: 'Each house is exactly 30 degrees. Simple and traditional. Ascendant always starts 1st house.',
    uses: ['Traditional astrology', 'Simple interpretation', 'Beginners']
  },
  'whole-sign': {
    name: 'Whole Sign',
    description: 'Ancient system where each sign is one house. Ascendant\'s sign becomes the entire 1st house.',
    uses: ['Hellenistic astrology', 'Traditional interpretation', 'Ancient techniques']
  },
  'campanus': {
    name: 'Campanus',
    description: 'Divides houses by great circles through the celestial poles. Good for location-specific interpretation.',
    uses: ['Locational astrology', 'Event charts', 'Medieval techniques']
  },
  'regiomontanus': {
    name: 'Regiomontanus',
    description: 'Divides the celestial equator into equal parts. Popular in medieval and Renaissance astrology.',
    uses: ['Historical charts', 'Medieval astrology', 'Academic study']
  },
  'topocentric': {
    name: 'Topocentric',
    description: 'Modern system accounting for Earth\'s rotation and observer\'s location. Very precise for timing.',
    uses: ['Precise timing', 'Scientific astrology', 'Research']
  }
};

interface DashboardSettingsProps {
  settings: DashboardSettings;
  onSettingsChange: (settings: DashboardSettings) => void;
  isTimeNotCurrent: boolean;
}

export default function DashboardSettingsComponent({ 
  settings, 
  onSettingsChange, 
  isTimeNotCurrent 
}: DashboardSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<DashboardSettings>(settings);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationResult[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handle location search
  const handleLocationSearch = async (value: string) => {
    setLocalSettings(prev => ({ ...prev, location: value }));
    
    if (value.length > 2) {
      setIsLoadingLocation(true);
      try {
        const results = await LocationService.searchLocations(value);
        setLocationSuggestions(results);
        setShowLocationSuggestions(results.length > 0);
      } catch (error) {
        console.error('Location search failed:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const selectLocation = (location: LocationResult) => {
    const newSettings = {
      ...localSettings,
      location: location.name,
      latitude: location.lat,
      longitude: location.lng
    };
    setLocalSettings(newSettings);
    
    // Save location to localStorage for persistence
    localStorage.setItem('persistentLocation', JSON.stringify({
      location: location.name,
      latitude: location.lat,
      longitude: location.lng
    }));
    
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  // Get current location
  const handleCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await LocationService.getCurrentLocation();
      if (position) {
        const locationName = await LocationService.reverseGeocode(position.lat, position.lng);
        const newSettings = {
          ...localSettings,
          location: locationName,
          latitude: position.lat,
          longitude: position.lng
        };
        setLocalSettings(newSettings);
        
        // Save location to localStorage for persistence
        localStorage.setItem('persistentLocation', JSON.stringify({
          location: locationName,
          latitude: position.lat,
          longitude: position.lng
        }));
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Toggle celestial body
  const toggleBody = (body: string, enabled: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      enabledBodies: enabled 
        ? [...prev.enabledBodies, body]
        : prev.enabledBodies.filter(b => b !== body)
    }));
  };

  // Toggle aspect category
  const toggleAspectCategory = (category: string, enabled: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      enabledAspectCategories: enabled
        ? [...prev.enabledAspectCategories, category]
        : prev.enabledAspectCategories.filter(c => c !== category)
    }));
  };

  // Apply settings
  const applySettings = () => {
    onSettingsChange(localSettings);
    setIsOpen(false);
  };

  // Reset to current time
  const resetToCurrentTime = () => {
    setLocalSettings(prev => ({
      ...prev,
      useCurrentTime: true,
      customTime: ''
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Settings className="h-4 w-4 mr-2" />
          Dashboard Settings
          {isTimeNotCurrent && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 w-2 h-2 p-0">
              <span className="sr-only">Time not current</span>
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogDescription>
            Customize your dashboard display preferences and calculation methods.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-2" />
                Location Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="location">Location</Label>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCurrentLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? 'Locating...' : 'Use Current'}
                  </Button>
                </div>
                <Input
                  id="location"
                  value={localSettings.location}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder="Search for any location worldwide..."
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {locationSuggestions.map((location, index) => (
                      <div
                        key={index}
                        onClick={() => selectLocation(location)}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="font-medium text-sm">{location.name}</div>
                        <div className="text-xs text-gray-500">
                          {location.country} • {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={localSettings.latitude}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      latitude: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={localSettings.longitude}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      longitude: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2" />
                Time Settings
                {isTimeNotCurrent && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Current
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Use Current Time</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically use current time based on location
                  </p>
                </div>
                <Switch
                  checked={localSettings.useCurrentTime}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({
                    ...prev,
                    useCurrentTime: checked,
                    customTime: checked ? '' : prev.customTime
                  }))}
                />
              </div>
              {!localSettings.useCurrentTime && (
                <div>
                  <Label htmlFor="customTime">Custom Time</Label>
                  <Input
                    id="customTime"
                    type="time"
                    value={localSettings.customTime}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      customTime: e.target.value 
                    }))}
                  />
                </div>
              )}
              {isTimeNotCurrent && (
                <Button onClick={resetToCurrentTime} variant="outline" size="sm">
                  Reset to Current Time
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Zodiac System */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zodiac System</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={localSettings.zodiacSystem} 
                onValueChange={(value: 'tropical' | 'sidereal' | 'both') => 
                  setLocalSettings(prev => ({ ...prev, zodiacSystem: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tropical">Tropical (Western)</SelectItem>
                  <SelectItem value="sidereal">Sidereal (Vedic)</SelectItem>
                  <SelectItem value="both">Both Systems</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* House System */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">House Calculation System</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={localSettings.houseSystem} 
                onValueChange={(value) => 
                  setLocalSettings(prev => ({ ...prev, houseSystem: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HOUSE_SYSTEMS).map(([key, system]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center justify-between w-full">
                        <span>{system.name}</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2 h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Info className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{system.name} House System</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <p className="text-sm">{system.description}</p>
                              <div>
                                <h4 className="font-medium text-sm mb-2">Best Uses:</h4>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                  {system.uses.map((use, index) => (
                                    <li key={index}>• {use}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Celestial Bodies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Celestial Bodies to Display</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CELESTIAL_BODIES.map((body) => (
                  <div key={body} className="flex items-center space-x-2">
                    <Checkbox
                      id={`body-${body}`}
                      checked={localSettings.enabledBodies.includes(body)}
                      onCheckedChange={(checked) => toggleBody(body, !!checked)}
                    />
                    <Label htmlFor={`body-${body}`} className="text-sm">{body}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aspect Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aspect Categories to Display</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.keys(ASPECT_CATEGORIES).map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={localSettings.enabledAspectCategories.includes(category)}
                      onCheckedChange={(checked) => toggleAspectCategory(category, !!checked)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm font-medium">
                      {category} Aspects
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={applySettings}>
            Apply Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}