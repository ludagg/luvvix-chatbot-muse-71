
import { useState, useCallback, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((name: string) => {
    timersRef.current.set(name, performance.now());
  }, []);

  const endTimer = useCallback((name: string) => {
    const startTime = timersRef.current.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      const metric: PerformanceMetric = {
        name,
        duration,
        timestamp: Date.now()
      };
      
      setMetrics(prev => [...prev.slice(-49), metric]); // Keep last 50 metrics
      timersRef.current.delete(name);
      
      // Log slow operations
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }, []);

  const measure = useCallback(async <T,>(name: string, operation: () => Promise<T>): Promise<T> => {
    startTimer(name);
    try {
      const result = await operation();
      endTimer(name);
      return result;
    } catch (error) {
      endTimer(name);
      throw error;
    }
  }, [startTimer, endTimer]);

  const getAverageTime = useCallback((operationName: string) => {
    const operationMetrics = metrics.filter(m => m.name === operationName);
    if (operationMetrics.length === 0) return 0;
    
    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMetrics.length;
  }, [metrics]);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  return {
    startTimer,
    endTimer,
    measure,
    getAverageTime,
    clearMetrics,
    metrics,
    slowOperations: metrics.filter(m => m.duration > 1000)
  };
};
