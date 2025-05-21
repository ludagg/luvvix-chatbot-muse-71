
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export interface CardHoverEffectProps {
  items: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  className?: string;
}

export const CardHoverEffect = ({
  items,
  className,
}: CardHoverEffectProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-luvvix-purple/10 block rounded-xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.2 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.2, delay: 0.1 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full flex flex-col relative">
            <div className="mb-5 flex flex-col gap-4">
              <div className="flex items-center">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{
                    scale: hoveredIndex === idx ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-lg bg-luvvix-purple/20 flex items-center justify-center text-luvvix-lightpurple"
                >
                  {item.icon}
                </motion.div>
              </div>
              <span className="block text-xl font-semibold text-white">{item.title}</span>
            </div>
            <p className="text-white/70 leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
