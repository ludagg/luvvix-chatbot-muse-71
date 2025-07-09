
import { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';

export const useSavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState<NewsItem[]>([]);

  // Load saved articles from localStorage on mount
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

  // Save articles to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('luvvix_saved_articles', JSON.stringify(savedArticles));
  }, [savedArticles]);

  const saveArticle = (article: NewsItem) => {
    setSavedArticles(prev => {
      const exists = prev.find(a => a.id === article.id);
      if (exists) return prev;
      return [...prev, article];
    });
  };

  const removeArticle = (articleId: string) => {
    setSavedArticles(prev => prev.filter(a => a.id !== articleId));
  };

  const isArticleSaved = (articleId: string): boolean => {
    return savedArticles.some(a => a.id === articleId);
  };

  return {
    savedArticles,
    saveArticle,
    removeArticle,
    isArticleSaved
  };
};
