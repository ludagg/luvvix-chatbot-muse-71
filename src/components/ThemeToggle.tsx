
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
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';

export type Theme = 'light' | 'dark' | 'purple' | 'blue' | 'green';

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [mounted, setMounted] = useState(false);

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
    
    // Notify the user when theme is changed (except initial load)
    if (mounted) {
      toast.success(`Thème ${getThemeName(theme)} appliqué`);
    }
  }, [theme, mounted]);

  const toggleBasicTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
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
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <div className="p-2">
            <h4 className="font-medium mb-2 text-sm">Thèmes</h4>
            <ToggleGroup 
              type="single" 
              value={theme} 
              onValueChange={(value: string) => value && setTheme(value as Theme)}
              className="flex flex-col gap-1"
            >
              <ToggleGroupItem value="dark" className="justify-start">
                <div className="bg-primary/80 rounded-full w-4 h-4 mr-2"></div>
                Sombre (Par défaut)
              </ToggleGroupItem>
              <ToggleGroupItem value="light" className="justify-start">
                <div className="bg-blue-400 rounded-full w-4 h-4 mr-2"></div>
                Clair
              </ToggleGroupItem>
              <ToggleGroupItem value="purple" className="justify-start">
                <div className="bg-purple-500 rounded-full w-4 h-4 mr-2"></div>
                Violet
              </ToggleGroupItem>
              <ToggleGroupItem value="blue" className="justify-start">
                <div className="bg-blue-500 rounded-full w-4 h-4 mr-2"></div>
                Bleu
              </ToggleGroupItem>
              <ToggleGroupItem value="green" className="justify-start">
                <div className="bg-green-500 rounded-full w-4 h-4 mr-2"></div>
                Vert
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
