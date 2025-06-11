
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      {/* Logo principal avec les deux étoiles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mb-16"
      >
        {/* Étoile bleue en haut */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.09 8.26L22 9L16 14.74L17.18 22.5L12 19.77L6.82 22.5L8 14.74L2 9L9.91 8.26L12 2Z" fill="#3B82F6"/>
          </svg>
        </div>

        {/* Logo principal - feuilles vertes et bleues */}
        <div className="flex items-center justify-center">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Feuille verte à gauche */}
            <path d="M20 60C20 40 35 20 55 20C45 30 40 45 45 60C40 65 30 65 20 60Z" fill="#10B981"/>
            {/* Feuille bleue au centre */}
            <path d="M45 65C35 45 40 25 60 15C55 25 55 40 65 55C70 60 65 70 45 65Z" fill="#3B82F6"/>
            {/* Feuille bleue foncée à droite */}
            <path d="M65 60C55 40 60 20 80 10C75 20 75 35 85 50C90 55 85 65 65 60Z" fill="#1E40AF"/>
          </svg>
        </div>

        {/* Petite étoile verte en bas à droite */}
        <div className="absolute -bottom-4 -right-8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.09 8.26L22 9L16 14.74L17.18 22.5L12 19.77L6.82 22.5L8 14.74L2 9L9.91 8.26L12 2Z" fill="#10B981"/>
          </svg>
        </div>
      </motion.div>

      {/* Titre principal */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-5xl font-bold text-gray-900 mb-4"
      >
        LuvviX OS
      </motion.h1>

      {/* Sous-titre */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-xl text-gray-600 mb-32"
      >
        Votre écosystème intelligent
      </motion.p>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-gray-400 text-lg">
          from <span className="text-gray-600 font-medium">LuvviX Technologies</span>
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
