
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface HoverGlowCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const HoverGlowCard = React.forwardRef<HTMLDivElement, HoverGlowCardProps>(
  ({ className, glowColor = "rgba(125, 125, 255, 0.4)", children, ...props }, ref) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = React.useState(0);
    const cardRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    // Pour SSR et rendu initial quand JS n'est pas encore en cours d'exécution
    if (!isMounted) {
      // Only extract properties that we know exist in props
      const { 
        style, 
        "data-framer-appear-id": _, 
        onBeforeLayoutMeasure, 
        onLayoutMeasure,
        onPanSessionStart,
        onUpdate,
        onAnimationStart,
        onAnimationComplete,
        onLayoutAnimationStart,
        onLayoutAnimationComplete,
        transition,
        initial,
        animate,
        exit,
        variants,
        // Remove transformValues as it doesn't exist on the props type
        ...safeProps
      } = props;

      return (
        <div 
          ref={ref} 
          className={cn("relative overflow-hidden", className)}
          {...safeProps}
        >
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <motion.div
          style={{
            position: "absolute",
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
            width: "100%",
            height: "100%",
            opacity: opacity,
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      </motion.div>
    );
  }
);

HoverGlowCard.displayName = "HoverGlowCard";
