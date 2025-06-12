
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-white z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Logo officiel LuvviX */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 mb-6 relative">
          <img 
            src="/lovable-uploads/4e135247-8f83-4117-8247-edc3de222f86.png" 
            alt="LuvviX Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LuvviX OS</h1>
        <p className="text-lg text-gray-600 font-medium">L'écosystème intelligent</p>
      </div>

      {/* Animation de chargement élégante */}
      <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden mb-20">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
      </div>

      {/* Vision et créateur */}
      <div className="absolute bottom-8 left-0 right-0 text-center px-8">
        <p className="text-sm text-gray-500 leading-relaxed mb-2">
          "Révolutionner l'expérience numérique en unifiant intelligence artificielle et simplicité d'usage"
        </p>
        <p className="text-xs text-gray-400">
          Conçu par Ludovic Aggaï
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
