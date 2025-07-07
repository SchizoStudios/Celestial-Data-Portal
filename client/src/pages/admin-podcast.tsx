import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mic, FileText, List, Download, Play, Video, Volume2, Settings } from "lucide-react";
import { generateAudio, generateVideo, downloadFile } from "@/lib/video-generator";

export default function AdminPodcast() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [generationSettings, setGenerationSettings] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    generateText: true,
    generateAudio: false,
    generateVideo: false,
    enhanceWithAI: true,
    visualizationStyle: "geometric",
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    content: "",
    availableFields: [
      "date", "sunrise_time", "sunset_time", "moon_phase", "moon_illumination",
      "planetary_positions", "active_aspects", "day_length", "moonrise", "moonset"
    ],
  });

  // Fetch podcast templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/podcast-templates"],
  });

  // Fetch selected template
  const { data: selectedTemplateData } = useQuery({
    queryKey: ["/api/podcast-templates", selectedTemplate],
    enabled: !!selectedTemplate,
  });

  // Fetch podcast content
  const { data: podcastContent } = useQuery({
    queryKey: ["/api/podcast-content"],
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/podcast-templates", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "Podcast template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/podcast-templates"] });
      setShowNewTemplate(false);
      setTemplateForm({
        name: "",
        content: "",
        availableFields: [
          "date", "sunrise_time", "sunset_time", "moon_phase", "moon_illumination",
          "planetary_positions", "active_aspects", "day_length", "moonrise", "moonset"
        ],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create template: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Generate content mutation
  const generateContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/podcast-content/generate", data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Content Generated",
        description: `Generated ${result.content.length} podcast episodes successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/podcast-content"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate content: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in template name and content.",
        variant: "destructive",
      });
      return;
    }
    createTemplateMutation.mutate(templateForm);
  };

  const handleGenerateContent = () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template first.",
        variant: "destructive",
      });
      return;
    }

    generateContentMutation.mutate({
      templateId: selectedTemplate,
      ...generationSettings,
      outputFormats: {
        enhanceWithAI: generationSettings.enhanceWithAI,
      },
    });
  };

  const handleGenerateAudio = async (contentId: number, textContent: string) => {
    try {
      const audioBlob = await generateAudio(textContent);
      const fileName = `podcast_${contentId}_audio.wav`;
      downloadFile(audioBlob, fileName);
      toast({
        title: "Audio Generated",
        description: "Audio file has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate audio: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateVideo = async (contentId: number, textContent: string) => {
    try {
      const videoBlob = await generateVideo(textContent, generationSettings.visualizationStyle);
      const fileName = `podcast_${contentId}_video.mp4`;
      downloadFile(videoBlob, fileName);
      toast({
        title: "Video Generated",
        description: "Video file has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate video: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const insertField = (field: string) => {
    const placeholder = `{${field}}`;
    setTemplateForm(prev => ({
      ...prev,
      content: prev.content + placeholder,
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Mic className="text-stellar-amber mr-3 h-6 w-6" />
              Admin: Podcast Generation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create astronomical narrative content with audio and video generation
            </p>
          </div>
          <span className="bg-stellar-amber text-white px-3 py-1 rounded-full text-sm font-medium">
            Admin Only
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-section rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Management */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Podcast Template Editor
            </h3>
            
            {/* Template Selector */}
            <div className="mb-4">
              <Label>Select Template</Label>
              <div className="flex space-x-2">
                <Select 
                  value={selectedTemplate?.toString() || ""} 
                  onValueChange={(value) => setSelectedTemplate(parseInt(value))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((template: any) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => setShowNewTemplate(true)}
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </div>

            {/* Template Form */}
            {showNewTemplate && (
              <form onSubmit={handleCreateTemplate} className="space-y-4 mb-6 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Daily Astronomy Briefing"
                  />
                </div>
                
                <div>
                  <Label htmlFor="templateContent">Content Template</Label>
                  <Textarea
                    id="templateContent"
                    rows={8}
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Welcome to today's astronomical briefing for {date}. Today's sunrise is at {sunrise_time} and sunset at {sunset_time}..."
                  />
                </div>

                {/* Data Field Selector */}
                <div>
                  <Label>Available Data Fields</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto mt-2">
                    {templateForm.availableFields.map((field) => (
                      <Button
                        key={field}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertField(field)}
                        className="text-left justify-start"
                      >
                        {`{${field}}`}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={createTemplateMutation.isPending}
                    className="bg-stellar-amber hover:bg-yellow-600"
                  >
                    {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowNewTemplate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Selected Template Content */}
            {selectedTemplateData && !showNewTemplate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">{selectedTemplateData.name}</h4>
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedTemplateData.content}
                </pre>
              </div>
            )}
          </div>

          {/* Generation Controls */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Content Generation
            </h3>
            
            <div className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={generationSettings.startDate}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={generationSettings.endDate}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Output Options */}
              <div>
                <Label>Output Format</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateText"
                      checked={generationSettings.generateText}
                      onCheckedChange={(checked) => setGenerationSettings(prev => ({ ...prev, generateText: !!checked }))}
                    />
                    <Label htmlFor="generateText">Generate Text Content</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateAudio"
                      checked={generationSettings.generateAudio}
                      onCheckedChange={(checked) => setGenerationSettings(prev => ({ ...prev, generateAudio: !!checked }))}
                    />
                    <Label htmlFor="generateAudio">Convert to Audio (TTS)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateVideo"
                      checked={generationSettings.generateVideo}
                      onCheckedChange={(checked) => setGenerationSettings(prev => ({ ...prev, generateVideo: !!checked }))}
                    />
                    <Label htmlFor="generateVideo">Generate Video with Visualizations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enhanceWithAI"
                      checked={generationSettings.enhanceWithAI}
                      onCheckedChange={(checked) => setGenerationSettings(prev => ({ ...prev, enhanceWithAI: !!checked }))}
                    />
                    <Label htmlFor="enhanceWithAI">Enhance with AI</Label>
                  </div>
                </div>
              </div>

              {/* Video Visualization Options */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <Label>Video Visualization Style</Label>
                <Select 
                  value={generationSettings.visualizationStyle} 
                  onValueChange={(value) => setGenerationSettings(prev => ({ ...prev, visualizationStyle: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geometric">Geometric Patterns</SelectItem>
                    <SelectItem value="celestial">Celestial Animations</SelectItem>
                    <SelectItem value="abstract">Abstract Flow</SelectItem>
                    <SelectItem value="constellation">Constellation Movements</SelectItem>
                    <SelectItem value="waveform">Audio Waveform (Classic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generation Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGenerateContent}
                  disabled={generateContentMutation.isPending || !selectedTemplate}
                  className="w-full bg-stellar-amber hover:bg-yellow-600"
                >
                  {generateContentMutation.isPending ? "Generating..." : "Generate Text Content"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Content */}
        {podcastContent && podcastContent.length > 0 && (
          <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Generated Content</h4>
            <div className="space-y-3">
              {podcastContent.slice(0, 5).map((content: any) => (
                <div key={content.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-sm">
                        {new Date(content.date).toLocaleDateString()}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Status: {content.status}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateAudio(content.id, content.textContent)}
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        Audio
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateVideo(content.id, content.textContent)}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Video
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {content.textContent}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
