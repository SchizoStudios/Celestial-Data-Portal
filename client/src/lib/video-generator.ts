// Video generation utilities for podcast content

export async function generateAudio(text: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Check if browser supports Speech Synthesis
      if (!('speechSynthesis' in window)) {
        throw new Error("Speech synthesis not supported in this browser");
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure speech settings
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Get available voices and prefer a natural sounding one
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Premium') ||
        voice.name.includes('Enhanced')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Create audio recording
      const mediaRecorder = setupAudioRecording();
      
      utterance.onstart = () => {
        mediaRecorder.start();
      };
      
      utterance.onend = () => {
        mediaRecorder.stop();
      };
      
      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          resolve(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        reject(new Error("Failed to record audio"));
      };

      // Start speaking
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      reject(error);
    }
  });
}

function setupAudioRecording(): MediaRecorder {
  // Create audio context for recording
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  
  // Create gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.connect(destination);
  
  return new MediaRecorder(destination.stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
}

export async function generateVideo(
  text: string, 
  visualizationStyle: string = "geometric"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d")!;
      
      // Create video stream from canvas
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Setup media recorder for video
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        resolve(videoBlob);
      };
      
      mediaRecorder.onerror = () => {
        reject(new Error("Failed to record video"));
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Generate visualization
      const duration = estimateTextDuration(text) * 1000; // Convert to milliseconds
      generateVisualization(ctx, visualizationStyle, duration, () => {
        mediaRecorder.stop();
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

function generateVisualization(
  ctx: CanvasRenderingContext2D,
  style: string,
  duration: number,
  onComplete: () => void
): void {
  const startTime = Date.now();
  const fps = 30;
  const interval = 1000 / fps;
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;
    
    if (progress >= 1) {
      onComplete();
      return;
    }
    
    // Clear canvas
    ctx.fillStyle = "#0f172a"; // Deep space background
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Render based on style
    switch (style) {
      case "geometric":
        renderGeometricPattern(ctx, progress);
        break;
      case "celestial":
        renderCelestialAnimation(ctx, progress);
        break;
      case "abstract":
        renderAbstractFlow(ctx, progress);
        break;
      case "constellation":
        renderConstellationMovement(ctx, progress);
        break;
      case "waveform":
        renderWaveform(ctx, progress);
        break;
      default:
        renderGeometricPattern(ctx, progress);
    }
    
    setTimeout(animate, interval);
  }
  
  animate();
}

function renderGeometricPattern(ctx: CanvasRenderingContext2D, progress: number): void {
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;
  
  // Rotating geometric shapes
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(progress * Math.PI * 2);
  
  // Draw concentric circles with varying opacity
  for (let i = 0; i < 5; i++) {
    const radius = 50 + i * 40;
    const alpha = 0.3 + Math.sin(progress * Math.PI * 2 + i) * 0.2;
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(21, 101, 192, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // Draw rotating triangles
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 8);
    ctx.translate(120, 0);
    
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(10, 10);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fillStyle = `rgba(124, 77, 255, ${0.6 + Math.sin(progress * Math.PI * 4) * 0.3})`;
    ctx.fill();
    
    ctx.restore();
  }
  
  ctx.restore();
}

function renderCelestialAnimation(ctx: CanvasRenderingContext2D, progress: number): void {
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;
  
  // Draw stars
  for (let i = 0; i < 100; i++) {
    const x = (i * 37) % ctx.canvas.width;
    const y = (i * 73) % ctx.canvas.height;
    const alpha = 0.3 + Math.sin(progress * Math.PI * 2 + i * 0.1) * 0.3;
    
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
  
  // Draw orbiting planets
  for (let i = 0; i < 3; i++) {
    const angle = progress * Math.PI * 2 + (i * Math.PI * 2) / 3;
    const radius = 100 + i * 50;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    ctx.beginPath();
    ctx.arc(x, y, 8 - i * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 193, 7, ${0.8})`;
    ctx.fill();
    
    // Draw orbit path
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function renderAbstractFlow(ctx: CanvasRenderingContext2D, progress: number): void {
  // Create flowing particle system
  for (let i = 0; i < 50; i++) {
    const x = (progress * 300 + i * 25) % (ctx.canvas.width + 50);
    const y = ctx.canvas.height / 2 + Math.sin(progress * Math.PI * 2 + i * 0.2) * 100;
    const alpha = Math.sin(progress * Math.PI + i * 0.1) * 0.5 + 0.5;
    
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(124, 77, 255, ${alpha})`;
    ctx.fill();
  }
}

function renderConstellationMovement(ctx: CanvasRenderingContext2D, progress: number): void {
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;
  
  // Define constellation points
  const constellation = [
    { x: 0, y: -100 },
    { x: 50, y: -50 },
    { x: 100, y: 0 },
    { x: 50, y: 50 },
    { x: 0, y: 100 },
    { x: -50, y: 50 },
    { x: -100, y: 0 },
    { x: -50, y: -50 },
  ];
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(progress * Math.PI * 0.5);
  
  // Draw constellation lines
  ctx.beginPath();
  constellation.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.strokeStyle = `rgba(21, 101, 192, 0.6)`;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw constellation stars
  constellation.forEach((point, index) => {
    const alpha = 0.5 + Math.sin(progress * Math.PI * 2 + index * 0.5) * 0.4;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 193, 7, ${alpha})`;
    ctx.fill();
  });
  
  ctx.restore();
}

function renderWaveform(ctx: CanvasRenderingContext2D, progress: number): void {
  const centerY = ctx.canvas.height / 2;
  const amplitude = 50;
  const frequency = 0.02;
  
  ctx.beginPath();
  for (let x = 0; x < ctx.canvas.width; x++) {
    const y = centerY + Math.sin((x + progress * 200) * frequency) * amplitude;
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = "rgba(21, 101, 192, 0.8)";
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Add secondary wave
  ctx.beginPath();
  for (let x = 0; x < ctx.canvas.width; x++) {
    const y = centerY + Math.sin((x + progress * 150) * frequency * 1.5) * amplitude * 0.5;
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = "rgba(124, 77, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function estimateTextDuration(text: string): number {
  // Estimate reading time based on average speaking rate (150 words per minute)
  const wordsPerMinute = 150;
  const words = text.split(' ').length;
  return Math.max((words / wordsPerMinute) * 60, 5); // Minimum 5 seconds
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
