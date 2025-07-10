
import { useState, useEffect } from 'react';

export interface NewsPreferences {
  language: string;
  categories: string[];
}

const DEFAULT_PREFERENCES: NewsPreferences = {
  language: 'fr',
  categories: ['general', 'technology', 'business']
};

export const useNewsPreferences = () => {
  const [preferences, setPreferences] = useState<NewsPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Charger les préférences depuis les cookies
    const savedPrefs = document.cookie
      .split('; ')
      .find(row => row.startsWith('news_preferences='));
    
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(decodeURIComponent(savedPrefs.split('=')[1]));
        setPreferences(parsed);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      }
    }
  }, []);

  const updatePreferences = (newPreferences: Partial<NewsPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    // Sauvegarder en cookies (expire dans 365 jours)
    const expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `news_preferences=${encodeURIComponent(JSON.stringify(updated))}; expires=${expires.toUTCString()}; path=/`;
  };

  return {
    preferences,
    updatePreferences
  };
};
