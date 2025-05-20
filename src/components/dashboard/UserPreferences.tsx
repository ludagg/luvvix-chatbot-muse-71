
import React, { useState } from "react";
import { User, Moon, Sun, Monitor, Globe, Check, ChevronDown } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface UserPreferencesProps {
  userId: string;
}

interface UserPrefs {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    app: boolean;
    browser: boolean;
    marketing: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
}

const LANGUAGES = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
];

const UserPreferences: React.FC<UserPreferencesProps> = ({ userId }) => {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPrefs>({
    theme: 'system',
    language: 'fr',
    notifications: {
      email: true,
      app: true,
      browser: false,
      marketing: false,
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
    }
  });
  
  const [currentLanguage, setCurrentLanguage] = useState(
    LANGUAGES.find(lang => lang.code === userPrefs.language) || LANGUAGES[0]
  );
  
  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setUserPrefs({...userPrefs, theme: value});
    setTheme(value);
  };
  
  const handleLanguageChange = (code: string) => {
    const selected = LANGUAGES.find(lang => lang.code === code) || LANGUAGES[0];
    setCurrentLanguage(selected);
    setUserPrefs({...userPrefs, language: code});
  };
  
  const handleNotificationChange = (key: keyof typeof userPrefs.notifications, value: boolean) => {
    setUserPrefs({
      ...userPrefs, 
      notifications: { 
        ...userPrefs.notifications, 
        [key]: value 
      } 
    });
  };
  
  const handleAccessibilityChange = (key: keyof typeof userPrefs.accessibility, value: boolean) => {
    setUserPrefs({
      ...userPrefs, 
      accessibility: { 
        ...userPrefs.accessibility, 
        [key]: value 
      } 
    });
  };
  
  const savePreferences = () => {
    // Dans une implémentation réelle, on sauvegarderait ces préférences dans une base de données
    // comme Supabase
    console.log("Saving preferences for user", userId, userPrefs);
    
    toast({
      title: "Préférences enregistrées",
      description: "Vos préférences ont été mises à jour avec succès."
    });
    
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="bg-slate-800/50 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/50 rounded-xl"
        onClick={() => setOpen(true)}
      >
        <User className="h-5 w-5" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Préférences personnelles</DialogTitle>
            <DialogDescription className="text-slate-400">
              Personnalisez votre expérience LuvviX selon vos besoins et vos préférences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-200">Apparence</h3>
              <RadioGroup 
                value={userPrefs.theme} 
                onValueChange={(v) => handleThemeChange(v as 'light' | 'dark' | 'system')}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem 
                    value="light" 
                    id="theme-light" 
                    className="sr-only" 
                  />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-900/50 p-4 hover:bg-slate-700/50 hover:border-slate-600 cursor-pointer [&:has([data-state=checked])]:border-violet-500"
                  >
                    <Sun className="mb-3 h-6 w-6 text-slate-400" />
                    <span className="text-xs">Clair</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="dark" 
                    id="theme-dark" 
                    className="sr-only" 
                  />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-900/50 p-4 hover:bg-slate-700/50 hover:border-slate-600 cursor-pointer [&:has([data-state=checked])]:border-violet-500"
                  >
                    <Moon className="mb-3 h-6 w-6 text-slate-400" />
                    <span className="text-xs">Sombre</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="system" 
                    id="theme-system" 
                    className="sr-only" 
                  />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-900/50 p-4 hover:bg-slate-700/50 hover:border-slate-600 cursor-pointer [&:has([data-state=checked])]:border-violet-500"
                  >
                    <Monitor className="mb-3 h-6 w-6 text-slate-400" />
                    <span className="text-xs">Système</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-200">Langue</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-700 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span>{currentLanguage.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[200px] bg-slate-800 border-slate-700">
                  {LANGUAGES.map((language) => (
                    <DropdownMenuItem 
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className="flex items-center justify-between cursor-pointer text-slate-200 focus:bg-slate-700 focus:text-white"
                    >
                      {language.name}
                      {language.code === currentLanguage.code && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-email" className="text-slate-300">Alertes par email</Label>
                  <Switch 
                    id="notify-email" 
                    checked={userPrefs.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-app" className="text-slate-300">Notifications dans l'application</Label>
                  <Switch 
                    id="notify-app" 
                    checked={userPrefs.notifications.app}
                    onCheckedChange={(checked) => handleNotificationChange('app', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-browser" className="text-slate-300">Notifications du navigateur</Label>
                  <Switch 
                    id="notify-browser" 
                    checked={userPrefs.notifications.browser}
                    onCheckedChange={(checked) => handleNotificationChange('browser', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-marketing" className="text-slate-300">Newsletters & mises à jour</Label>
                  <Switch 
                    id="notify-marketing" 
                    checked={userPrefs.notifications.marketing}
                    onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-200">Accessibilité</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion" className="text-slate-300">Réduire les animations</Label>
                  <Switch 
                    id="reduced-motion" 
                    checked={userPrefs.accessibility.reducedMotion}
                    onCheckedChange={(checked) => handleAccessibilityChange('reducedMotion', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast" className="text-slate-300">Mode contraste élevé</Label>
                  <Switch 
                    id="high-contrast" 
                    checked={userPrefs.accessibility.highContrast}
                    onCheckedChange={(checked) => handleAccessibilityChange('highContrast', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="large-text" className="text-slate-300">Texte plus grand</Label>
                  <Switch 
                    id="large-text" 
                    checked={userPrefs.accessibility.largeText}
                    onCheckedChange={(checked) => handleAccessibilityChange('largeText', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-700">
              Annuler
            </Button>
            <Button onClick={savePreferences} className="bg-violet-600 hover:bg-violet-700">
              Enregistrer les préférences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserPreferences;
