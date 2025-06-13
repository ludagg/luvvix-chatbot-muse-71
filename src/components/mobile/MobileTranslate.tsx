
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, ArrowUpDown, Copy, Share2, Volume2, Bookmark, History, Sparkles, Languages, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
  isFavorite: boolean;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface MobileTranslateProps {
  onBack: () => void;
}

const MobileTranslate = ({ onBack }: MobileTranslateProps) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('fr');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Translation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [favorites, setFavorites] = useState<Translation[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');

  const languages: Language[] = [
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
    { code: 'ar', name: 'Arabe', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'tr', name: 'Turc', flag: '🇹🇷' },
    { code: 'nl', name: 'Néerlandais', flag: '🇳🇱' },
    { code: 'sv', name: 'Suédois', flag: '🇸🇪' },
    { code: 'no', name: 'Norvégien', flag: '🇳🇴' },
    { code: 'da', name: 'Danois', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnois', flag: '🇫🇮' },
    { code: 'pl', name: 'Polonais', flag: '🇵🇱' }
  ];

  // Charger l'historique et les favoris depuis le localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('luvvix_translation_history');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setTranslationHistory(parsed.map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })));
    }
    
    const savedFavorites = localStorage.getItem('luvvix_translation_favorites');
    if (savedFavorites) {
      const parsed = JSON.parse(savedFavorites);
      setFavorites(parsed.map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })));
    }
  }, []);

  // Sauvegarder l'historique et les favoris
  useEffect(() => {
    localStorage.setItem('luvvix_translation_history', JSON.stringify(translationHistory));
  }, [translationHistory]);

  useEffect(() => {
    localStorage.setItem('luvvix_translation_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const translateWithAI = async (text: string, fromLang: string, toLang: string) => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    try {
      // Simuler un appel à l'API Gemini pour la traduction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulations de traductions pour démonstration
      const translations: { [key: string]: string } = {
        'hello world': 'bonjour le monde',
        'how are you': 'comment allez-vous',
        'good morning': 'bonjour',
        'thank you': 'merci',
        'goodbye': 'au revoir',
        'yes': 'oui',
        'no': 'non',
        'please': 's\'il vous plaît',
        'excuse me': 'excusez-moi',
        'i love you': 'je t\'aime'
      };
      
      const lowerText = text.toLowerCase();
      const result = translations[lowerText] || `Traduction de: "${text}"`;
      
      setTranslatedText(result);
      
      // Détection de langue simulée
      if (fromLang === 'auto') {
        const detectedLang = ['en', 'es', 'de', 'it'][Math.floor(Math.random() * 4)];
        setDetectedLanguage(detectedLang);
      }
      
      // Ajouter à l'historique
      const newTranslation: Translation = {
        id: Date.now().toString(),
        sourceText: text,
        translatedText: result,
        sourceLang: fromLang === 'auto' ? (detectedLanguage || 'en') : fromLang,
        targetLang: toLang,
        timestamp: new Date(),
        isFavorite: false
      };
      
      setTranslationHistory(prev => [newTranslation, ...prev.slice(0, 49)]); // Garder 50 dernières traductions
      
      toast({
        title: "Traduction terminée",
        description: "Le texte a été traduit avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de traduction",
        description: "Impossible de traduire le texte",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Texte copié",
      description: "Le texte a été copié dans le presse-papiers",
    });
  };

  const shareTranslation = (translation: Translation) => {
    const text = `${translation.sourceText} → ${translation.translatedText}`;
    if (navigator.share) {
      navigator.share({
        title: 'Traduction LuvviX',
        text: text
      });
    } else {
      copyToClipboard(text);
    }
  };

  const toggleFavorite = (translationId: string) => {
    const translation = translationHistory.find(t => t.id === translationId);
    if (!translation) return;
    
    const updatedTranslation = { ...translation, isFavorite: !translation.isFavorite };
    
    if (updatedTranslation.isFavorite) {
      setFavorites(prev => [updatedTranslation, ...prev]);
    } else {
      setFavorites(prev => prev.filter(f => f.id !== translationId));
    }
    
    setTranslationHistory(prev => 
      prev.map(t => t.id === translationId ? updatedTranslation : t)
    );
  };

  const useTranslationFromHistory = (translation: Translation) => {
    setSourceText(translation.sourceText);
    setTranslatedText(translation.translatedText);
    setSourceLang(translation.sourceLang);
    setTargetLang(translation.targetLang);
    setShowHistory(false);
    setShowFavorites(false);
  };

  const clearHistory = () => {
    setTranslationHistory([]);
    toast({
      title: "Historique effacé",
      description: "L'historique des traductions a été supprimé",
    });
  };

  const getLanguageName = (code: string) => {
    return languages.find(l => l.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return languages.find(l => l.code === code)?.flag || '🌐';
  };

  const renderTranslationInterface = () => (
    <div className="space-y-4">
      {/* Sélecteurs de langue */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={swapLanguages}
          disabled={sourceLang === 'auto'}
          className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowUpDown className="w-5 h-5" />
        </button>
        
        <div className="flex-1">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.filter(l => l.code !== 'auto').map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone de texte source */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {getLanguageFlag(sourceLang)} {getLanguageName(sourceLang)}
          </span>
          {detectedLanguage && sourceLang === 'auto' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Détecté: {getLanguageName(detectedLanguage)}
            </span>
          )}
        </div>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Entrez votre texte à traduire..."
          className="w-full h-32 resize-none border-0 focus:ring-0 focus:outline-none text-gray-900"
          maxLength={5000}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{sourceText.length}/5000</span>
          <div className="flex items-center space-x-2">
            {sourceText && (
              <>
                <button
                  onClick={() => setSourceText('')}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Effacer
                </button>
                <button
                  onClick={() => copyToClipboard(sourceText)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de traduction */}
      <button
        onClick={() => translateWithAI(sourceText, sourceLang, targetLang)}
        disabled={!sourceText.trim() || isTranslating}
        className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isTranslating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Traduction en cours...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Traduire avec l'IA</span>
          </>
        )}
      </button>

      {/* Zone de texte traduit */}
      {translatedText && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">
              {getLanguageFlag(targetLang)} {getLanguageName(targetLang)}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(translatedText)}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => shareTranslation({
                  id: '',
                  sourceText,
                  translatedText,
                  sourceLang,
                  targetLang,
                  timestamp: new Date(),
                  isFavorite: false
                })}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toast({ title: "Audio", description: "Synthèse vocale bientôt disponible" })}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-gray-900 leading-relaxed">{translatedText}</div>
        </div>
      )}

      {/* Traductions rapides */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-3">Traductions rapides</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Bonjour',
            'Merci',
            'Au revoir',
            'Excusez-moi',
            'Pardon',
            'Oui',
            'Non',
            'Comment allez-vous ?'
          ].map(phrase => (
            <button
              key={phrase}
              onClick={() => {
                setSourceText(phrase);
                translateWithAI(phrase, sourceLang, targetLang);
              }}
              className="px-3 py-2 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors border border-gray-200"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHistoryList = (translations: Translation[], title: string, emptyMessage: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title} ({translations.length})</h3>
        {translations.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Tout effacer
          </button>
        )}
      </div>
      
      {translations.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {translations.map(translation => (
            <div
              key={translation.id}
              onClick={() => useTranslationFromHistory(translation)}
              className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {getLanguageFlag(translation.sourceLang)} → {getLanguageFlag(translation.targetLang)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {translation.timestamp.toLocaleDateString()} {translation.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium mb-1">{translation.sourceText}</p>
                  <p className="text-sm text-blue-700">{translation.translatedText}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(translation.id);
                    }}
                    className={`p-1 rounded-full transition-colors ${
                      translation.isFavorite
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(translation.translatedText);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">LuvviX Translate</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              setShowFavorites(false);
            }}
            className={`p-2 rounded-full transition-colors ${
              showHistory ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowFavorites(!showFavorites);
              setShowHistory(false);
            }}
            className={`p-2 rounded-full transition-colors ${
              showFavorites ? 'bg-yellow-100 text-yellow-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => {
            setShowHistory(false);
            setShowFavorites(false);
          }}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            !showHistory && !showFavorites
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Languages className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">Traduire</span>
        </button>
        <button
          onClick={() => {
            setShowHistory(true);
            setShowFavorites(false);
          }}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            showHistory
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">Historique</span>
        </button>
        <button
          onClick={() => {
            setShowFavorites(true);
            setShowHistory(false);
          }}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            showFavorites
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bookmark className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">Favoris</span>
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-4">
        {!showHistory && !showFavorites && renderTranslationInterface()}
        {showHistory && renderHistoryList(translationHistory, 'Historique des traductions', 'Aucune traduction dans l\'historique')}
        {showFavorites && renderHistoryList(favorites, 'Traductions favorites', 'Aucune traduction favorite')}
      </div>
    </div>
  );
};

export default MobileTranslate;
