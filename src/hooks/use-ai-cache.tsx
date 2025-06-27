
import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  defaultTTL?: number; // Time to live in milliseconds
  maxSize?: number;
}

export const useAICache = (config: CacheConfig = {}) => {
  const { defaultTTL = 300000, maxSize = 100 } = config; // 5 minutes default TTL
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
      }
    }
  }, []);

  const get = useCallback((key: string) => {
    cleanupExpired();
    const entry = cacheRef.current.get(key);
    
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return entry.data;
    }
    
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [cleanupExpired]);

  const set = useCallback((key: string, data: any, ttl: number = defaultTTL) => {
    const cache = cacheRef.current;
    
    // If cache is full, remove oldest entry
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, [defaultTTL, maxSize]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    setCacheStats({ hits: 0, misses: 0 });
  }, []);

  const remove = useCallback((key: string) => {
    return cacheRef.current.delete(key);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const interval = setInterval(cleanupExpired, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, [cleanupExpired]);

  return {
    get,
    set,
    clear,
    remove,
    stats: cacheStats,
    size: cacheRef.current.size
  };
};
