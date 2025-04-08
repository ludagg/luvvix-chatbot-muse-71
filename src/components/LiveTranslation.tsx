
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

interface LiveTranslationProps {
  sourceText?: string;
  onTranslated?: (text: string, language: string) => void;
}

export const LiveTranslation = ({ 
  sourceText = '', 
  onTranslated 
}: LiveTranslationProps) => {
  const [isActive, setIsActive] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[1]); // English by default
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Mock function for language detection - in a real app, you'd use a language detection API
  const detectLanguage = (text: string) => {
    if (!text) return null;
    
    // Simple detection based on first character unicode range - very simplified!
    const firstChar = text.charAt(0).toLowerCase();
    
    if (/[а-я]/.test(firstChar)) return 'ru';
    if (/[а-я]/.test(firstChar)) return 'ru';
    if (/[\u0600-\u06FF]/.test(firstChar)) return 'ar';
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(firstChar)) return 'ja';
    if (/[\u4e00-\u9fff]/.test(firstChar)) return 'zh';
    
    // For Latin-based languages, check common words
    if (text.includes('the') || text.includes('is') || text.includes('and')) return 'en';
    if (text.includes('le') || text.includes('la') || text.includes('les')) return 'fr';
    if (text.includes('el') || text.includes('la') || text.includes('los')) return 'es';
    if (text.includes('der') || text.includes('die') || text.includes('das')) return 'de';
    if (text.includes('il') || text.includes('la') || text.includes('che')) return 'it';
    if (text.includes('o') || text.includes('a') || text.includes('para')) return 'pt';
    
    // Default to English if we can't detect
    return 'en';
  };

  // Mock translation function - in a real app, you'd use a translation API
  const translateText = async (text: string, targetLang: string) => {
    setIsTranslating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Very simplified mock translation
      let result = text;
      
      // Some simple word replacements as an example
      if (targetLang === 'en' && detectedLanguage === 'fr') {
        result = text
          .replace(/bonjour/gi, 'hello')
          .replace(/merci/gi, 'thank you')
          .replace(/s'il vous plaît/gi, 'please');
      } else if (targetLang === 'fr' && detectedLanguage === 'en') {
        result = text
          .replace(/hello/gi, 'bonjour')
          .replace(/thank you/gi, 'merci')
          .replace(/please/gi, "s'il vous plaît");
      }
      
      // In a real app, you would call a translation API here
      setTranslatedText(result);
      
      if (onTranslated) {
        onTranslated(result, targetLang);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Erreur de traduction. Veuillez réessayer.');
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (!isActive || !sourceText) {
      setTranslatedText('');
      setDetectedLanguage(null);
      return;
    }
    
    // Detect language when source text changes
    const detected = detectLanguage(sourceText);
    setDetectedLanguage(detected);
    
    // Only translate if detected language is different from target
    if (detected && detected !== targetLanguage.code) {
      translateText(sourceText, targetLanguage.code);
    } else {
      setTranslatedText(''); // No translation needed
    }
  }, [sourceText, isActive, targetLanguage.code]);

  const toggleTranslation = () => {
    setIsActive(!isActive);
    if (!isActive) {
      toast.success(`Traduction automatique activée vers ${targetLanguage.name}`);
    } else {
      toast.info('Traduction automatique désactivée');
    }
  };

  const handleLanguageChange = (language: typeof LANGUAGES[0]) => {
    setTargetLanguage(language);
    if (isActive) {
      toast.success(`Langue cible changée pour ${language.name}`);
      if (sourceText && detectedLanguage && detectedLanguage !== language.code) {
        translateText(sourceText, language.code);
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1 ${isActive ? 'border-primary' : ''}`}
            >
              <Globe size={14} />
              <span className="hidden sm:inline">{targetLanguage.flag} {targetLanguage.name}</span>
              <span className="sm:hidden">{targetLanguage.flag}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LANGUAGES.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className="flex items-center justify-between gap-2"
              >
                <span>{language.flag} {language.name}</span>
                {language.code === targetLanguage.code && (
                  <Check size={14} className="text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          size="sm"
          variant={isActive ? "default" : "outline"}
          className="h-8"
          onClick={toggleTranslation}
        >
          {isActive ? "Désactiver" : "Activer"}
        </Button>
      </div>
      
      <AnimatePresence>
        {isActive && detectedLanguage && detectedLanguage !== targetLanguage.code && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-md shadow-md w-[250px] z-10"
          >
            {detectedLanguage && (
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {LANGUAGES.find(l => l.code === detectedLanguage)?.flag || ''} Détecté: {
                    LANGUAGES.find(l => l.code === detectedLanguage)?.name || 'Inconnu'
                  }
                </Badge>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsActive(false)}>
                  <X size={12} />
                </Button>
              </div>
            )}
            
            {isTranslating ? (
              <div className="flex items-center justify-center py-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                <span className="text-xs">Traduction...</span>
              </div>
            ) : (
              translatedText && (
                <p className="text-sm italic">{translatedText}</p>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
