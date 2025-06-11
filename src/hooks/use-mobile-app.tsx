
import { useState, useEffect } from 'react';

export const useMobileApp = () => {
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);

  useEffect(() => {
    // Vérifier si nous sommes dans Capacitor
    const checkCapacitor = () => {
      // @ts-ignore
      return window.Capacitor !== undefined;
    };

    // Vérifier si nous sommes sur un appareil mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'mobile'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
             window.innerWidth <= 768;
    };

    setIsCapacitor(checkCapacitor());
    setIsMobileApp(checkCapacitor() || checkMobile());
  }, []);

  return { isMobileApp, isCapacitor };
};
