
import { useState, useEffect } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';
import { useTheme, Theme } from '@/hooks/use-theme';

export function ThemeToggle() {
  const { theme, setTheme, getThemeName } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    // Notify the user when theme is changed (except initial load)
    if (mounted) {
      toast.success(`Thème ${getThemeName(theme)} appliqué`);
    }
  }, [theme, mounted, getThemeName]);

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
