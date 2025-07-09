
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Star, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { newsAIService, NewsArticle } from '@/services/news-ai-service';
import { useNewsSettings } from '@/hooks/useNewsSettings';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MobileNewsPageProps {
  onBack: () => void;
}

const MobileNewsPage = ({ onBack }: MobileNewsPageProps) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<{ [key: string]: string }>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<{ [key: string]: boolean }>({});
  
  const { settings } = useNewsSettings();
  const { saveArticle, removeArticle, isArticleSaved } = useSavedArticles();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await newsAIService.fetchNews(settings.language, settings.sources);
      
      // Générer les résumés IA pour les premiers articles
      const articlesWithAI = await Promise.all(
        newsData.slice(0, 5).map(async (article) => {
          try {
            const aiSummary = await newsAIService.generateAISummary(article, settings.language);
            return { ...article, summary: aiSummary };
          } catch (error) {
            return article;
          }
        })
      );

      setArticles([...articlesWithAI, ...newsData.slice(5)]);
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
    toast.success('Actualités mises à jour');
  };

  const handleSaveArticle = (article: NewsArticle) => {
    if (isArticleSaved(article.id)) {
      removeArticle(article.id);
      toast.success('Retiré des favoris');
    } else {
      saveArticle({
        id: article.id,
        title: article.title,
        summary: article.summary,
        url: article.url,
        imageUrl: article.imageUrl,
        source: article.source
      });
      toast.success('Sauvegardé');
    }
  };

  const handleDetailedAnalysis = async (article: NewsArticle) => {
    if (expandedAnalysis[article.id]) {
      setExpandedAnalysis(prev => ({ ...prev, [article.id]: '' }));
      return;
    }

    try {
      setLoadingAnalysis(prev => ({ ...prev, [article.id]: true }));
      const analysis = await newsAIService.generateDetailedAnalysis(article, settings.language);
      setExpandedAnalysis(prev => ({ ...prev, [article.id]: analysis }));
    } catch (error) {
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setLoadingAnalysis(prev => ({ ...prev, [article.id]: false }));
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Actualités IA</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <RefreshCw className={`w-6 h-6 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Génération des résumés IA...</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {articles.map((article) => (
              <article key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    {article.imageUrl && (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                      <h2 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                        {article.title}
                      </h2>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {article.source}
                        </Badge>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(article.publishedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.summary}
                  </p>
                  
                  {expandedAnalysis[article.id] && (
                    <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                      <h4 className="font-medium text-blue-900 mb-2 text-sm">
                        Analyse approfondie
                      </h4>
                      <p className="text-xs text-blue-800 whitespace-pre-wrap">
                        {expandedAnalysis[article.id]}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleDetailedAnalysis(article)}
                        disabled={loadingAnalysis[article.id]}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-3"
                      >
                        {loadingAnalysis[article.id] ? (
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Search className="w-3 h-3 mr-1" />
                        )}
                        {expandedAnalysis[article.id] ? 'Masquer' : 'Analyser'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => handleSaveArticle(article)}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-3"
                      >
                        <Star className={`w-3 h-3 mr-1 ${isArticleSaved(article.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        {isArticleSaved(article.id) ? 'Sauvé' : 'Sauver'}
                      </Button>
                      
                      <Button
                        onClick={() => window.open(article.url, '_blank')}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-3"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Lire
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNewsPage;
