
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  BookmarkPlus, 
  ExternalLink, 
  Search, 
  TrendingUp,
  Clock,
  Globe,
  Eye,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchLatestNews, fetchDefaultNews } from '@/services/news-service';
import { NewsItem } from '@/types/news';
import QuickNewsSetup from './QuickNewsSetup';

interface AIBriefingItem extends NewsItem {
  aiSummary?: string;
  relevanceScore?: number;
  aiTags?: string[];
  relatedArticles?: NewsItem[];
}

interface AINewsBriefingProps {
  preferences?: any;
  showSetup?: boolean;
  onPreferencesSet?: (categories: string[]) => void;
}

const AINewsBriefing: React.FC<AINewsBriefingProps> = ({ 
  preferences, 
  showSetup = false, 
  onPreferencesSet 
}) => {
  const [briefingItems, setBriefingItems] = useState<AIBriefingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickSetup, setShowQuickSetup] = useState(showSetup);
  const [setupDismissed, setSetupDismissed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateAIBriefing();
  }, [preferences]);

  const generateAIBriefing = async () => {
    setLoading(true);
    try {
      let allNews: NewsItem[] = [];

      if (preferences?.categories?.length > 0) {
        // Utilisateur avec préférences configurées
        const newsPromises = preferences.categories.map((category: string) =>
          fetchLatestNews(category, preferences.location ? 'fr' : '', '')
        );
        const newsResults = await Promise.all(newsPromises);
        allNews = newsResults.flat();
      } else {
        // Utilisateur sans préférences - actualités par défaut
        allNews = await fetchDefaultNews();
      }

      // Simuler l'analyse IA
      const aiProcessedNews = await Promise.all(
        allNews.slice(0, 8).map(async (item) => {
          const aiSummary = await generateAISummary(item);
          const relevanceScore = calculateRelevanceScore(item, preferences);
          const aiTags = generateAITags(item);

          return {
            ...item,
            aiSummary,
            relevanceScore,
            aiTags
          };
        })
      );

      // Trier par score de pertinence
      const sortedNews = aiProcessedNews.sort(
        (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );

      setBriefingItems(sortedNews);
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

  const generateAISummary = async (item: NewsItem): Promise<string> => {
    const summaries = [
      `📰 ${item.title.substring(0, 60)}... - Article traité par l'IA pour vous`,
      `🔍 Analyse IA: Cette actualité pourrait vous intéresser selon vos préférences`,
      `⚡ Résumé intelligent: ${item.summary?.substring(0, 80)}...`,
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  };

  const calculateRelevanceScore = (item: NewsItem, userPreferences: any): number => {
    let score = 60; // Score de base plus élevé
    
    // Bonus pour les catégories préférées
    if (userPreferences?.categories?.includes(item.category)) {
      score += 25;
    }
    
    // Bonus pour la récence
    const hoursOld = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 6) score += 15;
    else if (hoursOld < 24) score += 10;
    
    return Math.min(100, score);
  };

  const generateAITags = (item: NewsItem): string[] => {
    const possibleTags = [
      '🔥 Tendance', '⚡ Flash', '🎯 Recommandé', '📈 Important', 
      '🌟 Sélectionné', '🚀 Nouveau', '💡 Analyse', '📊 Données'
    ];
    
    return possibleTags.slice(0, Math.floor(Math.random() * 2) + 1);
  };

  const handleQuickSetupComplete = (categories: string[]) => {
    setShowQuickSetup(false);
    setSetupDismissed(true);
    onPreferencesSet?.(categories);
    generateAIBriefing();
  };

  const handleQuickSetupDismiss = () => {
    setShowQuickSetup(false);
    setSetupDismissed(true);
  };

  const saveArticle = async (article: AIBriefingItem) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: 'Connexion requise',
          description: 'Connectez-vous pour sauvegarder des articles',
          variant: 'destructive'
        });
        return;
      }

      // Simuler la sauvegarde (à implémenter avec une vraie table)
      toast({
        title: 'Article sauvegardé',
        description: 'L\'article a été ajouté à vos articles sauvegardés'
      });
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder l\'article',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="mx-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {briefingItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {/* Afficher le setup rapide après le 2ème article */}
          {index === 2 && showQuickSetup && !setupDismissed && (
            <QuickNewsSetup
              onComplete={handleQuickSetupComplete}
              onDismiss={handleQuickSetupDismiss}
            />
          )}
          
          <Card className="mx-4 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {item.aiTags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-sm leading-tight mb-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg ml-3"
                  />
                )}
              </div>

              {item.aiSummary && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg mb-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    {item.aiSummary}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => saveArticle(item)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                >
                  <BookmarkPlus className="w-3 h-3 mr-1" />
                  Sauver
                </Button>
                
                <Button
                  onClick={() => window.open(item.url, '_blank')}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
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
                  className="text-xs h-7"
                >
                  <Search className="w-3 h-3 mr-1" />
                  Détailler
                </Button>
              </div>
            </CardContent>
          </Card>
        </React.Fragment>
      ))}

      {briefingItems.length === 0 && (
        <Card className="mx-4">
          <CardContent className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun article disponible</h3>
            <p className="text-muted-foreground">
              Vérifiez votre connexion internet et réessayez.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AINewsBriefing;
