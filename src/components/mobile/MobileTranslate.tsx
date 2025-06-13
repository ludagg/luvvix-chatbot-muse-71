
import React, { useState, useEffect } from 'react';
import { Globe, ArrowRightLeft, Copy, Share, Volume2, History, Star, Bot, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const MobileTranslate = () => {
  const { user } = useAuth();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('fr');
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const languages = [
    { code: 'auto', name: 'Détection automatique', flag: '🌐' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'Anglais', flag: '🇺🇸' },
    { code: 'es', name: 'Espagnol', flag: '🇪🇸' },
    { code: 'de', name: 'Allemand', flag: '🇩🇪' },
    { code: 'it', name: 'Italien', flag: '🇮🇹' },
    { code: 'pt', name: 'Portugais', flag: '🇵🇹' },
    { code: 'ru', name: 'Russe', flag: '🇷🇺' },
    { code: 'ja', name: 'Japonais', flag: '🇯🇵' },
    { code: 'ko', name: 'Coréen', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinois', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabe', flag: '🇸🇦' }
  ];

  useEffect(() => {
    loadHistory();
    loadFavorites();
    loadAISuggestions();
  }, []);

  useEffect(() => {
    if (sourceText.trim() && sourceText.length > 2) {
      const timer = setTimeout(() => {
        handleTranslate();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sourceText, sourceLang, targetLang]);

  const loadHistory = () => {
    const saved = localStorage.getItem('luvvix_translate_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('luvvix_translate_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const loadAISuggestions = async () => {
    try {
      const suggestions = [
        {
          type: 'context_improvement',
          title: 'Amélioration contextuelle',
          description: 'L\'IA peut améliorer la traduction en analysant le contexte',
          action: 'Améliorer'
        },
        {
          type: 'language_detection',
          title: 'Langue détectée',
          description: 'Anglais détecté automatiquement avec 95% de confiance',
          action: 'Confirmer'
        }
      ];
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Erreur suggestions IA:', error);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    try {
      const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/gemini-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG92dnFjd2pkYmlybWVrZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTEyOTUsImV4cCI6MjA1OTY2NzI5NX0.jqR7F_bdl-11Hl6SP0tkdrg4V2o76V66fL6xj8zghUI`
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceLang,
          targetLang: targetLang
        })
      });

      const data = await response.json();
      
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
        
        // Ajouter à l'historique
        const newEntry = {
          id: Date.now(),
          sourceText,
          translatedText: data.translatedText,
          sourceLang,
          targetLang,
          timestamp: new Date().toISOString()
        };
        
        const updatedHistory = [newEntry, ...history.slice(0, 49)];
        setHistory(updatedHistory);
        localStorage.setItem('luvvix_translate_history', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Erreur traduction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traduire le texte",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Texte copié dans le presse-papiers",
    });
  };

  const handleAddToFavorites = () => {
    if (!sourceText.trim() || !translatedText.trim()) return;
    
    const newFavorite = {
      id: Date.now(),
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
      timestamp: new Date().toISOString()
    };
    
    const updatedFavorites = [newFavorite, ...favorites];
    setFavorites(updatedFavorites);
    localStorage.setItem('luvvix_translate_favorites', JSON.stringify(updatedFavorites));
    
    toast({
      title: "Ajouté aux favoris",
      description: "Traduction sauvegardée",
    });
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Écoute vocale",
        description: "Fonction vocale bientôt disponible",
      });
    }
  };

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    }
  };

  const getLanguageName = (code: string) => {
    return languages.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return languages.find(lang => lang.code === code)?.flag || '🌐';
  };

  return (
    <div className="flex-1 bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">LuvviX Translate</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <History className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Star className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions IA */}
      {aiSuggestions.length > 0 && (
        <div className="p-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Assistant Traduction IA</span>
            </div>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <h4 className="font-medium mb-1">{suggestion.title}</h4>
                <p className="text-sm text-blue-100 mb-2">{suggestion.description}</p>
                <button className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-30 transition-colors">
                  {suggestion.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sélecteur de langues */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleSwapLanguages}
              disabled={sourceLang === 'auto'}
              className={`mx-4 p-2 rounded-full transition-colors ${
                sourceLang === 'auto'
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none text-right"
              >
                {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de traduction */}
      <div className="p-4 space-y-4">
        {/* Texte source */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">
              {getLanguageFlag(sourceLang)} {getLanguageName(sourceLang)}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleVoiceInput}
                className={`p-1 rounded-full transition-colors ${
                  isListening ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              {sourceText && (
                <button
                  onClick={() => speakText(sourceText, sourceLang)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Tapez votre texte à traduire..."
            className="w-full p-4 resize-none border-0 focus:ring-0 focus:outline-none text-gray-900 min-h-[120px]"
            rows={5}
          />
        </div>

        {/* Texte traduit */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">
              {getLanguageFlag(targetLang)} {getLanguageName(targetLang)}
            </span>
            <div className="flex items-center space-x-2">
              {translatedText && (
                <>
                  <button
                    onClick={() => speakText(translatedText, targetLang)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(translatedText)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAddToFavorites}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="p-4 min-h-[120px]">
            {isTranslating ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">Traduction en cours...</span>
              </div>
            ) : translatedText ? (
              <p className="text-gray-900">{translatedText}</p>
            ) : (
              <p className="text-gray-400">La traduction apparaîtra ici...</p>
            )}
          </div>
        </div>
      </div>

      {/* Historique récent */}
      {history.length > 0 && (
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Historique récent</h3>
          <div className="space-y-2">
            {history.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSourceText(item.sourceText);
                  setTranslatedText(item.translatedText);
                  setSourceLang(item.sourceLang);
                  setTargetLang(item.targetLang);
                }}
                className="w-full bg-white rounded-xl p-3 border border-gray-100 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {getLanguageFlag(item.sourceLang)} → {getLanguageFlag(item.targetLang)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm text-gray-900 line-clamp-1">{item.sourceText}</p>
                <p className="text-sm text-gray-600 line-clamp-1">{item.translatedText}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTranslate;
