
import { motion } from "framer-motion";

interface DreamPortalProps {
  openness: number; // 0-100
}

export const DreamPortal = ({ openness }: DreamPortalProps) => {
  // Scale based on openness
  const size = 60 + (openness / 100) * 40;
  const opacity = 0.4 + (openness / 100) * 0.6;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <motion.div 
          className="rounded-full bg-gradient-to-br from-pink-300 to-purple-200 dark:from-pink-600/30 dark:to-purple-500/30 backdrop-blur-md border border-white/30 overflow-hidden shadow-lg"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
          }}
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ 
            rotate: {
              repeat: Infinity,
              duration: 20,
              ease: "linear",
            }
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3/4 h-3/4 rounded-full bg-white"
              style={{ opacity }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [opacity, opacity + 0.2, opacity],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
        </motion.div>
        
        {/* Decorative floating stars */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full size-1.5"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center text-foreground/70 font-light mt-2 whitespace-nowrap">
        Portail des rêves
      </div>
    </motion.div>
  );
};
