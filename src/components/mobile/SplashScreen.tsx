
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    // Splash screen simple qui disparaît après 2 secondes
    const timer = setTimeout(onComplete, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Logo */}
        <div className="w-24 h-24 mx-auto mb-6">
          <img 
            src="/lovable-uploads/71c65bb9-79d9-4676-a7a6-ba8ab43c7d8a.png" 
            alt="LuvviX Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          LuvviX OS
        </h1>
        
        {/* Loading indicator simple */}
        <div className="w-8 h-8 mx-auto">
          <div className="w-full h-full border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
