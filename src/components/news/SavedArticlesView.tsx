
import React from 'react';
import { Star, ExternalLink, Trash2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { toast } from 'sonner';

const SavedArticlesView = () => {
  const { savedArticles, removeArticle } = useSavedArticles();

  const handleRemoveArticle = (articleId: string) => {
    removeArticle(articleId);
    toast.success('Article supprimé des favoris');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (savedArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucun article sauvegardé
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Sauvegardez des articles depuis la section actualités pour les retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Articles sauvegardés
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {savedArticles.length} article(s) dans vos favoris
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {savedArticles.map((article) => (
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
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Sauvé le {formatDate(article.savedAt)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {article.source}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => window.open(article.url, '_blank')}
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 h-8"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Lire
                      </Button>
                      
                      <Button
                        onClick={() => handleRemoveArticle(article.id)}
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 h-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
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

export default SavedArticlesView;
