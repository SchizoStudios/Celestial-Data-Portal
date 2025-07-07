import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Radar, Plus, Edit, Trash2, Bell } from "lucide-react";
import { CELESTIAL_BODIES, ASPECT_TYPES } from "@shared/schema";

export default function AspectMonitor() {
  const { toast } = useToast();
  const [showNewMonitor, setShowNewMonitor] = useState(false);
  
  // Form state for new monitor
  const [formData, setFormData] = useState({
    body1: "Sun",
    aspectType: "Conjunction",
    body2: "Moon",
    orb: 5,
    monitorType: "transit",
    dailyNotifications: true,
    weeklyDigest: true,
    emailNotifications: false,
  });

  // Fetch aspect monitors
  const { data: monitors, isLoading } = useQuery({
    queryKey: ["/api/aspect-monitors"],
  });

  // Create monitor mutation
  const createMonitorMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/aspect-monitors", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Monitor Created",
        description: "Aspect monitor has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/aspect-monitors"] });
      setShowNewMonitor(false);
      setFormData({
        body1: "Sun",
        aspectType: "Conjunction",
        body2: "Moon",
        orb: 5,
        monitorType: "transit",
        dailyNotifications: true,
        weeklyDigest: true,
        emailNotifications: false,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create monitor: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete monitor mutation
  const deleteMonitorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/aspect-monitors/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Monitor Deleted",
        description: "Aspect monitor has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/aspect-monitors"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete monitor: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.body1 === formData.body2) {
      toast({
        title: "Invalid Configuration",
        description: "Please select different celestial bodies.",
        variant: "destructive",
      });
      return;
    }

    createMonitorMutation.mutate(formData);
  };

  const getAspectSymbol = (aspectType: string) => {
    const aspect = ASPECT_TYPES.find(a => a.name === aspectType);
    return aspect?.symbol || aspectType;
  };

  const getAspectColor = (aspectType: string) => {
    switch (aspectType) {
      case "Conjunction": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "Opposition": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "Square": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "Trine": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "Sextile": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
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
            <Radar className="text-mystical-purple mr-3 h-6 w-6" />
            Aspect Monitoring System
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Track specific planetary aspects and receive notifications</p>
        </div>
        <Button 
          onClick={() => setShowNewMonitor(true)}
          className="bg-mystical-purple hover:bg-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Monitor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Monitors */}
        <Card>
          <CardHeader>
            <CardTitle>Active Monitors</CardTitle>
          </CardHeader>
          <CardContent>
            {monitors && monitors.length > 0 ? (
              <div className="space-y-3">
                {monitors.map((monitor: any) => (
                  <div key={monitor.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {monitor.body1} {getAspectSymbol(monitor.aspectType)} {monitor.body2}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${getAspectColor(monitor.aspectType)}`}>
                          {monitor.aspectType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMonitorMutation.mutate(monitor.id)}
                          disabled={deleteMonitorMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Orb: ±{monitor.orb}° | Type: {monitor.monitorType}</p>
                      <p>
                        Notifications: 
                        {monitor.dailyNotifications && " Daily advance"}
                        {monitor.weeklyDigest && " Weekly digest"}
                        {monitor.emailNotifications && " Email"}
                        {!monitor.dailyNotifications && !monitor.weeklyDigest && !monitor.emailNotifications && " None"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No aspect monitors configured yet. Create your first monitor to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Add New Monitor or Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {showNewMonitor ? "Create New Monitor" : "Monitor Configuration"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showNewMonitor ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="body1">Body 1</Label>
                    <Select value={formData.body1} onValueChange={(value) => setFormData(prev => ({ ...prev, body1: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CELESTIAL_BODIES.map((body) => (
                          <SelectItem key={body} value={body}>{body}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="aspectType">Aspect</Label>
                    <Select value={formData.aspectType} onValueChange={(value) => setFormData(prev => ({ ...prev, aspectType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASPECT_TYPES).map(([name, aspect]) => (
                          <SelectItem key={name} value={name}>
                            {name} ({aspect.degrees}°)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="body2">Body 2</Label>
                    <Select value={formData.body2} onValueChange={(value) => setFormData(prev => ({ ...prev, body2: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CELESTIAL_BODIES.map((body) => (
                          <SelectItem key={body} value={body}>{body}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orb">Orb (degrees)</Label>
                    <Input
                      id="orb"
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={formData.orb}
                      onChange={(e) => setFormData(prev => ({ ...prev, orb: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monitorType">Monitor Type</Label>
                    <Select value={formData.monitorType} onValueChange={(value) => setFormData(prev => ({ ...prev, monitorType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transit">Transit to Natal</SelectItem>
                        <SelectItem value="transit-to-transit">Transit to Transit</SelectItem>
                        <SelectItem value="progression">Progression to Natal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Notification Settings</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dailyNotifications"
                        checked={formData.dailyNotifications}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dailyNotifications: !!checked }))}
                      />
                      <Label htmlFor="dailyNotifications" className="text-sm">1 day advance notification</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="weeklyDigest"
                        checked={formData.weeklyDigest}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, weeklyDigest: !!checked }))}
                      />
                      <Label htmlFor="weeklyDigest" className="text-sm">Weekly digest (Sundays)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: !!checked }))}
                      />
                      <Label htmlFor="emailNotifications" className="text-sm">Email notifications</Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    disabled={createMonitorMutation.isPending}
                    className="bg-mystical-purple hover:bg-purple-700"
                  >
                    {createMonitorMutation.isPending ? "Creating..." : "Create Monitor"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowNewMonitor(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <Radar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Configure aspect monitors to track planetary movements and receive notifications when specific aspects occur.
                </p>
                <Button 
                  onClick={() => setShowNewMonitor(true)}
                  className="bg-mystical-purple hover:bg-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Monitor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Notifications */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="text-blue-500 mr-2 h-5 w-5" />
            Upcoming Notifications (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Jan 23</span>
                  <span>Mars ☐ Saturn approaching exact</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">14:32 UTC</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Jan 25</span>
                  <span>Weekly Aspect Digest</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">Sunday Morning</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
