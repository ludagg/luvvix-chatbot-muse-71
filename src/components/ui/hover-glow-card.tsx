
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export interface HoverGlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const HoverGlowCard: React.FC<HoverGlowCardProps> = ({
  children,
  className,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  // Filter out non-Motion props
  const motionProps = { ...props };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-800/30 dark:to-neutral-900/30 dark:border-neutral-800",
        className
      )}
      {...motionProps}
    >
      {children}
      {isMounted && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
          style={{
            opacity,
            background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, rgba(120, 100, 255, 0.1), transparent)`,
          }}
        />
      )}
    </motion.div>
  );
};
