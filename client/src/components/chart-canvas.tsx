import { useEffect, useRef } from "react";
import { renderNatalChart } from "@/lib/chart-renderer";

interface ChartCanvasProps {
  chartData: any;
  width?: number;
  height?: number;
  className?: string;
}

export default function ChartCanvas({ 
  chartData, 
  width = 400, 
  height = 400, 
  className = "" 
}: ChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (chartData && svgRef.current) {
      try {
        renderNatalChart(svgRef.current, chartData, width, height);
      } catch (error) {
        console.error("Failed to render chart:", error);
      }
    }
  }, [chartData, width, height]);

  if (!chartData) {
    return (
      <div 
        className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-celestial-blue rounded-full relative mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-mystical-purple rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-canvas ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="rounded-lg shadow-sm"
        style={{ background: "white" }}
      >
        {/* Chart will be rendered here by chart-renderer */}
      </svg>
    </div>
  );
}
