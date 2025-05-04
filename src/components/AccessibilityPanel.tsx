
import { useState, useEffect } from "react";
import { Accessibility, Check, Keyboard, MousePointer2, Speech, Braces, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  focusIndicators: boolean;
  keyboardNavigationEnabled: boolean;
  textSpacing: number;
  autoplayMedia: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  focusIndicators: true,
  keyboardNavigationEnabled: true,
  textSpacing: 1,
  autoplayMedia: true,
};

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    "accessibility-settings",
    defaultSettings
  );
  const { toast } = useToast();

  // Applique les paramètres d'accessibilité
  useEffect(() => {
    const root = document.documentElement;
    
    // Contraste élevé
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    // Texte plus grand
    if (settings.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }
    
    // Réduction des mouvements
    if (settings.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }
    
    // Indicateurs de focus
    if (settings.focusIndicators) {
      root.classList.add("focus-indicators");
    } else {
      root.classList.remove("focus-indicators");
    }
    
    // Espacement du texte
    root.style.setProperty("--text-spacing", `${settings.textSpacing}`);
    
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings({ ...settings, [key]: value });
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast({
      title: "Réinitialisation",
      description: "Les paramètres d'accessibilité ont été réinitialisés",
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <Accessibility className="h-4 w-4" />
        <span className="sr-only">Paramètres d'accessibilité</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Paramètres d'accessibilité</DialogTitle>
            <DialogDescription>
              Personnalisez l'application pour améliorer votre expérience
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="visual">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="visual">Visuel</TabsTrigger>
              <TabsTrigger value="interaction">Interaction</TabsTrigger>
              <TabsTrigger value="media">Média et contenu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">Contraste élevé</Label>
                  <p className="text-xs text-muted-foreground">
                    Augmente le contraste pour une meilleure lisibilité
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="large-text">Texte plus grand</Label>
                  <p className="text-xs text-muted-foreground">
                    Augmente la taille du texte dans l'application
                  </p>
                </div>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) => updateSetting("largeText", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="text-spacing">Espacement du texte</Label>
                  <span className="text-xs text-muted-foreground">
                    {settings.textSpacing === 1 ? "Normal" : settings.textSpacing === 1.5 ? "Moyen" : "Large"}
                  </span>
                </div>
                <Slider
                  id="text-spacing"
                  min={1}
                  max={2}
                  step={0.25}
                  value={[settings.textSpacing]}
                  onValueChange={([value]) => updateSetting("textSpacing", value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="focus-indicators">Indicateurs de focus</Label>
                  <p className="text-xs text-muted-foreground">
                    Affiche des indicateurs visuels pour les éléments en focus
                  </p>
                </div>
                <Switch
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) => updateSetting("focusIndicators", checked)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="interaction" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion">Réduire les animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Réduit ou désactive les animations dans l'interface
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="keyboard-navigation">Navigation clavier</Label>
                  <p className="text-xs text-muted-foreground">
                    Améliore la navigation au clavier sans souris
                  </p>
                </div>
                <Switch
                  id="keyboard-navigation"
                  checked={settings.keyboardNavigationEnabled}
                  onCheckedChange={(checked) => updateSetting("keyboardNavigationEnabled", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="screen-reader">Compatibilité lecteur d'écran</Label>
                  <p className="text-xs text-muted-foreground">
                    Optimise l'interface pour les lecteurs d'écran (NVDA, VoiceOver, etc.)
                  </p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoplay-media">Lecture automatique des médias</Label>
                  <p className="text-xs text-muted-foreground">
                    Contrôle la lecture automatique des médias (vidéos, sons)
                  </p>
                </div>
                <Switch
                  id="autoplay-media"
                  checked={settings.autoplayMedia}
                  onCheckedChange={(checked) => updateSetting("autoplayMedia", checked)}
                />
              </div>
              
              <div className="p-3 border rounded-md bg-background">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Speech className="h-4 w-4" />
                  Assistant vocal
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Vous pouvez utiliser la reconnaissance vocale pour interagir avec l'application.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Assistant vocal",
                      description: "L'assistant vocal a été activé",
                    });
                  }}
                >
                  Activer l'assistant vocal
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 mt-4">
            <Button variant="outline" onClick={resetToDefaults}>
              Réinitialiser
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
