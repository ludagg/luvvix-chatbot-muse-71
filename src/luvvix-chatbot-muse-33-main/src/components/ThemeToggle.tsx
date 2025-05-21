
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <Toggle 
      pressed={theme === 'light'} 
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      className="h-8 w-8"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Toggle>
  );
}
