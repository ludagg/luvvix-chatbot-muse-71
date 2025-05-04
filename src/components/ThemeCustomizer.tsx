
import { useState } from "react";
import { Check, Paintbrush } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Theme } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const themes = [
  {
    name: "Clair",
    value: "light" as Theme,
    color: "#ffffff",
    textColor: "#000000",
  },
  {
    name: "Sombre",
    value: "dark" as Theme,
    color: "#161618",
    textColor: "#ffffff",
  },
  {
    name: "Violet",
    value: "purple" as Theme,
    color: "#2d1b69",
    textColor: "#ffffff",
  },
  {
    name: "Bleu",
    value: "blue" as Theme,
    color: "#0f172a",
    textColor: "#38bdf8",
  },
  {
    name: "Vert",
    value: "green" as Theme,
    color: "#0f291e",
    textColor: "#4ade80",
  },
];

const fontSizes = ["Petit", "Normal", "Grand", "Très grand"];

export function ThemeCustomizer() {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "dark");
  const [fontSize, setFontSize] = useLocalStorage<string>("fontSize", "Normal");
  const [highContrast, setHighContrast] = useLocalStorage<boolean>("highContrast", false);
  const [reducedMotion, setReducedMotion] = useLocalStorage<boolean>("reducedMotion", false);

  const applyFontSize = (size: string) => {
    const html = document.documentElement;
    
    // Réinitialiser les classes de taille de police
    html.classList.remove("text-sm", "text-base", "text-lg", "text-xl");
    
    switch(size) {
      case "Petit":
        html.classList.add("text-sm");
        break;
      case "Normal":
        html.classList.add("text-base");
        break;
      case "Grand":
        html.classList.add("text-lg");
        break;
      case "Très grand":
        html.classList.add("text-xl");
        break;
    }
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    
    if (newValue) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    
    if (newValue) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  };

  // Appliquer les préférences au chargement
  useState(() => {
    applyFontSize(fontSize);
    
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    }
    
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    }
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Personnaliser l'interface</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[240px] p-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Thème</h4>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-md cursor-pointer",
                    theme === t.value && "border-2 border-primary"
                  )}
                  onClick={() => setTheme(t.value)}
                >
                  <div
                    className="w-8 h-8 rounded-full mb-1"
                    style={{ backgroundColor: t.color, border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    {theme === t.value && (
                      <Check
                        className="w-4 h-4 mx-auto mt-2"
                        style={{ color: t.textColor }}
                      />
                    )}
                  </div>
                  <span className="text-xs">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Taille du texte</h4>
            <div className="grid grid-cols-2 gap-2">
              {fontSizes.map((size) => (
                <button
                  key={size}
                  className={cn(
                    "py-1 px-2 rounded-md text-center text-sm",
                    fontSize === size
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  onClick={() => {
                    setFontSize(size);
                    applyFontSize(size);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Accessibilité</h4>
            <div className="space-y-2">
              <button
                className={cn(
                  "w-full py-1 px-2 rounded-md text-center text-sm",
                  highContrast
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={toggleHighContrast}
              >
                Contraste élevé {highContrast ? "✓" : ""}
              </button>
              
              <button
                className={cn(
                  "w-full py-1 px-2 rounded-md text-center text-sm",
                  reducedMotion
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={toggleReducedMotion}
              >
                Réduire les animations {reducedMotion ? "✓" : ""}
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
