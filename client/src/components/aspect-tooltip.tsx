import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AspectTooltipProps {
  body1: string;
  aspectType: string;
  body2: string;
  aspectSymbol: string;
  orb: number;
  children: React.ReactNode;
}

interface AspectInterpretation {
  body1: string;
  aspect: string;
  body2: string;
  aspectName: string;
  interpretation: string;
  energy: 'harmonious' | 'challenging' | 'neutral';
  keywords: string[];
}

export default function AspectTooltip({ 
  body1, 
  aspectType, 
  body2, 
  aspectSymbol, 
  orb, 
  children 
}: AspectTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch aspect interpretation
  const { data: interpretation, isLoading } = useQuery<AspectInterpretation>({
    queryKey: ["/api/aspects", body1, aspectType, body2, "interpretation"],
    queryFn: async () => {
      const response = await fetch(`/api/aspects/${encodeURIComponent(body1)}/${encodeURIComponent(aspectType)}/${encodeURIComponent(body2)}/interpretation`);
      if (!response.ok) {
        throw new Error('Failed to fetch interpretation');
      }
      return response.json();
    },
    enabled: isOpen, // Only fetch when tooltip is opened
  });

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'harmonious':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'challenging':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="max-w-sm p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading interpretation...</span>
            </div>
          ) : interpretation ? (
            <div className="space-y-3">
              {/* Aspect Header */}
              <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                <h4 className="font-semibold text-base">
                  {body1} {aspectType} {body2}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {body1} {aspectSymbol} {body2} • Orb: {orb.toFixed(1)}°
                </p>
              </div>

              {/* Energy Type */}
              <div className="flex items-center space-x-2">
                <Badge className={getEnergyColor(interpretation.energy)}>
                  {interpretation.energy.charAt(0).toUpperCase() + interpretation.energy.slice(1)} Energy
                </Badge>
              </div>

              {/* Interpretation */}
              <div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {interpretation.interpretation}
                </p>
              </div>

              {/* Keywords */}
              {interpretation.keywords && interpretation.keywords.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Key Themes:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {interpretation.keywords.slice(0, 6).map((keyword, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Unable to load interpretation
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}