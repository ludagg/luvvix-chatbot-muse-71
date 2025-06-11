
import React, { useState, useEffect } from 'react';
import { useMobileApp } from '@/hooks/use-mobile-app';
import SplashScreen from './SplashScreen';
import MobileBottomNav from './MobileBottomNav';

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

const MobileAppWrapper = ({ children }: MobileAppWrapperProps) => {
  const { isMobileApp } = useMobileApp();
  const [showSplash, setShowSplash] = useState(isMobileApp);

  useEffect(() => {
    if (isMobileApp) {
      setShowSplash(true);
    }
  }, [isMobileApp]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

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
