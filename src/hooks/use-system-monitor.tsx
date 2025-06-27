
import { useState, useEffect, useCallback, useRef } from 'react';

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    fps: number;
    responseTime: number;
    loadTime: number;
  };
  errors: Array<{
    message: string;
    timestamp: number;
    stack?: string;
  }>;
  network: {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
  };
}

export const useSystemMonitor = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memory: { used: 0, total: 0, percentage: 0 },
    performance: { fps: 0, responseTime: 0, loadTime: 0 },
    errors: [],
    network: { online: navigator.onLine }
  });

  const fpsRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const measureFPS = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;

    if (now - lastTimeRef.current >= 1000) {
      fpsRef.current = frameCountRef.current;
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    // Start FPS monitoring
    requestAnimationFrame(measureFPS);

    // Memory monitoring
    const updateMemoryMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
          },
          performance: {
            ...prev.performance,
            fps: fpsRef.current,
            loadTime: performance.timing ? 
              performance.timing.loadEventEnd - performance.timing.navigationStart : 0
          }
        }));
      }
    };

    // Network monitoring
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setMetrics(prev => ({
        ...prev,
        network: {
          online: navigator.onLine,
          effectiveType: connection?.effectiveType,
          downlink: connection?.downlink
        }
      }));
    };

    // Error monitoring
    const handleError = (event: ErrorEvent) => {
      setMetrics(prev => ({
        ...prev,
        errors: [...prev.errors.slice(-9), {
          message: event.message,
          timestamp: Date.now(),
          stack: event.error?.stack
        }]
      }));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setMetrics(prev => ({
        ...prev,
        errors: [...prev.errors.slice(-9), {
          message: `Unhandled Promise Rejection: ${event.reason}`,
          timestamp: Date.now()
        }]
      }));
    };

    // Set up intervals and event listeners
    const memoryInterval = setInterval(updateMemoryMetrics, 2000);
    const networkInterval = setInterval(updateNetworkStatus, 5000);

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Initial updates
    updateMemoryMetrics();
    updateNetworkStatus();

    return () => {
      clearInterval(memoryInterval);
      clearInterval(networkInterval);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [measureFPS]);

  const getHealthScore = useCallback(() => {
    let score = 100;
    
    // Memory health (penalty for high usage)
    if (metrics.memory.percentage > 80) score -= 20;
    else if (metrics.memory.percentage > 60) score -= 10;
    
    // Performance health
    if (metrics.performance.fps < 30) score -= 15;
    else if (metrics.performance.fps < 45) score -= 5;
    
    // Error health
    const recentErrors = metrics.errors.filter(e => Date.now() - e.timestamp < 60000);
    score -= recentErrors.length * 5;
    
    // Network health
    if (!metrics.network.online) score -= 30;
    
    return Math.max(0, score);
  }, [metrics]);

  const clearErrors = useCallback(() => {
    setMetrics(prev => ({ ...prev, errors: [] }));
  }, []);

  return {
    metrics,
    healthScore: getHealthScore(),
    clearErrors,
    isHealthy: getHealthScore() > 70
  };
};
