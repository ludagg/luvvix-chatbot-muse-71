
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = (): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      // Handle plain strings that aren't JSON
      if (typeof initialValue === 'string') {
        return item as unknown as T;
      }
      
      // Try to parse JSON
      try {
        return JSON.parse(item) as T;
      } catch (e) {
        // If parsing fails, return the raw string value
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
        
      // If value is a simple string, save directly
      if (typeof valueToStore === 'string' || 
          typeof valueToStore === 'number' ||
          typeof valueToStore === 'boolean') {
        window.localStorage.setItem(key, String(valueToStore));
      } else {
        // Save as JSON for objects and arrays
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      
      // Save state
      setStoredValue(valueToStore);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // this only works for other documents, not the current one
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue];
}
