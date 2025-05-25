import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  Download, 
  Share2, 
  Camera,
  FileText,
  Globe,
  Zap,
  Brain,
  MessageCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  timestamp: Date;
  confidence: number;
}

const LuvvixTranslate = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('auto');
  const [toLanguage, setToLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState<Translation[]>([]);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const languages = [
    { code: 'auto', name: 'Détection automatique' },
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'Anglais' },
    { code: 'es', name: 'Espagnol' },
    { code: 'de', name: 'Allemand' },
    { code: 'it', name: 'Italien' },
    { code: 'pt', name: 'Portugais' },
    { code: 'ru', name: 'Russe' },
    { code: 'ja', name: 'Japonais' },
    { code: 'ko', name: 'Coréen' },
    { code: 'zh', name: 'Chinois' },
    { code: 'ar', name: 'Arabe' },
    { code: 'hi', name: 'Hindi' },
    { code: 'tr', name: 'Turc' },
    { code: 'nl', name: 'Néerlandais' },
    { code: 'sv', name: 'Suédois' },
    { code: 'no', name: 'Norvégien' },
    { code: 'da', name: 'Danois' },
    { code: 'fi', name: 'Finnois' },
    { code: 'pl', name: 'Polonais' }
  ];

  useEffect(() => {
    // Initialiser la reconnaissance vocale
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        setInputText(text);
        
        if (isRealTimeMode && text.length > 10) {
          handleTranslate(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setIsListening(false);
      };
    }
  }, [isRealTimeMode]);

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate || inputText;
    if (!text.trim()) return;

    setIsTranslating(true);
    
    try {
      console.log('Translating with Gemini AI:', text);
      
      const { data, error } = await supabase.functions.invoke('gemini-translate', {
        body: {
          text,
          fromLanguage,
          toLanguage,
          context: 'General conversation'
        }
      });

      if (error) {
        console.error('Translation error:', error);
        throw new Error(error.message || 'Erreur de traduction');
      }

      if (!data || !data.translatedText) {
        throw new Error('Aucune traduction reçue');
      }

      setTranslatedText(data.translatedText);
      
      const newTranslation: Translation = {
        id: Date.now().toString(),
        originalText: text,
        translatedText: data.translatedText,
        fromLanguage: data.detectedLanguage || data.fromLanguage,
        toLanguage: data.toLanguage,
        timestamp: new Date(),
        confidence: data.confidence || 0.95
      };
      
      setRecentTranslations(prev => [newTranslation, ...prev.slice(0, 4)]);
      
      toast({
        title: "Traduction terminée",
        description: `Traduit avec ${Math.round(newTranslation.confidence * 100)}% de confiance par LuvviX AI`
      });
      
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        variant: "destructive",
        title: "Erreur de traduction",
        description: error.message || "Impossible de traduire le texte. Veuillez réessayer."
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = toLanguage === 'en' ? 'en-US' : 
                     toLanguage === 'fr' ? 'fr-FR' :
                     toLanguage === 'es' ? 'es-ES' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Texte copié dans le presse-papiers"
    });
  };

  const swapLanguages = () => {
    if (fromLanguage !== 'auto') {
      setFromLanguage(toLanguage);
      setToLanguage(fromLanguage);
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4">
              <Languages className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LuvviX Translate
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Traduction instantanée alimentée par LuvviX AI avec reconnaissance vocale, 
            traduction en temps réel et intelligence contextuelle
          </p>
          
          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Brain className="w-4 h-4 mr-1" />
              LuvviX AI
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Mic className="w-4 h-4 mr-1" />
              Reconnaissance Vocale
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Zap className="w-4 h-4 mr-1" />
              Temps Réel
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Globe className="w-4 h-4 mr-1" />
              50+ Langues
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Translation Panel */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800">Traduction IA Avancée</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isRealTimeMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsRealTimeMode(!isRealTimeMode)}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Temps réel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Selection */}
                <div className="flex items-center gap-4">
                  <Select value={fromLanguage} onValueChange={setFromLanguage}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="ghost" size="sm" onClick={swapLanguages}>
                    <Languages className="w-4 h-4" />
                  </Button>
                  
                  <Select value={toLanguage} onValueChange={setToLanguage}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.filter(lang => lang.code !== 'auto').map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Input Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Texte à traduire</label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isListening ? stopListening : startListening}
                        className={isListening ? "bg-red-50 border-red-200" : ""}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (isRealTimeMode) {
                        clearTimeout(debounceRef.current);
                        debounceRef.current = setTimeout(() => {
                          handleTranslate(e.target.value);
                        }, 1000);
                      }
                    }}
                    placeholder="Tapez ou parlez votre texte ici..."
                    className="min-h-[120px] resize-none"
                  />
                  
                  {isListening && (
                    <div className="flex items-center text-red-600 text-sm">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
                      Écoute en cours...
                    </div>
                  )}
                </div>

                {/* Translate Button */}
                <Button
                  onClick={() => handleTranslate()}
                  disabled={!inputText.trim() || isTranslating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isTranslating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Traduction par LuvviX AI...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Traduire avec LuvviX AI
                    </>
                  )}
                </Button>

                {/* Output Section */}
                {translatedText && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Traduction par LuvviX AI</label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => speakText(translatedText)}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(translatedText)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <p className="text-gray-800 whitespace-pre-wrap">{translatedText}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Translations */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Traductions récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTranslations.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucune traduction récente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentTranslations.map((translation) => (
                      <div key={translation.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {languages.find(l => l.code === translation.fromLanguage)?.name} → {languages.find(l => l.code === translation.toLanguage)?.name}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {Math.round(translation.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1 line-clamp-2">{translation.originalText}</p>
                        <p className="text-gray-800 font-medium line-clamp-2">{translation.translatedText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Powered by LuvviX AI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Brain className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Intelligence contextuelle avancée</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mic className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Reconnaissance vocale</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Camera className="w-4 h-4 mr-2 text-green-600" />
                    <span>Traduction d'images (bientôt)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                    <span>Mode temps réel</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="w-4 h-4 mr-2 text-indigo-600" />
                    <span>Plus de 50 langues</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuvvixTranslate;
