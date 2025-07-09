
import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, Star, Search, RefreshCw, Eye, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { newsAIService, NewsArticle } from '@/services/news-ai-service';
import { useNewsSettings } from '@/hooks/useNewsSettings';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { toast } from 'sonner';

interface ModernNewsInterfaceProps {
  className?: string;
}

const ModernNewsInterface = ({ className = '' }: ModernNewsInterfaceProps) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<{ [key: string]: string }>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<{ [key: string]: boolean }>({});
  
  const { settings } = useNewsSettings();
  const { saveArticle, removeArticle, isArticleSaved } = useSavedArticles();

  useEffect(() => {
    loadNews();
  }, [settings.language, settings.sources]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await newsAIService.fetchNews(settings.language, settings.sources);
      
      // Générer les résumés IA pour les premiers articles
      const articlesWithAI = await Promise.all(
        newsData.slice(0, 10).map(async (article) => {
          if (settings.aiSummaryEnabled) {
            try {
              const aiSummary = await newsAIService.generateAISummary(article, settings.language);
              return { ...article, summary: aiSummary };
            } catch (error) {
              console.error('Error generating AI summary:', error);
              return article;
            }
          }
          return article;
        })
      );

      setArticles([...articlesWithAI, ...newsData.slice(10)]);
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error('Erreur lors du chargement des actualités');
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
      toast.success('Article retiré des favoris');
    } else {
      saveArticle({
        id: article.id,
        title: article.title,
        summary: article.summary,
        url: article.url,
        imageUrl: article.imageUrl,
        source: article.source
      });
      toast.success('Article sauvegardé');
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
      console.error('Error generating analysis:', error);
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
    return `Il y a ${Math.floor(diffInHours / 24)} jour(s)`;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Actualités IA</h2>
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Actualités IA
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Résumés intelligents • {articles.length} articles
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="group hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {article.imageUrl && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
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
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                  
                  {expandedAnalysis[article.id] && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Analyse approfondie
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                        {expandedAnalysis[article.id]}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(article.publishedAt)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {article.source}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleDetailedAnalysis(article)}
                        disabled={loadingAnalysis[article.id]}
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 h-8"
                      >
                        {loadingAnalysis[article.id] ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Search className="w-3 h-3" />
                            {expandedAnalysis[article.id] ? 'Masquer' : 'En savoir plus'}
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handleSaveArticle(article)}
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 h-8"
                      >
                        <Star className={`w-3 h-3 ${isArticleSaved(article.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        {isArticleSaved(article.id) ? 'Sauvé' : 'Sauver'}
                      </Button>
                      
                      <Button
                        onClick={() => window.open(article.url, '_blank')}
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 h-8"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Lire
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModernNewsInterface;
