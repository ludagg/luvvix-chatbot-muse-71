
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  life: number;
  maxLife: number;
}

export const InteractiveParticles = ({ audioEnabled = false }: { audioEnabled?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [audioData, setAudioData] = useState<number[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const { theme } = useTheme();

  // Setup audio processing
  useEffect(() => {
    if (!audioEnabled) return;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneStreamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const processAudio = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData(Array.from(dataArray));
          requestAnimationFrame(processAudio);
        };

        processAudio();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    setupAudio();

    return () => {
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioEnabled]);

  // Get color based on current theme
  const getParticleColor = () => {
    const colors = {
      dark: ["#8B5CF6", "#D946EF", "#6366F1"],
      light: ["#4F46E5", "#7C3AED", "#2563EB"],
      purple: ["#C084FC", "#A855F7", "#8B5CF6"],
      blue: ["#3B82F6", "#60A5FA", "#93C5FD"],
      green: ["#10B981", "#34D399", "#6EE7B7"]
    };
    
    return colors[theme as keyof typeof colors] || colors.dark;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const colors = getParticleColor();
    
    // Create particles
    const createParticles = () => {
      const newParticles: Particle[] = [];
      const particleCount = 100;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          velocity: {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
          },
          life: 0,
          maxLife: Math.random() * 100 + 50
        });
      }

      setParticles(newParticles);
    };

    createParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position
          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;
          
          // Increase life
          particle.life += 1;
          
          // Reset if out of bounds or life ended
          if (
            particle.x < 0 || particle.x > canvas.width ||
            particle.y < 0 || particle.y > canvas.height ||
            particle.life > particle.maxLife
          ) {
            return {
              ...particle,
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              life: 0,
              maxLife: Math.random() * 100 + 50,
              color: colors[Math.floor(Math.random() * colors.length)]
            };
          }
          
          // Apply audio data influence if available
          if (audioData.length > 0) {
            const audioIndex = Math.floor((particle.x / canvas.width) * audioData.length);
            const audioValue = audioData[audioIndex] || 0;
            
            // Scale the influence based on audio amplitude
            const scale = audioValue / 255;
            particle.velocity.x += (Math.random() - 0.5) * scale * 0.2;
            particle.velocity.y += (Math.random() - 0.5) * scale * 0.2;
            
            // Adjust size based on audio
            particle.size = Math.max(1, (audioValue / 50) + (Math.random() * 2));
          }
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          
          return particle;
        })
      );
      
      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = 1 - (distance / 100);
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, theme]);

  return (
    <motion.canvas
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1 }}
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  );
};
