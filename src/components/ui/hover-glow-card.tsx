
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HoverGlowCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function HoverGlowCard({
  children,
  className,
  containerClassName,
  size = "md",
}: HoverGlowCardProps) {
  const [mousePosition, setMousePosition] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const sizeStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Get the position relative to the element
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border bg-background",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
    >
      <div
        className={cn(
          "relative z-10 transition-colors duration-300",
          sizeStyles[size],
          className
        )}
      >
        {children}
      </div>

      <motion.div
        className="glow absolute left-0 top-0 z-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 30,
          mass: 0.5,
        }}
        style={{
          pointerEvents: 'none',  // Fix: Prevent it from capturing mouse events
          position: 'absolute',  // Fix: Ensure absolute positioning
        }}
      />
    </div>
  );
}
