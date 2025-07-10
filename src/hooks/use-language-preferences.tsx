
import { useState, useEffect } from 'react';

interface LanguagePreferences {
  language: string;
  setLanguage: (lang: string) => void;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const LANGUAGE_COOKIE_KEY = 'luvvix_preferred_language';

export const useLanguagePreferences = (): LanguagePreferences => {
  const [language, setLanguageState] = useState('fr');

  const availableLanguages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  // Charger la langue depuis les cookies au démarrage
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_COOKIE_KEY);
      if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.log('Error loading language preference:', error);
    }
  }, []);

  const setLanguage = (lang: string) => {
    try {
      localStorage.setItem(LANGUAGE_COOKIE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  return {
    language,
    setLanguage,
    availableLanguages
  };
};
