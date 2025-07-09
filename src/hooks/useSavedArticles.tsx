
import { useState, useEffect } from 'react';

export interface SavedArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  savedAt: string;
  source: string;
}

export const useSavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('luvvix_saved_articles');
    if (saved) {
      try {
        setSavedArticles(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved articles:', error);
      }
    }
  }, []);

  const saveArticle = (article: Omit<SavedArticle, 'savedAt'>) => {
    const newArticle: SavedArticle = {
      ...article,
      savedAt: new Date().toISOString()
    };
    
    const updated = [newArticle, ...savedArticles.filter(a => a.id !== article.id)];
    setSavedArticles(updated);
    localStorage.setItem('luvvix_saved_articles', JSON.stringify(updated));
  };

  const removeArticle = (articleId: string) => {
    const updated = savedArticles.filter(a => a.id !== articleId);
    setSavedArticles(updated);
    localStorage.setItem('luvvix_saved_articles', JSON.stringify(updated));
  };

  const isArticleSaved = (articleId: string) => {
    return savedArticles.some(a => a.id === articleId);
  };

  return {
    savedArticles,
    saveArticle,
    removeArticle,
    isArticleSaved
  };
};
