
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "@/luvvix-chatbot-muse-33-main/src/hooks/use-local-storage";

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('luvvix-ai-theme', 'light');
  const [mounted, setMounted] = useState(false);

  // Après le rendu initial, on marque le composant comme monté
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Synchroniser avec le thème de l'application principale si besoin
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  // Si le composant n'est pas monté, retourner un bouton placeholder pour éviter de sauter
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9">
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Changer de thème</span>
    </Button>
  );
}
