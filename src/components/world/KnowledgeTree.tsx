
import { motion } from "framer-motion";

interface KnowledgeTreeProps {
  growth: number; // 0-100
  onClick: () => void;
}

export const KnowledgeTree = ({ growth, onClick }: KnowledgeTreeProps) => {
  // Scale height based on growth
  const height = 80 + (growth / 100) * 120;
  const leafDensity = Math.max(1, Math.floor(growth / 10));
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Tree Trunk */}
      <motion.div 
        className="w-6 mx-auto bg-gradient-to-t from-amber-800 to-amber-600 dark:from-amber-900 dark:to-amber-700 rounded-full"
        style={{ height: `${height}px` }}
        initial={{ height: 50 }}
        animate={{ height }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      {/* Foliage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="relative w-full"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        >
          {Array.from({ length: leafDensity }).map((_, index) => {
            const size = 25 + Math.random() * 30;
            const angle = (index / leafDensity) * 360;
            const radius = 20 + (growth / 100) * 60;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius - height / 2;
            
            return (
              <motion.div
                key={index}
                className="absolute rounded-full bg-gradient-to-br from-green-300 to-green-200 dark:from-green-500 dark:to-green-600 shadow-inner"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  x: [0, Math.random() * 3 - 1.5, 0],
                  y: [0, Math.random() * 3 - 1.5, 0],
                }}
                transition={{
                  scale: { duration: 0.5, delay: 0.5 + index * 0.1 },
                  x: { 
                    repeat: Infinity, 
                    duration: 2 + Math.random() * 2, 
                    ease: "easeInOut" 
                  },
                  y: { 
                    repeat: Infinity, 
                    duration: 2 + Math.random() * 2, 
                    ease: "easeInOut" 
                  },
                }}
              />
            );
          })}
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-center text-foreground/70 font-light mt-2 whitespace-nowrap">
        Savoir
      </div>
    </motion.div>
  );
};
