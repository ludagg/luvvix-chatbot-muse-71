
import { useState, useEffect } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export type Theme = 'light' | 'dark' | 'purple' | 'blue' | 'green';

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'theme-purple', 'theme-blue', 'theme-green');
    
    if (theme === 'purple') {
      root.classList.add('dark', 'theme-purple');
    } else if (theme === 'blue') {
      root.classList.add('dark', 'theme-blue');
    } else if (theme === 'green') {
      root.classList.add('dark', 'theme-green');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const toggleBasicTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <Toggle 
        pressed={theme === 'light'} 
        onPressedChange={toggleBasicTheme}
        aria-label="Toggle basic theme"
        className="h-8 w-8"
      >
        {theme === 'dark' || theme === 'purple' || theme === 'blue' || theme === 'green' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Toggle>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            Sombre (Par défaut)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('light')}>
            Clair
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('purple')}>
            Violet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('blue')}>
            Bleu
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('green')}>
            Vert
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
