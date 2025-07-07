import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X, HelpCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TemplateAssistant from "@/components/template-assistant";
import type { PodcastTemplate } from "@shared/schema";

export default function AdminTemplates() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PodcastTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    availableFields: [] as string[],
  });
  const [showAssistant, setShowAssistant] = useState(false);

  const handleInsertText = (text: string) => {
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, content: text });
    } else {
      setNewTemplate({ ...newTemplate, content: text });
    }
  };

  const handleInsertField = (field: string) => {
    const currentContent = editingTemplate?.content || newTemplate.content;
    const newContent = currentContent + field;
    
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, content: newContent });
    } else {
      setNewTemplate({ ...newTemplate, content: newContent });
    }
  };

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/podcast-templates"],
  });

  const createMutation = useMutation({
    mutationFn: (template: typeof newTemplate) =>
      apiRequest("/api/podcast-templates", {
        method: "POST",
        body: JSON.stringify(template),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcast-templates"] });
      setIsCreateOpen(false);
      setNewTemplate({ name: "", content: "", availableFields: [] });
      toast({ title: "Template created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...template }: { id: number } & Partial<typeof newTemplate>) =>
      apiRequest(`/api/podcast-templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(template),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcast-templates"] });
      setEditingTemplate(null);
      toast({ title: "Template updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update template", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/podcast-templates/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcast-templates"] });
      toast({ title: "Template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });

  const handleCreateTemplate = () => {
    createMutation.mutate(newTemplate);
  };

  const handleUpdateTemplate = (template: PodcastTemplate) => {
    updateMutation.mutate({
      id: template.id,
      name: template.name,
      content: template.content,
      availableFields: template.availableFields,
    });
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  const addField = (templateData: any, setTemplateData: any) => {
    const fieldName = prompt("Enter field name (e.g., {date}, {sunSign}, {moonPhase}):");
    if (fieldName && !templateData.availableFields.includes(fieldName)) {
      setTemplateData({
        ...templateData,
        availableFields: [...templateData.availableFields, fieldName],
      });
    }
  };

  const removeField = (field: string, templateData: any, setTemplateData: any) => {
    setTemplateData({
      ...templateData,
      availableFields: templateData.availableFields.filter((f: string) => f !== field),
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Podcast Templates</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage templates for automated podcast content generation
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button 
            variant={showAssistant ? "default" : "outline"}
            onClick={() => setShowAssistant(!showAssistant)}
            className="w-full sm:w-auto"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            {showAssistant ? 'Hide' : 'Template'} Assistant
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (open && !showAssistant) {
              setShowAssistant(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Design a template for generating podcast content with dynamic fields. 
                {!showAssistant && (
                  <span className="text-blue-600 dark:text-blue-400"> 
                    Click "Template Assistant" above for help with variables and examples.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Daily Astrology Overview"
                />
              </div>
              <div>
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Write your template content here. Use {field} for dynamic content..."
                  rows={10}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Available Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addField(newTemplate, setNewTemplate)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Field
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newTemplate.availableFields.map((field, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {field}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeField(field, newTemplate, setNewTemplate)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {showAssistant && (
        <div className="mb-6">
          <TemplateAssistant 
            onInsertText={handleInsertText}
            onInsertField={handleInsertField}
          />
        </div>
      )}

      <div className="grid gap-4 lg:gap-6">
        {templates?.map((template: PodcastTemplate) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>
                    Created: {new Date(template.createdAt || new Date()).toLocaleDateString()}
                    {template.updatedAt && (
                      <span className="ml-2">
                        • Updated: {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="fields">Fields ({template.availableFields.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{template.content}</pre>
                  </div>
                </TabsContent>
                <TabsContent value="fields" className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {template.availableFields.map((field, index) => (
                      <Badge key={index} variant="outline">
                        {field}
                      </Badge>
                    ))}
                    {template.availableFields.length === 0 && (
                      <p className="text-muted-foreground text-sm">No dynamic fields defined</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}

        {templates?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No templates created yet</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Modify the template content and available fields
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Template Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingTemplate.content}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, content: e.target.value })
                  }
                  rows={10}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Available Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addField(editingTemplate, setEditingTemplate)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Field
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingTemplate.availableFields.map((field, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {field}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeField(field, editingTemplate, setEditingTemplate)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateTemplate(editingTemplate)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}