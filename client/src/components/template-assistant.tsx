import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  Lightbulb, 
  Copy, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Wand2,
  Code,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateAssistantProps {
  onInsertText: (text: string) => void;
  onInsertField: (field: string) => void;
}

export default function TemplateAssistant({ onInsertText, onInsertField }: TemplateAssistantProps) {
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>(['variables']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${description} copied successfully`,
    });
  };

  const availableFields = [
    { name: "\\{\\{date\\}\\}", description: "Current date", category: "datetime" },
    { name: "\\{\\{time\\}\\}", description: "Current time", category: "datetime" },
    { name: "\\{\\{location\\}\\}", description: "Selected location", category: "location" },
    { name: "\\{\\{sunrise\\}\\}", description: "Sunrise time", category: "solar" },
    { name: "\\{\\{sunset\\}\\}", description: "Sunset time", category: "solar" },
    { name: "\\{\\{moonPhase\\}\\}", description: "Current moon phase", category: "lunar" },
    { name: "\\{\\{sunSign\\}\\}", description: "Sun's zodiac sign", category: "zodiac" },
    { name: "\\{\\{moonSign\\}\\}", description: "Moon's zodiac sign", category: "zodiac" },
    { name: "\\{\\{aspects\\}\\}", description: "Current aspects", category: "aspects" },
    { name: "\\{\\{planetaryPositions\\}\\}", description: "All planetary positions", category: "planets" },
    { name: "\\{\\{retrogradeList\\}\\}", description: "Planets in retrograde", category: "planets" },
    { name: "\\{\\{dominantElement\\}\\}", description: "Dominant astrological element", category: "analysis" },
    { name: "\\{\\{energyForecast\\}\\}", description: "Daily energy forecast", category: "analysis" },
  ];

  const templateExamples = [
    {
      name: "Daily Horoscope",
      description: "A comprehensive daily astrological reading",
      content: `Welcome to your daily cosmic forecast for \{\{date\}\} in \{\{location\}\}.

The Sun rises at \{\{sunrise\}\} and sets at \{\{sunset\}\}, giving us \{\{dayLength\}\} of daylight energy to work with.

CELESTIAL HIGHLIGHTS:
🌞 Sun in \{\{sunSign\}\} - \{\{sunDescription\}\}
🌙 Moon in \{\{moonSign\}\} (\{\{moonPhase\}\}) - \{\{moonDescription\}\}

PLANETARY ASPECTS:
\{\{aspects\}\}

TODAY'S ENERGY:
The dominant element today is \{\{dominantElement\}\}, suggesting \{\{energyForecast\}\}.

\{\{#if retrogradeList\}\}
RETROGRADE ALERT: \{\{retrogradeList\}\} - Exercise extra caution in communication and travel.
\{\{/if\}\}

ADVICE FOR TODAY:
\{\{dailyAdvice\}\}

May the stars guide your path today! ✨`
    },
    {
      name: "Weekly Forecast",
      description: "A detailed weekly astrological overview",
      content: `WEEKLY COSMIC WEATHER REPORT
\{\{startDate\}\} - \{\{endDate\}\}

This week's astrological landscape brings \{\{weeklyTheme\}\} energy as we navigate through \{\{majorAspects\}\}.

KEY PLANETARY MOVEMENTS:
\{\{planetaryTransits\}\}

WEEKLY THEMES:
Monday-Tuesday: \{\{earlyWeekEnergy\}\}
Wednesday-Thursday: \{\{midWeekEnergy\}\}
Friday-Sunday: \{\{weekendEnergy\}\}

AREAS OF FOCUS:
• Career & Goals: \{\{careerForecast\}\}
• Relationships: \{\{relationshipForecast\}\}
• Health & Wellness: \{\{healthForecast\}\}
• Creativity: \{\{creativityForecast\}\}

BEST DAYS FOR:
\{\{bestDaysFor\}\}

DAYS TO BE CAUTIOUS:
\{\{cautiousDays\}\}

Weekly Mantra: "\{\{weeklyMantra\}\}"

Remember, the stars suggest, but you decide! 🌟`
    },
    {
      name: "New Moon Intention Setting",
      description: "A guide for new moon manifestation",
      content: `NEW MOON IN \{\{moonSign\}\} - \{\{date\}\}
Time to plant new seeds of intention 🌑

LUNAR ENERGY:
The New Moon occurs at \{\{moonTime\}\} in \{\{moonSign\}\}, offering us \{\{newMoonDescription\}\}.

MANIFESTATION THEMES:
\{\{manifestationThemes\}\}

RITUAL SUGGESTIONS:
1. \{\{ritualStep1\}\}
2. \{\{ritualStep2\}\}
3. \{\{ritualStep3\}\}

INTENTION SETTING PROMPTS:
• What do I want to release from the past lunar cycle?
• What new energy do I want to invite in?
• How can I align with \{\{moonSign\}\} energy?

PLANETARY SUPPORT:
\{\{supportivePlanets\}\}

AFFIRMATION:
"\{\{newMoonAffirmation\}\}"

Best time for ritual: \{\{bestRitualTime\}\}
Duration of this lunar influence: \{\{lunarInfluenceDuration\}\}

Trust in the cosmic timing of your dreams! 🌟`
    },
    {
      name: "Mercury Retrograde Guide",
      description: "Navigate Mercury retrograde periods",
      content: `MERCURY RETROGRADE SURVIVAL GUIDE
\{\{startDate\}\} - \{\{endDate\}\} in \{\{retrogradeSign\}\}

WHAT TO EXPECT:
Mercury, the planet of communication and technology, appears to move backward through \{\{retrogradeSign\}\}, bringing \{\{retrogradeThemes\}\}.

THE 3 R'S APPROACH:
• REFLECT: \{\{reflectionGuidance\}\}
• REVIEW: \{\{reviewGuidance\}\}
• REVISE: \{\{reviseGuidance\}\}

AREAS TO BE EXTRA CAREFUL:
⚠️ Communication: \{\{communicationAdvice\}\}
⚠️ Technology: \{\{techAdvice\}\}
⚠️ Travel: \{\{travelAdvice\}\}
⚠️ Contracts: \{\{contractAdvice\}\}

WHAT TO AVOID:
\{\{avoidanceList\}\}

WHAT TO EMBRACE:
\{\{embraceList\}\}

RETROGRADE OPPORTUNITIES:
\{\{opportunities\}\}

PROTECTIVE PRACTICES:
\{\{protectivePractices\}\}

Remember: Retrograde periods are not about fear, but about mindful navigation! 🧭`
    }
  ];

  const writingTips = [
    {
      title: "Use Active Voice",
      description: "Write 'The Moon enters Aries' instead of 'Aries is entered by the Moon'",
      example: "Good: 'Venus brings harmony to your relationships'\nBetter than: 'Harmony is brought to relationships by Venus'"
    },
    {
      title: "Create Emotional Connection",
      description: "Use language that resonates with feelings and personal experience",
      example: "Instead of: 'Mercury is in retrograde'\nTry: 'Mercury's backward dance invites us to slow down and reflect'"
    },
    {
      title: "Balance Cosmic and Practical",
      description: "Combine astrological insights with actionable advice",
      example: "Cosmic: 'Mars squares Jupiter today'\nPractical: 'Channel this dynamic energy into a new project or workout routine'"
    },
    {
      title: "Use Inclusive Language",
      description: "Write for all experience levels, from beginners to advanced practitioners",
      example: "Instead of: 'The opposition creates tension'\nTry: 'This planetary conversation might bring some creative tension'"
    },
    {
      title: "Structure for Scanning",
      description: "Use headers, bullet points, and clear sections for easy reading",
      example: "Break content into: Overview, Key Influences, Daily Guidance, and Action Steps"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <HelpCircle className="mr-2 h-5 w-5 text-celestial-blue" />
          Template Assistant
        </CardTitle>
        <CardDescription>
          Get help creating engaging astrological content with variables, examples, and writing tips
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="variables" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="variables" className="text-xs sm:text-sm">Variables</TabsTrigger>
            <TabsTrigger value="examples" className="text-xs sm:text-sm">Examples</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm">Tips</TabsTrigger>
            <TabsTrigger value="guide" className="text-xs sm:text-sm">Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center">
                <Code className="mr-2 h-4 w-4" />
                Available Variables
              </h3>
              <div className="grid gap-3">
                {['datetime', 'location', 'solar', 'lunar', 'zodiac', 'aspects', 'planets', 'analysis'].map(category => (
                  <Collapsible 
                    key={category}
                    open={expandedSections.includes(category)}
                    onOpenChange={() => toggleSection(category)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between h-auto p-3">
                        <span className="font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                        {expandedSections.includes(category) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      {availableFields
                        .filter(field => field.category === category)
                        .map(field => (
                          <div key={field.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="flex-1">
                              <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {field.name}
                              </code>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{field.description}</p>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(field.name, field.description)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => onInsertField(field.name)}
                              >
                                Insert
                              </Button>
                            </div>
                          </div>
                        ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Template Examples
              </h3>
              {templateExamples.map((template, index) => (
                <Card key={index} className="border-l-4 border-l-celestial-blue">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(template.content, template.name)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onInsertText(template.content)}
                        >
                          <Wand2 className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-32 w-full rounded border">
                      <pre className="text-xs p-3 whitespace-pre-wrap">{template.content}</pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Lightbulb className="mr-2 h-4 w-4" />
                Writing Tips
              </h3>
              {writingTips.map((tip, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{tip.title}</CardTitle>
                    <CardDescription className="text-xs">{tip.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs">
                      <pre className="whitespace-pre-wrap">{tip.example}</pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Template Creation Guide
              </h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Step 1: Choose Your Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="outline">Daily Forecast</Badge>
                  <Badge variant="outline">Weekly Overview</Badge>
                  <Badge variant="outline">New Moon Guide</Badge>
                  <Badge variant="outline">Planetary Transit</Badge>
                  <Badge variant="outline">Retrograde Advisory</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Step 2: Structure Your Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• <strong>Opening:</strong> Set the cosmic scene with date, location, and main theme</div>
                  <div>• <strong>Key Information:</strong> Include relevant astronomical data and positions</div>
                  <div>• <strong>Interpretation:</strong> Explain what the cosmic events mean practically</div>
                  <div>• <strong>Guidance:</strong> Provide actionable advice and suggestions</div>
                  <div>• <strong>Closing:</strong> End with encouragement or affirmation</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Step 3: Add Dynamic Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• Use variables like <code>{'{{date}}'}</code> and <code>{'{{location}}'}</code> for personalization</div>
                  <div>• Include conditional content with <code>{'{{#if condition}}'}</code> blocks</div>
                  <div>• Add lists and loops for planetary positions and aspects</div>
                  <div>• Use descriptive variables for richer, more engaging content</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Step 4: Test and Refine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• Preview your template with different dates and locations</div>
                  <div>• Check that all variables render correctly</div>
                  <div>• Ensure the tone matches your intended audience</div>
                  <div>• Verify that the content flows naturally and is easy to read</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}