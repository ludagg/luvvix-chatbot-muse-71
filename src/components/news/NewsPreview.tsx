
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EnhancedNewsService } from '@/services/enhanced-news-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { ExternalLink, ChevronRight, Newspaper, TrendingUp, Share, Bookmark, MessageCircle, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';

const NewsPreview: React.FC = () => {
  const navigate = useNavigate();
  const [aiExplaining, setAiExplaining] = useState<string>('');
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ['news-preview'],
    queryFn: () => EnhancedNewsService.fetchEnhancedNews('all', 'fr'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Limiter à 3 articles
  const previewItems = newsItems?.slice(0, 3);

  React.useEffect(() => {
    const saved = EnhancedNewsService.getSavedArticles();
    setSavedArticles(saved.map(a => a.id));
  }, []);

  const handleShare = async (article: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        });
      } catch (error) {
        handleCopyLink(article);
      }
    } else {
      handleCopyLink(article);
    }
  };

  const handleCopyLink = (article: any) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(article.url || '');
      toast.success('Lien copié !');
    }
  };

  const handleSaveArticle = (article: any) => {
    EnhancedNewsService.saveArticle(article);
    const saved = EnhancedNewsService.getSavedArticles();
    setSavedArticles(saved.map(a => a.id));
    toast.success('Article sauvegardé !');
  };

  const handleAIExplanation = async (article: any) => {
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

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-luvvix-purple/10 p-3 rounded-full">
              <Newspaper className="h-6 w-6 text-luvvix-purple" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">LuvviX News</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Restez informé des dernières actualités du monde entier, personnalisées selon vos intérêts et votre localisation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : previewItems?.length ? (
            previewItems.map((item) => (
              <Card key={item.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                {item.imageUrl ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-1">{item.title}</h3>
                  <CardDescription className="line-clamp-2 text-sm mb-3">
                    {item.summary}
                  </CardDescription>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                    <span>{item.source}</span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-luvvix-purple"
                    >
                      Lire <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  
                  {/* Boutons d'action minimalistes */}
                  <div className="flex items-center justify-center space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {/* Bouton IA */}
                    <button
                      onClick={() => handleAIExplanation(item)}
                      disabled={aiExplaining === item.id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                      title="Demander à l'IA d'expliquer"
                    >
                      <MessageCircle className={`w-4 h-4 ${aiExplaining === item.id ? 'text-luvvix-purple animate-pulse' : 'text-gray-500'}`} />
                    </button>
                    
                    {/* Bouton partage */}
                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      title="Partager"
                    >
                      <Share className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {/* Bouton sauvegarde */}
                    <button
                      onClick={() => handleSaveArticle(item)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      title={savedArticles.includes(item.id) ? 'Déjà sauvegardé' : 'Sauvegarder'}
                    >
                      {savedArticles.includes(item.id) ? (
                        <BookmarkCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-muted-foreground">Aucune actualité disponible pour le moment.</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/news')} 
            variant="luvvix"
            size="lg"
            className="group"
          >
            Voir toutes les actualités
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsPreview;
