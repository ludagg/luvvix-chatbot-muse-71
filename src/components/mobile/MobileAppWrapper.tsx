
import React, { useState, useEffect } from 'react';
import { useMobileApp } from '@/hooks/use-mobile-app';
import SplashScreen from './SplashScreen';
import MobileBottomNav from './MobileBottomNav';

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

const MobileAppWrapper = ({ children }: MobileAppWrapperProps) => {
  const { isMobileApp } = useMobileApp();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Afficher le splash screen seulement au premier chargement
    if (isMobileApp && !sessionStorage.getItem('splashShown')) {
      setShowSplash(true);
      sessionStorage.setItem('splashShown', 'true');
    }
  }, [isMobileApp]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Si on doit afficher le splash screen
  if (showSplash && isMobileApp) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className={isMobileApp ? 'mobile-app' : ''}>
      {children}
      {isMobileApp && <MobileBottomNav />}
    </div>
  );
};

export default MobileAppWrapper;
