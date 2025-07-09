
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export interface NewsPreferences {
  categories: string[];
  language: string;
  location: boolean;
}

const PREFERENCES_KEY = 'luvvix_news_preferences';

export const useNewsPreferences = () => {
  const { language } = useLanguage();
  const [preferences, setPreferences] = useState<NewsPreferences>({
    categories: [],
    language: language,
    location: true
  });

  useEffect(() => {
    // Charger les préférences depuis les cookies
    const saved = document.cookie
      .split('; ')
      .find(row => row.startsWith(PREFERENCES_KEY + '='));
    
    if (saved) {
      try {
        const parsed = JSON.parse(decodeURIComponent(saved.split('=')[1]));
        setPreferences(prev => ({
          ...parsed,
          language: language // Toujours utiliser la langue actuelle
        }));
      } catch (error) {
        console.error('Error parsing preferences from cookies:', error);
      }
    } else {
      // Préférences par défaut basées sur la langue
      setPreferences(prev => ({
        ...prev,
        language: language
      }));
    }
  }, [language]);

  const savePreferences = (newPreferences: Partial<NewsPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    // Sauvegarder dans les cookies (30 jours d'expiration)
    const expires = new Date();
    expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = `${PREFERENCES_KEY}=${encodeURIComponent(JSON.stringify(updated))}; expires=${expires.toUTCString()}; path=/`;
  };

  const hasConfiguredCategories = preferences.categories.length > 0;

  return {
    preferences,
    savePreferences,
    hasConfiguredCategories
  };
};
