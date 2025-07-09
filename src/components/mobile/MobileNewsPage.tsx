
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Share, Bookmark, ExternalLink, Filter, MessageCircle, BookmarkCheck } from 'lucide-react';
import { EnhancedNewsService } from '@/services/enhanced-news-service';
import { NewsItem } from '@/types/news';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface MobileNewsPageProps {
  onBack: () => void;
}

const MobileNewsPage = ({ onBack }: MobileNewsPageProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [aiExplaining, setAiExplaining] = useState<string>('');
  const [savedArticles, setSavedArticles] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'Toutes', icon: '📰' },
    { id: 'technology', label: 'Tech', icon: '💻' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'health', label: 'Santé', icon: '🏥' },
    { id: 'sports', label: 'Sport', icon: '⚽' },
    { id: 'entertainment', label: 'Culture', icon: '🎭' }
  ];

  useEffect(() => {
    loadNews();
    loadSavedArticles();
  }, [selectedCategory]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsItems = await EnhancedNewsService.fetchEnhancedNews(selectedCategory, 'fr');
      setNews(newsItems);
    } catch (error) {
      console.error('Erreur chargement actualités:', error);
      toast.error('Erreur lors du chargement des actualités');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedArticles = () => {
    const saved = EnhancedNewsService.getSavedArticles();
    setSavedArticles(saved.map(a => a.id));
  };

  const handleShare = async (article: NewsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        });
      } catch (error) {
        // Fallback si partage annulé
        handleCopyLink(article);
      }
    } else {
      handleCopyLink(article);
    }
  };

  const handleCopyLink = (article: NewsItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(article.url || '');
      toast.success('Lien copié !');
    }
  };

  const handleSaveArticle = (article: NewsItem) => {
    EnhancedNewsService.saveArticle(article);
    loadSavedArticles();
    toast.success('Article sauvegardé !');
  };

  const handleAIExplanation = async (article: NewsItem) => {
    if (aiExplaining === article.id) return;
    
    setAiExplaining(article.id);
    toast.loading('L\'IA analyse l\'article...');
    
    try {
      const explanation = await EnhancedNewsService.getAIExplanation(article);
      toast.dismiss();
      toast.success('Explication générée !', {
        description: explanation,
        duration: 10000,
        action: {
          label: 'Fermer',
          onClick: () => toast.dismiss()
        }
      });
    } catch (error) {
      toast.dismiss();
      toast.error('Erreur lors de l\'explication IA');
    } finally {
      setAiExplaining('');
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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">LuvviX News</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Filter className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowFilters(false);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des actualités...</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {news.map((article, index) => (
              <article key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex space-x-3">
                  {article.imageUrl && (
                    <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.source}
                      </span>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {getTimeAgo(article.publishedAt)}
                      </div>
                    </div>
                    
                    <h2 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                      {article.title}
                    </h2>
                    
                    {article.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {article.summary}
                      </p>
                    )}
                    
                    {/* Boutons d'action minimalistes */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => article.url && window.open(article.url, '_blank')}
                        className="flex items-center space-x-1 text-blue-500 text-sm font-medium"
                      >
                        <span>Lire l'article</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {/* Bouton IA */}
                        <button
                          onClick={() => handleAIExplanation(article)}
                          disabled={aiExplaining === article.id}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                          title="Demander à l'IA d'expliquer"
                        >
                          <MessageCircle className={`w-4 h-4 ${aiExplaining === article.id ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`} />
                        </button>
                        
                        {/* Bouton partage */}
                        <button
                          onClick={() => handleShare(article)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="Partager"
                        >
                          <Share className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {/* Bouton sauvegarde */}
                        <button
                          onClick={() => handleSaveArticle(article)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title={savedArticles.includes(article.id) ? 'Déjà sauvegardé' : 'Sauvegarder'}
                        >
                          {savedArticles.includes(article.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-green-500" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {news.length === 0 && !loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📰</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune actualité</h3>
              <p className="text-gray-600">Essayez de changer de catégorie</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNewsPage;
