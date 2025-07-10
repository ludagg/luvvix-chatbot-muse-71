
import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useNewsPreferences } from '@/hooks/use-news-preferences';

const NewsLanguageSettings = () => {
  const { preferences, updatePreferences } = useNewsPreferences();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Globe className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900">Langue des actualités</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => updatePreferences({ language: lang.code })}
            className={`p-3 rounded-lg border transition-colors ${
              preferences.language === lang.code
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium text-gray-900">{lang.name}</span>
              {preferences.language === lang.code && (
                <Check className="w-4 h-4 text-blue-500 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewsLanguageSettings;
