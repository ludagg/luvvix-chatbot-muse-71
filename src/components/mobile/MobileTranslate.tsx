
import React, { useState } from 'react';
import { ArrowLeft, ArrowUpDown, Copy, Volume2, Star, History, Languages } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { toast } from '@/hooks/use-toast';

interface MobileTranslateProps {
  onBack: () => void;
}

const MobileTranslate = ({ onBack }: MobileTranslateProps) => {
  const { translations, loading, translateText } = useTranslations();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('fr');
  const [showHistory, setShowHistory] = useState(false);

  const languages = [
    { code: 'auto', name: 'Détecter automatiquement' },
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
    { code: 'nl', name: 'Néerlandais' },
    { code: 'sv', name: 'Suédois' },
    { code: 'da', name: 'Danois' },
    { code: 'no', name: 'Norvégien' },
    { code: 'fi', name: 'Finnois' },
    { code: 'pl', name: 'Polonais' },
    { code: 'tr', name: 'Turc' }
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir du texte à traduire",
        variant: "destructive"
      });
      return;
    }

    const result = await translateText(sourceText, sourceLang, targetLang);
    if (result) {
      setTranslatedText(result);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: "Texte copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive"
      });
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Non supporté",
        description: "La synthèse vocale n'est pas supportée sur ce navigateur",
        variant: "destructive"
      });
    }
  };

  const loadFromHistory = (translation: any) => {
    setSourceText(translation.source_text);
    setTranslatedText(translation.translated_text);
    setSourceLang(translation.source_language);
    setTargetLang(translation.target_language);
    setShowHistory(false);
  };

  if (showHistory) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Historique</h1>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {translations.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune traduction dans l'historique</p>
            </div>
          ) : (
            <div className="space-y-4">
              {translations.map((translation) => (
                <div
                  key={translation.id}
                  onClick={() => loadFromHistory(translation)}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {translation.source_language.toUpperCase()} → {translation.target_language.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(translation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-2">{translation.source_text}</p>
                  <p className="text-blue-600 font-medium">{translation.translated_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">LuvviX Translate</h1>
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <History className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Language Selector */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSwapLanguages}
            disabled={sourceLang === 'auto'}
            className="mx-4 p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpDown className="w-6 h-6 text-gray-600" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.filter(lang => lang.code !== 'auto').map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Translation Area */}
      <div className="flex-1 p-4 space-y-4">
        {/* Source Text */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                {languages.find(l => l.code === sourceLang)?.name}
              </span>
              <div className="flex space-x-2">
                {sourceText && (
                  <>
                    <button
                      onClick={() => handleSpeak(sourceText, sourceLang)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleCopy(sourceText)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Saisissez le texte à traduire..."
            className="w-full p-4 border-0 resize-none focus:outline-none min-h-[120px]"
            rows={5}
          />
        </div>

        {/* Translate Button */}
        <div className="text-center">
          <button
            onClick={handleTranslate}
            disabled={loading || !sourceText.trim()}
            className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Traduction...</span>
              </div>
            ) : (
              'Traduire'
            )}
          </button>
        </div>

        {/* Translated Text */}
        {translatedText && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {languages.find(l => l.code === targetLang)?.name}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSpeak(translatedText, targetLang)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Volume2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleCopy(translatedText)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-900 leading-relaxed">{translatedText}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => {
              setSourceText('');
              setTranslatedText('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Effacer
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
          >
            <History className="w-4 h-4" />
            <span>Historique</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileTranslate;
