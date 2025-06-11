
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MobileHomePage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      {/* Logo et titre principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-auto mt-32"
      >
        {/* Logo */}
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <img 
            src="/lovable-uploads/71c65bb9-79d9-4676-a7a6-ba8ab43c7d8a.png" 
            alt="LuvviX Logo" 
            className="w-full h-full object-contain"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-blue-500" />
          </motion.div>
        </div>

        {/* Titre */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          LuvviX OS
        </h1>
        <p className="text-lg text-gray-600">
          Votre écosystème intelligent
        </p>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mb-24 text-center"
      >
        <p className="text-sm text-gray-400">
          from <span className="font-semibold text-gray-600">LuvviX Technologies</span>
        </p>
      </motion.div>
    </div>
  );
};

export default MobileHomePage;
