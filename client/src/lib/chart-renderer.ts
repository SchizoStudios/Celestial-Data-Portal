// SVG natal chart renderer

import { 
  ZODIAC_SIGNS, 
  PLANET_SYMBOLS, 
  ASPECT_SYMBOLS, 
  getAspectColor,
  normalizeAngle 
} from "./astronomical";

interface ChartData {
  positions: any[];
  aspects: any[];
  houses?: any[];
}

export function renderNatalChart(
  svg: SVGSVGElement, 
  chartData: ChartData, 
  width: number, 
  height: number
): void {
  // Clear existing content
  svg.innerHTML = "";
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;
  
  // Create chart rings
  const outerRadius = radius;
  const middleRadius = radius * 0.75;
  const innerRadius = radius * 0.5;
  
  // Background
  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  background.setAttribute("width", width.toString());
  background.setAttribute("height", height.toString());
  background.setAttribute("fill", "white");
  svg.appendChild(background);
  
  // Outer circle (zodiac)
  const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  outerCircle.setAttribute("cx", centerX.toString());
  outerCircle.setAttribute("cy", centerY.toString());
  outerCircle.setAttribute("r", outerRadius.toString());
  outerCircle.setAttribute("fill", "none");
  outerCircle.setAttribute("stroke", "#e5e7eb");
  outerCircle.setAttribute("stroke-width", "2");
  svg.appendChild(outerCircle);
  
  // Middle circle (houses)
  const middleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  middleCircle.setAttribute("cx", centerX.toString());
  middleCircle.setAttribute("cy", centerY.toString());
  middleCircle.setAttribute("r", middleRadius.toString());
  middleCircle.setAttribute("fill", "none");
  middleCircle.setAttribute("stroke", "#e5e7eb");
  middleCircle.setAttribute("stroke-width", "1");
  svg.appendChild(middleCircle);
  
  // Inner circle
  const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  innerCircle.setAttribute("cx", centerX.toString());
  innerCircle.setAttribute("cy", centerY.toString());
  innerCircle.setAttribute("r", innerRadius.toString());
  innerCircle.setAttribute("fill", "none");
  innerCircle.setAttribute("stroke", "#e5e7eb");
  innerCircle.setAttribute("stroke-width", "1");
  svg.appendChild(innerCircle);
  
  // Draw zodiac signs
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) - 90; // Start from Aries at top
    const radians = (angle * Math.PI) / 180;
    
    // Sign divider lines
    const lineX1 = centerX + Math.cos(radians) * middleRadius;
    const lineY1 = centerY + Math.sin(radians) * middleRadius;
    const lineX2 = centerX + Math.cos(radians) * outerRadius;
    const lineY2 = centerY + Math.sin(radians) * outerRadius;
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", lineX1.toString());
    line.setAttribute("y1", lineY1.toString());
    line.setAttribute("x2", lineX2.toString());
    line.setAttribute("y2", lineY2.toString());
    line.setAttribute("stroke", "#d1d5db");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
    
    // Sign symbols
    const signAngle = angle + 15; // Center of sign
    const signRadians = (signAngle * Math.PI) / 180;
    const signRadius = middleRadius + (outerRadius - middleRadius) / 2;
    const signX = centerX + Math.cos(signRadians) * signRadius;
    const signY = centerY + Math.sin(signRadians) * signRadius;
    
    const signText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    signText.setAttribute("x", signX.toString());
    signText.setAttribute("y", signY.toString());
    signText.setAttribute("text-anchor", "middle");
    signText.setAttribute("dominant-baseline", "middle");
    signText.setAttribute("font-size", "14");
    signText.setAttribute("font-weight", "bold");
    signText.setAttribute("fill", "#374151");
    signText.textContent = ZODIAC_SIGNS[i].symbol;
    svg.appendChild(signText);
  }
  
  // Draw house divisions (simplified equal house system)
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) - 90; // Simplified equal houses
    const radians = (angle * Math.PI) / 180;
    
    const lineX1 = centerX + Math.cos(radians) * innerRadius;
    const lineY1 = centerY + Math.sin(radians) * innerRadius;
    const lineX2 = centerX + Math.cos(radians) * middleRadius;
    const lineY2 = centerY + Math.sin(radians) * middleRadius;
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", lineX1.toString());
    line.setAttribute("y1", lineY1.toString());
    line.setAttribute("x2", lineX2.toString());
    line.setAttribute("y2", lineY2.toString());
    line.setAttribute("stroke", "#9ca3af");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-dasharray", "3,3");
    svg.appendChild(line);
    
    // House numbers
    const houseAngle = angle + 15;
    const houseRadians = (houseAngle * Math.PI) / 180;
    const houseRadius = innerRadius + (middleRadius - innerRadius) / 2;
    const houseX = centerX + Math.cos(houseRadians) * houseRadius;
    const houseY = centerY + Math.sin(houseRadians) * houseRadius;
    
    const houseText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    houseText.setAttribute("x", houseX.toString());
    houseText.setAttribute("y", houseY.toString());
    houseText.setAttribute("text-anchor", "middle");
    houseText.setAttribute("dominant-baseline", "middle");
    houseText.setAttribute("font-size", "10");
    houseText.setAttribute("fill", "#6b7280");
    houseText.textContent = (i + 1).toString();
    svg.appendChild(houseText);
  }
  
  // Draw aspect lines
  if (chartData.aspects) {
    chartData.aspects.forEach((aspect: any) => {
      const planet1 = chartData.positions.find(p => p.name === aspect.body1);
      const planet2 = chartData.positions.find(p => p.name === aspect.body2);
      
      if (planet1 && planet2) {
        const angle1 = normalizeAngle(planet1.longitude - 90);
        const angle2 = normalizeAngle(planet2.longitude - 90);
        const radians1 = (angle1 * Math.PI) / 180;
        const radians2 = (angle2 * Math.PI) / 180;
        
        const x1 = centerX + Math.cos(radians1) * (innerRadius - 10);
        const y1 = centerY + Math.sin(radians1) * (innerRadius - 10);
        const x2 = centerX + Math.cos(radians2) * (innerRadius - 10);
        const y2 = centerY + Math.sin(radians2) * (innerRadius - 10);
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1.toString());
        line.setAttribute("y1", y1.toString());
        line.setAttribute("x2", x2.toString());
        line.setAttribute("y2", y2.toString());
        line.setAttribute("stroke", getAspectColor(aspect.aspectType));
        line.setAttribute("stroke-width", aspect.exact ? "2" : "1");
        line.setAttribute("opacity", "0.6");
        svg.appendChild(line);
      }
    });
  }
  
  // Draw planetary positions
  if (chartData.positions) {
    chartData.positions.forEach((planet: any) => {
      const angle = normalizeAngle(planet.longitude - 90); // Start from Aries at top
      const radians = (angle * Math.PI) / 180;
      
      // Planet position on the wheel
      const planetRadius = middleRadius - 15;
      const planetX = centerX + Math.cos(radians) * planetRadius;
      const planetY = centerY + Math.sin(radians) * planetRadius;
      
      // Planet circle background
      const planetCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      planetCircle.setAttribute("cx", planetX.toString());
      planetCircle.setAttribute("cy", planetY.toString());
      planetCircle.setAttribute("r", "12");
      planetCircle.setAttribute("fill", "white");
      planetCircle.setAttribute("stroke", "#1565C0");
      planetCircle.setAttribute("stroke-width", "2");
      svg.appendChild(planetCircle);
      
      // Planet symbol
      const planetText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      planetText.setAttribute("x", planetX.toString());
      planetText.setAttribute("y", planetY.toString());
      planetText.setAttribute("text-anchor", "middle");
      planetText.setAttribute("dominant-baseline", "middle");
      planetText.setAttribute("font-size", "12");
      planetText.setAttribute("font-weight", "bold");
      planetText.setAttribute("fill", "#1565C0");
      planetText.textContent = PLANET_SYMBOLS[planet.name] || planet.name.charAt(0);
      svg.appendChild(planetText);
      
      // Degree line
      const lineX1 = centerX + Math.cos(radians) * (planetRadius - 12);
      const lineY1 = centerY + Math.sin(radians) * (planetRadius - 12);
      const lineX2 = centerX + Math.cos(radians) * outerRadius;
      const lineY2 = centerY + Math.sin(radians) * outerRadius;
      
      const degreeLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      degreeLine.setAttribute("x1", lineX1.toString());
      degreeLine.setAttribute("y1", lineY1.toString());
      degreeLine.setAttribute("x2", lineX2.toString());
      degreeLine.setAttribute("y2", lineY2.toString());
      degreeLine.setAttribute("stroke", "#1565C0");
      degreeLine.setAttribute("stroke-width", "1");
      degreeLine.setAttribute("opacity", "0.5");
      svg.appendChild(degreeLine);
    });
  }
  
  // Chart title
  const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
  title.setAttribute("x", centerX.toString());
  title.setAttribute("y", "20");
  title.setAttribute("text-anchor", "middle");
  title.setAttribute("font-size", "16");
  title.setAttribute("font-weight", "bold");
  title.setAttribute("fill", "#1f2937");
  title.textContent = "Natal Chart";
  svg.appendChild(title);
}
