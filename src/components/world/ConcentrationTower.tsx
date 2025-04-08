
import { motion } from "framer-motion";

interface ConcentrationTowerProps {
  height: number; // 0-100
  onClick: () => void;
}

export const ConcentrationTower = ({ height, onClick }: ConcentrationTowerProps) => {
  // Calculate tower segments based on height
  const segments = Math.max(1, Math.ceil(height / 20));
  const actualHeight = 100 + (height / 100) * 100;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-end h-full">
        {Array.from({ length: segments }).map((_, index) => {
          const segmentHeight = (actualHeight / segments) * 0.8;
          const segmentWidth = 40 - index * (20 / segments);
          
          return (
            <motion.div
              key={index}
              className="bg-gradient-to-t from-purple-200 to-indigo-100 dark:from-purple-600/40 dark:to-indigo-400/40 rounded-lg border border-white/30 backdrop-blur-sm"
              style={{
                height: `${segmentHeight}px`,
                width: `${segmentWidth}px`,
                marginBottom: index === segments - 1 ? 0 : '-5px',
                zIndex: segments - index,
              }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.5 + index * 0.1,
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <div className="h-full w-full flex items-center justify-center">
                {index === 0 && (
                  <motion.div
                    className="h-3 w-3 rounded-full bg-yellow-400/80 shadow-lg"
                    animate={{ 
                      boxShadow: [
                        '0 0 5px 2px rgba(250, 204, 21, 0.3)', 
                        '0 0 12px 4px rgba(250, 204, 21, 0.5)', 
                        '0 0 5px 2px rgba(250, 204, 21, 0.3)'
                      ],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
        
        {/* Base */}
        <motion.div
          className="mt-1 w-48 h-6 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700/40 dark:to-gray-500/40 rounded-lg border border-white/30 backdrop-blur-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />
      </div>
      
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center text-foreground/70 font-light mt-2 whitespace-nowrap">
        Concentration
      </div>
    </motion.div>
  );
};
