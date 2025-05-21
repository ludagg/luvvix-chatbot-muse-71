
"use client";
import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export const HoverGlowCard = ({
  children,
  className,
  containerClassName,
  style,
  cardStyle,
  shadowBlurRadius = 24,
  shadowColor = "rgba(0, 0, 0, 0.35)",
  shadowOpacity = 0.5,
  shadowHoverOpacity = 1,
  shadowSpread = 8,
  shadowHoverSpread = 16,
  glowRadius = 50,
  glowHoverRadius = 80,
  glowColor = "rgba(255, 255, 255, 0.6)",
  glowHoverColor = "rgba(255, 255, 255, 0.8)",
  throttleAmount = 0.1, // Controls the animation smoothness. Lower values are smoother.
  containerStyle,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  containerClassName?: string;
  cardStyle?: React.CSSProperties;
  shadowBlurRadius?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowHoverOpacity?: number;
  shadowSpread?: number;
  shadowHoverSpread?: number;
  glowRadius?: number;
  glowHoverRadius?: number;
  glowColor?: string;
  glowHoverColor?: string;
  throttleAmount?: number;
  containerStyle?: React.CSSProperties;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [8, -8]);
  const rotateY = useTransform(x, [-300, 300], [-8, 8]);

  const diagonalMovement = {
    x: useSpring(x, { stiffness: 150, damping: 20 }),
    y: useSpring(y, { stiffness: 150, damping: 20 }),
  };

  function onMouseMove(e: React.MouseEvent<HTMLDivElement> | TouchEvent) {
    // Check for MouseEvent specifically
    if ('clientX' in e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      x.set(mouseX * throttleAmount);
      y.set(mouseY * throttleAmount);
    } 
  }

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className={cn("relative", containerClassName)}
      onMouseMove={onMouseMove}
      onMouseLeave={handleMouseLeave}
      style={containerStyle}
    >
      <motion.div
        className={cn(
          "relative z-20 transition-all duration-500 ease-out",
          className
        )}
        style={{
          ...style,
          rotateX,
          rotateY,
          translateX: diagonalMovement.x,
          translateY: diagonalMovement.y,
        }}
        {...rest}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br rounded-md opacity-0 group-hover:opacity-100 blur transition duration-500"
          style={{
            background: `radial-gradient(circle at center, ${glowColor}, transparent ${glowRadius}%)`,
            boxShadow: `0 0 ${shadowBlurRadius}px ${shadowSpread}px ${shadowColor}`,
            opacity: shadowOpacity,
          }}
        />

        {/* Card Content */}
        <div
          className="relative z-10 w-full h-full bg-card rounded-xl backdrop-blur-md overflow-hidden"
          style={cardStyle}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default HoverGlowCard;
