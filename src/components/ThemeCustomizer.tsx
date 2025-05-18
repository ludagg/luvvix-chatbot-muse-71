
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
  }
];

const fontSizes = ["Petit", "Normal", "Grand", "Très grand"];

export function ThemeCustomizer() {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "dark");
  const [fontSize, setFontSize] = useLocalStorage<string>("fontSize", "Normal");

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

  // Appliquer les préférences au chargement
  useState(() => {
    applyFontSize(fontSize);
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-800 border-0">
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Personnaliser l'interface</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[240px] p-4 bg-gray-800 border border-gray-700">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Thème</h4>
            <div className="grid grid-cols-2 gap-2">
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
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
