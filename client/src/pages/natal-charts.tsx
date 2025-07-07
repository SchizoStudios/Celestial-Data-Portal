import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CircleDot, Brain, Save, FileDown, Share, Plus, Edit2, MapPin, AlertCircle } from "lucide-react";
import ChartCanvas from "@/components/chart-canvas";
import { CELESTIAL_BODIES, ASPECT_TYPES, ASPECT_CATEGORIES } from "@shared/schema";
import { LocationService, type LocationResult } from "@/lib/location-service";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NatalCharts() {
  const { toast } = useToast();
  const [selectedChart, setSelectedChart] = useState<number | null>(null);
  const [showNewChart, setShowNewChart] = useState(false);
  const [editingChart, setEditingChart] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  // Form state for new chart
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    latitude: "",
    longitude: "",
    timezone: "UTC",
    enabledBodies: ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"],
    enabledAspects: ["Conjunction", "Opposition", "Trine", "Square"],
  });

  // Location autocomplete state
  const [locationSuggestions, setLocationSuggestions] = useState<LocationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Enhanced location handling with comprehensive mapping APIs

  // Enhanced location handling with real mapping APIs
  const handleLocationChange = async (value: string) => {
    setFormData(prev => ({ ...prev, birthLocation: value }));
    setFormErrors(prev => prev.filter(err => !err.includes('location')));
    
    if (value.length > 2) {
      setIsLoadingLocation(true);
      try {
        const results = await LocationService.searchLocations(value);
        setLocationSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Location search failed:', error);
        setFormErrors(prev => [...prev, 'Location search temporarily unavailable. Please enter coordinates manually.']);
      } finally {
        setIsLoadingLocation(false);
      }
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location: LocationResult) => {
    setFormData(prev => ({
      ...prev,
      birthLocation: location.name,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  // Get current location from browser
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await LocationService.getCurrentLocation();
      if (position) {
        const locationName = await LocationService.reverseGeocode(position.lat, position.lng);
        setFormData(prev => ({
          ...prev,
          birthLocation: locationName,
          latitude: position.lat.toString(),
          longitude: position.lng.toString()
        }));
        toast({ title: "Location detected", description: `Set to ${locationName}` });
      } else {
        setFormErrors(prev => [...prev, 'Unable to access device location. Please search manually.']);
      }
    } catch (error) {
      setFormErrors(prev => [...prev, 'Location detection failed. Please search manually.']);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Fetch natal charts
  const { data: charts, isLoading } = useQuery({
    queryKey: ["/api/natal-charts"],
  });

  // Fetch selected chart details
  const { data: selectedChartData } = useQuery({
    queryKey: ["/api/natal-charts", selectedChart],
    enabled: !!selectedChart,
  });

  // Create chart mutation
  const createChartMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/natal-charts", data);
      return response.json();
    },
    onSuccess: (newChart) => {
      toast({
        title: "Chart Created",
        description: `Natal chart for ${newChart.name} has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/natal-charts"] });
      setShowNewChart(false);
      setEditingChart(null);
      setSelectedChart(newChart.id);
      setFormErrors([]);
    },
    onError: (error) => {
      const errorMessage = error.message || 'Unknown error occurred';
      setFormErrors([`Failed to create chart: ${errorMessage}`]);
      toast({
        title: "Error",
        description: "Failed to create chart: " + errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update chart mutation for editing
  const updateChartMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/natal-charts/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedChart) => {
      toast({
        title: "Chart Updated",
        description: `Natal chart for ${updatedChart.name} has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/natal-charts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/natal-charts", updatedChart.id] });
      setEditingChart(null);
      setShowNewChart(false);
      setFormErrors([]);
    },
    onError: (error) => {
      const errorMessage = error.message || 'Unknown error occurred';
      setFormErrors([`Failed to update chart: ${errorMessage}`]);
      toast({
        title: "Error",
        description: "Failed to update chart: " + errorMessage,
        variant: "destructive",
      });
    },
  });

  // Generate interpretation mutation
  const interpretationMutation = useMutation({
    mutationFn: async (chartId: number) => {
      const response = await apiRequest("POST", `/api/natal-charts/${chartId}/interpretation`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interpretation Generated",
        description: "AI interpretation has been generated for this chart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/natal-charts", selectedChart] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate interpretation: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthDate || !formData.birthLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createChartMutation.mutate({
      ...formData,
      latitude: parseFloat(formData.latitude) || 40.7128,
      longitude: parseFloat(formData.longitude) || -74.0060,
      birthDate: new Date(formData.birthDate),
    });
  };

  const handleBodyToggle = (body: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      enabledBodies: checked 
        ? [...prev.enabledBodies, body]
        : prev.enabledBodies.filter(b => b !== body)
    }));
  };

  const handleAspectToggle = (aspect: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      enabledAspects: checked 
        ? [...prev.enabledAspects, aspect]
        : prev.enabledAspects.filter(a => a !== aspect)
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <CircleDot className="text-mystical-purple mr-3 h-6 w-6" />
            Natal Chart Creation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Create and analyze comprehensive natal charts</p>
        </div>
        <Button 
          onClick={() => setShowNewChart(true)}
          className="bg-mystical-purple hover:bg-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Charts</CardTitle>
          </CardHeader>
          <CardContent>
            {charts && charts.length > 0 ? (
              <div className="space-y-2">
                {charts.map((chart: any) => (
                  <div
                    key={chart.id}
                    onClick={() => setSelectedChart(chart.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChart === chart.id
                        ? "bg-celestial-blue text-white"
                        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <h4 className="font-medium">{chart.name}</h4>
                    <p className="text-sm opacity-75">
                      {new Date(chart.birthDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm opacity-75">{chart.birthLocation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No charts created yet. Create your first chart to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Chart Details or New Chart Form */}
        <div className="lg:col-span-2">
          {showNewChart ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Natal Chart</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Error Display */}
                {formErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Birth Date *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthTime">Birth Time</Label>
                      <Input
                        id="birthTime"
                        type="time"
                        value={formData.birthTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                      />
                    </div>
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="birthLocation">Birth Location *</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleGetCurrentLocation}
                          disabled={isLoadingLocation}
                          className="text-xs"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {isLoadingLocation ? 'Locating...' : 'Use Current'}
                        </Button>
                      </div>
                      <Input
                        id="birthLocation"
                        value={formData.birthLocation}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => formData.birthLocation.length > 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Start typing any city worldwide..."
                        required
                      />
                      {isLoadingLocation && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Searching locations...
                        </div>
                      )}
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-64 overflow-y-auto">
                          {locationSuggestions.map((location, index) => (
                            <div
                              key={index}
                              onClick={() => selectLocation(location)}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                            >
                              <div className="font-medium text-sm">{location.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {location.country} • {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="40.7128 (auto-filled from location)"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Auto-populated when selecting a location, but editable
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="-74.0060 (auto-filled from location)"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Auto-populated when selecting a location, but editable
                      </p>
                    </div>
                  </div>

                  {/* Chart Configuration */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Chart Configuration</h4>
                    
                    {/* Celestial Bodies */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Celestial Bodies</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {CELESTIAL_BODIES.map((body) => (
                          <div key={body} className="flex items-center space-x-2">
                            <Checkbox
                              id={`body-${body}`}
                              checked={formData.enabledBodies.includes(body)}
                              onCheckedChange={(checked) => handleBodyToggle(body, !!checked)}
                            />
                            <Label htmlFor={`body-${body}`} className="text-sm">{body}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aspects by Category */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium mb-2 block">Aspects</Label>
                      {Object.entries(ASPECT_CATEGORIES).map(([categoryName, aspectNames]) => (
                        <div key={categoryName} className="mb-4">
                          <Label className="text-xs font-semibold text-purple-600 mb-1 block">
                            {categoryName} Aspects
                          </Label>
                          <div className="grid grid-cols-2 gap-1">
                            {aspectNames.map((aspectName) => {
                              const aspectData = ASPECT_TYPES[aspectName as keyof typeof ASPECT_TYPES];
                              return (
                                <div key={aspectName} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`aspect-${aspectName}`}
                                    checked={formData.enabledAspects.includes(aspectName)}
                                    onCheckedChange={(checked) => handleAspectToggle(aspectName, !!checked)}
                                  />
                                  <Label htmlFor={`aspect-${aspectName}`} className="text-xs">
                                    {aspectData.symbol} {aspectName} ({aspectData.degrees}°)
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      disabled={createChartMutation.isPending}
                      className="bg-celestial-blue hover:bg-blue-700"
                    >
                      {createChartMutation.isPending ? "Generating..." : "Generate Chart"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowNewChart(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : selectedChartData ? (
            <div className="space-y-6">
              {/* Chart Display */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedChartData.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => interpretationMutation.mutate(selectedChart!)}
                        disabled={interpretationMutation.isPending}
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        {interpretationMutation.isPending ? "Generating..." : "AI Interpretation"}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Born: {new Date(selectedChartData.birthDate).toLocaleDateString()}
                      {selectedChartData.birthTime && ` at ${selectedChartData.birthTime}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Location: {selectedChartData.birthLocation}
                    </p>
                  </div>
                  
                  {selectedChartData.chartData ? (
                    <ChartCanvas chartData={selectedChartData.chartData} />
                  ) : (
                    <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Chart data not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interpretation */}
              {selectedChartData.interpretation && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      {(() => {
                        try {
                          const interpretation = JSON.parse(selectedChartData.interpretation);
                          return (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Summary</h4>
                                <p className="text-gray-700 dark:text-gray-300">{interpretation.summary}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Sun Sign</h4>
                                <p className="text-gray-700 dark:text-gray-300">{interpretation.sunSign}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Moon Sign</h4>
                                <p className="text-gray-700 dark:text-gray-300">{interpretation.moonSign}</p>
                              </div>
                              
                              {interpretation.strengths && interpretation.strengths.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Strengths</h4>
                                  <ul className="list-disc list-inside space-y-1">
                                    {interpretation.strengths.map((strength: string, index: number) => (
                                      <li key={index} className="text-gray-700 dark:text-gray-300">{strength}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-semibold mb-2">Guidance</h4>
                                <p className="text-gray-700 dark:text-gray-300">{interpretation.guidance}</p>
                              </div>
                            </div>
                          );
                        } catch {
                          return <p className="text-gray-700 dark:text-gray-300">{selectedChartData.interpretation}</p>;
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <CircleDot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a chart from the list or create a new one to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
