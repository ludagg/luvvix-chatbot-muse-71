
import { motion } from "framer-motion";

interface CentralPlanetProps {
  progress: number; // 0-1
  onClick: () => void;
}

export const CentralPlanet = ({ progress, onClick }: CentralPlanetProps) => {
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
      className="relative cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div 
        className="rounded-full bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-500/40 dark:to-purple-600/40 backdrop-blur-sm border border-white/30 shadow-lg flex items-center justify-center"
        style={{ 
          width: `${size}px`, 
          height: `${size}px` 
        }}
      >
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-white/5 backdrop-blur-sm border border-white/20 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs text-center text-white/80 font-light p-4">
          <span className="drop-shadow-md">Conscience</span>
        </div>
      </div>
      
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" style={{ width: `${size*0.8}px`, height: `${size*0.8}px`, left: `${size*0.1}px`, top: `${size*0.1}px` }}></div>
      
      {/* Orbiting particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white shadow-lg"
          initial={{ x: 0, y: 0 }}
          animate={{
            x: Math.cos(i * (2 * Math.PI / 8)) * (size / 1.5),
            y: Math.sin(i * (2 * Math.PI / 8)) * (size / 1.5),
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
      
      {/* Floating star particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white/70"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </motion.div>
  );
};
