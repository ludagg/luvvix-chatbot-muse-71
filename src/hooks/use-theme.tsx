
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light'; // Always resolved to light theme
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'luvvix-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      // Only allow 'light' or 'system' as valid themes
      return (storedTheme === 'light' || storedTheme === 'system') ? storedTheme : defaultTheme;
    }
  );
  
  // Always set resolved theme to light
  const resolvedTheme: 'light' = 'light';
  
  // Handle theme changes - always apply light theme
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Always apply light theme
    root.classList.add('light');
    
    // Set data-theme attribute for libraries that use it
    root.setAttribute('data-theme', 'light');
  }, [theme]);

  // Apply any additional custom styling for AI Studio UI
  useEffect(() => {
    // Apply additional global styles for AI Studio's modern UI
    const root = window.document.documentElement;
    
    // Ensure smooth scrolling for page transitions
    root.style.scrollBehavior = 'smooth';
    
    // Enhance the scrollbar styling
    const style = document.createElement('style');
    style.textContent = `
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
      }
      
      body {
        overflow-x: hidden;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  
  return context;
};
