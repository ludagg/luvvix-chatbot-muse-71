
import { motion } from "framer-motion";

interface CentralPlanetProps {
  progress: number; // 0-1
}

export const CentralPlanet = ({ progress }: CentralPlanetProps) => {
  // Calculate size based on progress
  const size = 120 + progress * 50;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        rotate: [0, 360],
      }}
      transition={{ 
        duration: 100,
        rotate: {
          repeat: Infinity,
          duration: 120,
          ease: "linear",
        },
        opacity: { duration: 2 },
        scale: { duration: 2 },
      }}
      className="relative"
    >
      <div 
        className="rounded-full bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-500/40 dark:to-purple-600/40 backdrop-blur-sm border border-white/30 shadow-lg flex items-center justify-center"
        style={{ 
          width: `${size}px`, 
          height: `${size}px` 
        }}
      >
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs text-center text-white/80 font-light p-4">
          <span className="drop-shadow-md">Conscience</span>
        </div>
      </div>
      
      {/* Orbiting particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white shadow-lg"
          initial={{ x: 0, y: 0 }}
          animate={{
            x: Math.cos(i * (2 * Math.PI / 5)) * (size / 1.5),
            y: Math.sin(i * (2 * Math.PI / 5)) * (size / 1.5),
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
            scale: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            },
            opacity: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            },
          }}
        />
      ))}
    </motion.div>
  );
};
