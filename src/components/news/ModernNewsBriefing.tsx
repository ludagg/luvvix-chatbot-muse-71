
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  BookmarkPlus, 
  ExternalLink, 
  Search, 
  Clock,
  Globe,
  Share2,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNewsPreferences } from '@/hooks/useNewsPreferences';
import { fetchEnhancedNews } from '@/services/enhanced-news-service';
import { NewsItem } from '@/types/news';
import QuickNewsSetup from './QuickNewsSetup';

interface AIBriefingItem extends NewsItem {
  aiSummary?: string;
  relevanceScore?: number;
  aiTags?: string[];
}

interface ModernNewsBriefingProps {
  showSetup?: boolean;
  onPreferencesSet?: (categories: string[]) => void;
}

const ModernNewsBriefing: React.FC<ModernNewsBriefingProps> = ({ 
  showSetup = false, 
  onPreferencesSet 
}) => {
  const [briefingItems, setBriefingItems] = useState<AIBriefingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { preferences, hasConfiguredCategories } = useNewsPreferences();
  const { toast } = useToast();

  useEffect(() => {
    generateAIBriefing();
  }, [preferences]);

  const generateAIBriefing = async () => {
    setLoading(true);
    try {
      const news = await fetchEnhancedNews(
        preferences.categories,
        preferences.language,
        preferences.location ? 'auto' : ''
      );
      setBriefingItems(news);
    } catch (error) {
      console.error('Error generating AI briefing:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les actualités',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const saveArticle = async (article: AIBriefingItem) => {
    // Sauvegarder dans localStorage pour simplifier
    const savedArticles = JSON.parse(localStorage.getItem('luvvix_saved_articles') || '[]');
    const newArticle = {
      ...article,
      savedAt: new Date().toISOString()
    };
    
    savedArticles.unshift(newArticle);
    localStorage.setItem('luvvix_saved_articles', JSON.stringify(savedArticles.slice(0, 50)));
    
    toast({
      title: 'Article sauvegardé',
      description: 'L\'article a été ajouté à vos articles sauvegardés'
    });
  };

  const handleQuickSetupComplete = (categories: string[]) => {
    onPreferencesSet?.(categories);
    generateAIBriefing();
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                <div className="flex-1 p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="w-24 h-24 m-4 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {briefingItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {/* Afficher le setup rapide après le 2ème article si pas configuré */}
          {index === 2 && !hasConfiguredCategories && (
            <QuickNewsSetup
              onComplete={handleQuickSetupComplete}
              onDismiss={() => {}}
            />
          )}
          
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-0">
              <div className="flex">
                <div className="flex-1 p-4">
                  {/* Tags IA en haut */}
                  <div className="flex items-center gap-2 mb-3">
                    {item.aiTags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800">
                        {tag}
                      </Badge>
                    ))}
                    {item.relevanceScore && item.relevanceScore > 80 && (
                      <Badge className="text-xs bg-gradient-to-r from-orange-100 to-red-100 text-orange-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Très pertinent
                      </Badge>
                    )}
                  </div>

                  {/* Titre */}
                  <h3 className="font-bold text-lg leading-tight mb-2 text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>

                  {/* Métadonnées */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.publishedAt).toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                    {item.relevanceScore && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {Math.round(item.relevanceScore)}% pertinent
                      </span>
                    )}
                  </div>

                  {/* Résumé IA */}
                  {item.aiSummary && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-3 rounded-lg mb-4 border-l-2 border-blue-400">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                          {item.aiSummary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contenu expandable */}
                  {item.content && item.content !== item.summary && (
                    <div className="mb-4">
                      <div className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${
                        expandedItems.has(item.id) ? '' : 'line-clamp-3'
                      }`}>
                        {item.content}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                        className="mt-2 text-blue-600 hover:text-blue-800 p-0 h-auto"
                      >
                        {expandedItems.has(item.id) ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Réduire
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Lire plus
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => saveArticle(item)}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200"
                    >
                      <BookmarkPlus className="w-3 h-3 mr-1" />
                      Sauver
                    </Button>
                    
                    <Button
                      onClick={() => window.open(item.url, '_blank')}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Source
                    </Button>
                    
                    <Button
                      onClick={() => {
                        toast({
                          title: 'Recherche IA',
                          description: 'L\'IA recherche des articles similaires...'
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200"
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Détailler
                    </Button>

                    <Button
                      onClick={() => {
                        navigator.share?.({
                          title: item.title,
                          text: item.aiSummary || item.summary,
                          url: item.url
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border-orange-200"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Partager
                    </Button>
                  </div>
                </div>

                {/* Image */}
                {item.imageUrl && (
                  <div className="w-24 h-24 m-4 flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </React.Fragment>
      ))}

      {briefingItems.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun article disponible</h3>
            <p className="text-muted-foreground">
              Vérifiez votre connexion internet et réessayez.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModernNewsBriefing;
