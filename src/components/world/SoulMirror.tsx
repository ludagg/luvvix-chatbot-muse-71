
import { motion } from "framer-motion";

interface SoulMirrorProps {
  emotionalState: number; // 0-100
  onClick: () => void;
}

export const SoulMirror = ({ emotionalState, onClick }: SoulMirrorProps) => {
  // Map emotional state to colors
  const getEmotionColor = () => {
    if (emotionalState < 30) return { from: 'from-blue-300', to: 'to-blue-100', dark: 'dark:from-blue-600/40 dark:to-blue-400/40' }; // Sad
    if (emotionalState < 50) return { from: 'from-indigo-300', to: 'to-blue-200', dark: 'dark:from-indigo-600/40 dark:to-blue-500/40' }; // Calm
    if (emotionalState < 70) return { from: 'from-green-300', to: 'to-teal-200', dark: 'dark:from-green-600/40 dark:to-teal-400/40' }; // Content
    if (emotionalState < 90) return { from: 'from-yellow-300', to: 'to-orange-200', dark: 'dark:from-yellow-600/40 dark:to-orange-400/40' }; // Happy
    return { from: 'from-orange-300', to: 'to-pink-200', dark: 'dark:from-orange-600/40 dark:to-pink-400/40' }; // Joyful
  };
  
  const emotionColor = getEmotionColor();
  
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
      <motion.div 
        className={`w-40 h-60 rounded-xl backdrop-blur-md bg-gradient-to-br ${emotionColor.from} ${emotionColor.to} ${emotionColor.dark} border border-white/30 shadow-lg overflow-hidden`}
        animate={{ 
          boxShadow: [
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          ],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div 
            className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <motion.div
              className="text-3xl"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              {emotionalState < 30 ? "😌" : 
               emotionalState < 50 ? "😊" : 
               emotionalState < 70 ? "😄" : 
               emotionalState < 90 ? "😁" : "🤩"}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center text-foreground/70 font-light mt-2 whitespace-nowrap">
        Miroir de l'âme
      </div>
    </motion.div>
  );
};
