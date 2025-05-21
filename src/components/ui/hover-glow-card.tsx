
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface HoverGlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const HoverGlowCard = ({
  children,
  className,
  glowColor = "rgba(138, 135, 245, 0.2)",
  ...props
}: HoverGlowCardProps & Omit<HTMLMotionProps<"div">, keyof HoverGlowCardProps>) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        scale: isHovered ? 1.02 : 1,
        transition: { duration: 0.3 }
      }}
      {...props}
    >
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.2 : 1
        }}
        transition={{ duration: 0.4 }}
      >
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`,
            filter: 'blur(20px)'
          }}
        />
      </motion.div>
      
      {children}
    </motion.div>
  );
};
