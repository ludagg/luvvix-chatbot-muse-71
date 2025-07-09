
import React from 'react';
import { ArrowLeft, Star, ExternalLink, Trash2, Clock } from 'lucide-react';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MobileSavedArticlesProps {
  onBack: () => void;
}

const MobileSavedArticles = ({ onBack }: MobileSavedArticlesProps) => {
  const { savedArticles, removeArticle } = useSavedArticles();

  const handleRemoveArticle = (articleId: string) => {
    removeArticle(articleId);
    toast.success('Article supprimé');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Articles sauvés</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {savedArticles.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun article sauvé
              </h3>
              <p className="text-gray-600 text-sm px-8">
                Sauvegardez des articles depuis les actualités pour les retrouver ici.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {savedArticles.map((article) => (
              <article key={article.id} className="p-4">
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
                          Sauvé le {formatDate(article.savedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      onClick={() => window.open(article.url, '_blank')}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 px-3"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Lire l'article
                    </Button>
                    
                    <Button
                      onClick={() => handleRemoveArticle(article.id)}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 px-3 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </Button>
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

export default MobileSavedArticles;
