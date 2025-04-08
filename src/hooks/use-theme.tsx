
import { useState, useEffect, createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export type Theme = 'light' | 'dark' | 'purple' | 'blue' | 'green';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeName: (theme: Theme) => string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  getThemeName: () => ''
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [mounted, setMounted] = useState(false);

  // Helper function to get the display name for a theme
  const getThemeName = (t: Theme): string => {
    switch(t) {
      case 'light': return 'Clair';
      case 'dark': return 'Sombre';
      case 'purple': return 'Violet';
      case 'blue': return 'Bleu';
      case 'green': return 'Vert';
      default: return t;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // First, remove all theme classes
    root.classList.remove('light', 'dark', 'theme-purple', 'theme-blue', 'theme-green');
    
    // Then apply the appropriate classes based on the theme
    if (theme === 'purple') {
      root.classList.add('dark', 'theme-purple');
    } else if (theme === 'blue') {
      root.classList.add('dark', 'theme-blue');
    } else if (theme === 'green') {
      root.classList.add('dark', 'theme-green');
    } else {
      root.classList.add(theme);
    }
    
    // Store the theme in localStorage directly as a backup
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
