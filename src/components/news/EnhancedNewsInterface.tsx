
import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, Bookmark, BookmarkCheck, Sparkles, RefreshCw } from 'lucide-react';
import { enhancedNewsService } from '@/services/enhanced-news-service';
import { NewsItem } from '@/types/news';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EnhancedNewsInterface = () => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { savedArticles, saveArticle, removeArticle, isArticleSaved } = useSavedArticles();

  const categories = [
    { id: 'all', label: 'Toutes', emoji: '📰' },
    { id: 'france', label: 'France', emoji: '🇫🇷' },
    { id: 'international', label: 'Monde', emoji: '🌍' },
    { id: 'technology', label: 'Tech', emoji: '💻' },
    { id: 'business', label: 'Business', emoji: '💼' },
    { id: 'sports', label: 'Sport', emoji: '⚽' },
    { id: 'science', label: 'Science', emoji: '🔬' }
  ];

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsItems = await enhancedNewsService.fetchFromMultipleSources(selectedCategory, 20);
      setArticles(newsItems);
    } catch (error) {
      console.error('Erreur chargement actualités:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleSaveToggle = (article: NewsItem) => {
    if (isArticleSaved(article.id)) {
      removeArticle(article.id);
    } else {
      saveArticle(article);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return format(date, 'd MMM', { locale: fr });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header avec refresh */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            <Sparkles className="inline-block w-6 h-6 mr-2 text-blue-500" />
            Actualités IA
          </h1>
          <p className="text-gray-600">Résumés intelligents et sources multiples</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex space-x-2 overflow-x-auto pb-4 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{category.emoji}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {article.imageUrl && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {article.source}
                    </span>
                    {(article as any).aiEnhanced && (
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {getTimeAgo(article.publishedAt)}
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                  {article.title}
                </h2>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
                  >
                    <span>Lire l'article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  
                  <button
                    onClick={() => handleSaveToggle(article)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {isArticleSaved(article.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {articles.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📰</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune actualité</h3>
          <p className="text-gray-600">Essayez de changer de catégorie ou d'actualiser</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedNewsInterface;
