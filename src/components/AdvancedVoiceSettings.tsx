
import { useState } from 'react';
import { Volume2, VolumeX, Settings, ChevronDown, ChevronUp, Mic, AudioWaveform } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from '@/hooks/use-toast';

interface AdvancedVoiceSettingsProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AdvancedVoiceSettings = ({ isMuted, onToggleMute }: AdvancedVoiceSettingsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [volume, setVolume] = useState(80);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voice, setVoice] = useState<string>("default");
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [language, setLanguage] = useState("fr-FR");
  const [continuousSpeaking, setContinuousSpeaking] = useState(false);
  const [voiceActivation, setVoiceActivation] = useState(true);
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Liste des voix disponibles (serait normalement chargée dynamiquement)
  const availableVoices = [
    { id: "default", name: "Voix par défaut", language: "fr-FR" },
    { id: "voice1", name: "Sophie (Français)", language: "fr-FR" },
    { id: "voice2", name: "Jean (Français)", language: "fr-FR" },
    { id: "voice3", name: "Thomas (Français)", language: "fr-FR" },
    { id: "voice4", name: "Emma (Anglais)", language: "en-US" },
    { id: "voice5", name: "John (Anglais)", language: "en-US" },
  ];
  
  const saveSettings = () => {
    // Simulation de sauvegarde des paramètres
    toast({
      title: "Paramètres vocaux sauvegardés",
      description: "Les paramètres vocaux ont été mis à jour"
    });
    
    // Simuler un test de voix
    const utterance = new SpeechSynthesisUtterance("Les paramètres vocaux ont été mis à jour");
    utterance.volume = volume / 100;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = language;
    
    window.speechSynthesis.speak(utterance);
    
    setIsDialogOpen(false);
  };
  
  return (
    <>
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span className="sr-only">Paramètres vocaux</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Paramètres vocaux</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Options vocales</DropdownMenuLabel>
          <DropdownMenuItem onClick={onToggleMute} className="cursor-pointer">
            {isMuted ? "Activer le son" : "Désactiver le son"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres avancés</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Paramètres vocaux avancés</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-volume">Volume</Label>
                <span className="text-xs text-muted-foreground">{volume}%</span>
              </div>
              <Slider
                id="voice-volume"
                min={0}
                max={100}
                step={1}
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="voice-select">Voix</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger id="voice-select">
                  <SelectValue placeholder="Sélectionnez une voix" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto-detect-language">Détection automatique de langue</Label>
              <Switch
                id="auto-detect-language"
                checked={autoDetectLanguage}
                onCheckedChange={setAutoDetectLanguage}
              />
            </div>
            
            {!autoDetectLanguage && (
              <div className="space-y-2">
                <Label htmlFor="language-select">Langue</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Sélectionnez une langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr-FR">Français (France)</SelectItem>
                    <SelectItem value="en-US">Anglais (États-Unis)</SelectItem>
                    <SelectItem value="es-ES">Espagnol (Espagne)</SelectItem>
                    <SelectItem value="de-DE">Allemand (Allemagne)</SelectItem>
                    <SelectItem value="it-IT">Italien (Italie)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full"
            >
              <span>Options avancées</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showAdvanced && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-rate">Vitesse</Label>
                    <span className="text-xs text-muted-foreground">{rate.toFixed(1)}x</span>
                  </div>
                  <Slider
                    id="voice-rate"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={[rate]}
                    onValueChange={(value) => setRate(value[0])}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-pitch">Hauteur</Label>
                    <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}</span>
                  </div>
                  <Slider
                    id="voice-pitch"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={[pitch]}
                    onValueChange={(value) => setPitch(value[0])}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="continuous-speaking">Lecture continue</Label>
                  <Switch
                    id="continuous-speaking"
                    checked={continuousSpeaking}
                    onCheckedChange={setContinuousSpeaking}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="voice-activation">Activation vocale</Label>
                  <Switch
                    id="voice-activation"
                    checked={voiceActivation}
                    onCheckedChange={setVoiceActivation}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="auto-transcribe">Transcription automatique</Label>
                  <Switch
                    id="auto-transcribe"
                    checked={autoTranscribe}
                    onCheckedChange={setAutoTranscribe}
                  />
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10">
                  <AudioWaveform className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Les voix haute qualité sont disponibles avec l'abonnement Pro
                  </p>
                </div>
                
                <Button
                  variant="secondary"
                  onClick={() => {
                    // Simuler un test de voix
                    const utterance = new SpeechSynthesisUtterance("Ceci est un test de la voix sélectionnée");
                    utterance.volume = volume / 100;
                    utterance.rate = rate;
                    utterance.pitch = pitch;
                    utterance.lang = language;
                    
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Tester la voix</span>
                </Button>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveSettings}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
