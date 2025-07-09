
import { useState, useEffect } from 'react';

export interface NewsSettings {
  language: string;
  sources: string[];
  categories: string[];
  aiSummaryEnabled: boolean;
}

const DEFAULT_SETTINGS: NewsSettings = {
  language: 'fr',
  sources: ['google-news', 'lemonde', 'bbc', 'reuters'],
  categories: ['general', 'technology', 'business'],
  aiSummaryEnabled: true
};

export const useNewsSettings = () => {
  const [settings, setSettings] = useState<NewsSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedSettings = localStorage.getItem('luvvix_news_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading news settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<NewsSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('luvvix_news_settings', JSON.stringify(updatedSettings));
  };

  return {
    settings,
    updateSettings
  };
};
