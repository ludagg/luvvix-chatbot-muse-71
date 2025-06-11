
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: Brain, text: "Initialisation de l'IA...", color: "text-blue-500" },
    { icon: Sparkles, text: "Chargement de l'écosystème...", color: "text-purple-500" },
    { icon: Zap, text: "Préparation de votre expérience...", color: "text-yellow-500" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center z-50">
      <div className="text-center space-y-8">
        {/* Logo animé */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              L
            </span>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </motion.div>
        </motion.div>

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">LuvviX</h1>
          <p className="text-xl text-blue-100">Écosystème Intelligent</p>
        </motion.div>

        {/* Étapes de chargement */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center space-x-3"
            >
              {React.createElement(steps[currentStep].icon, {
                className: `w-6 h-6 ${steps[currentStep].color}`,
              })}
              <span className="text-white font-medium">
                {steps[currentStep].text}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Barre de progression */}
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Points de chargement */}
        <div className="flex space-x-2 justify-center">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index <= currentStep ? 'bg-white' : 'bg-white/30'
              }`}
              animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: index === currentStep ? Infinity : 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
