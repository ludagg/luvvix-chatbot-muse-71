
import { useEffect, useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Theme } from '@/hooks/use-theme';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme] = useLocalStorage<Theme>('theme', 'dark');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Update canvas dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setDimensions({ width, height });
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Generate color scheme based on theme
  const getColorScheme = () => {
    switch(theme) {
      case 'light':
        return ['rgba(59, 130, 246, 0.6)', 'rgba(99, 102, 241, 0.5)', 'rgba(139, 92, 246, 0.4)'];
      case 'dark':
        return ['rgba(99, 102, 241, 0.4)', 'rgba(79, 70, 229, 0.3)', 'rgba(139, 92, 246, 0.2)'];
      case 'purple':
        return ['rgba(168, 85, 247, 0.5)', 'rgba(192, 132, 252, 0.4)', 'rgba(216, 180, 254, 0.3)'];
      case 'blue':
        return ['rgba(59, 130, 246, 0.5)', 'rgba(96, 165, 250, 0.4)', 'rgba(147, 197, 253, 0.3)'];
      case 'green':
        return ['rgba(34, 197, 94, 0.5)', 'rgba(74, 222, 128, 0.4)', 'rgba(134, 239, 172, 0.3)'];
      default:
        return ['rgba(99, 102, 241, 0.4)', 'rgba(79, 70, 229, 0.3)', 'rgba(139, 92, 246, 0.2)'];
    }
  };

  // Initialize particles
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const colors = getColorScheme();
      const particleCount = Math.max(Math.floor((dimensions.width * dimensions.height) / 20000), 30);
      
      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.6 + 0.2
        });
      }
      
      particlesRef.current = particles;
    }
  }, [dimensions, theme]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > dimensions.width) {
          particle.speedX *= -1;
        }
        
        if (particle.y < 0 || particle.y > dimensions.height) {
          particle.speedY *= -1;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Draw connections
        particlesRef.current.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${theme === 'light' ? '0,0,0' : '255,255,255'},${0.1 - distance/1200})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, isVisible, theme]);

  // Toggle particles visibility
  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none z-0"
          />
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={toggleVisibility}
        className="fixed bottom-4 left-4 z-50 bg-primary/10 hover:bg-primary/20 text-foreground rounded-full p-2 text-xs"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isVisible ? 'Masquer Particules' : 'Afficher Particules'}
      </motion.button>
    </>
  );
}
