
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
import { fetchLatestNews } from '@/services/news-service';
import { NewsItem } from '@/types/news';

interface AIBriefingItem extends NewsItem {
  aiSummary?: string;
  relevanceScore?: number;
  aiTags?: string[];
  relatedArticles?: NewsItem[];
}

interface AINewsBriefingProps {
  preferences: any;
}

const AINewsBriefing: React.FC<AINewsBriefingProps> = ({ preferences }) => {
  const [briefingItems, setBriefingItems] = useState<AIBriefingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<AIBriefingItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateAIBriefing();
  }, [preferences]);

  const generateAIBriefing = async () => {
    setLoading(true);
    try {
      // Récupérer les actualités basées sur les préférences
      const newsPromises = preferences.categories.map((category: string) =>
        fetchLatestNews(category, preferences.location ? 'fr' : '', '')
      );

      const newsResults = await Promise.all(newsPromises);
      const allNews = newsResults.flat();

      // Simuler l'analyse IA (en production, on utiliserait l'API Gemini)
      const aiProcessedNews = await Promise.all(
        allNews.slice(0, 10).map(async (item) => {
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
        description: 'Impossible de générer le briefing IA des actualités',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async (item: NewsItem): Promise<string> => {
    // En production, on utiliserait l'API Gemini pour générer un vrai résumé
    const summaries = [
      `Analyse IA: ${item.title.slice(0, 80)}... Cette actualité semble importante en raison de son impact potentiel.`,
      `Résumé intelligent: L'article traite d'un sujet d'actualité pertinent avec des implications intéressantes.`,
      `Briefing IA: Cette information pourrait vous intéresser au vu de vos préférences configurées.`,
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  };

  const calculateRelevanceScore = (item: NewsItem, userPreferences: any): number => {
    let score = 50; // Score de base
    
    // Bonus pour les catégories préférées
    if (userPreferences.categories.includes(item.category)) {
      score += 30;
    }
    
    // Bonus pour les mots-clés
    userPreferences.keywords.forEach((keyword: string) => {
      if (item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.summary?.toLowerCase().includes(keyword.toLowerCase())) {
        score += 20;
      }
    });
    
    // Bonus pour la récence
    const hoursOld = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 6) score += 15;
    else if (hoursOld < 24) score += 10;
    
    return Math.min(100, score);
  };

  const generateAITags = (item: NewsItem): string[] => {
    const possibleTags = [
      'Tendance', 'Important', 'Analyse', 'Opinion', 'Breaking',
      'Technologie', 'Économie', 'Société', 'Innovation', 'Urgent'
    ];
    
    return possibleTags.slice(0, Math.floor(Math.random() * 3) + 1);
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

      const { error } = await supabase
        .from('saved_articles')
        .insert({
          user_id: user.user.id,
          article_data: article,
          saved_at: new Date().toISOString()
        });

      if (error) throw error;

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

  const exploreRelated = async (article: AIBriefingItem) => {
    // Simuler la recherche d'articles connexes via IA
    toast({
      title: 'Recherche IA en cours',
      description: 'L\'IA recherche des articles connexes...'
    });
    
    // En production, on utiliserait l'API Gemini pour trouver des articles similaires
    setTimeout(() => {
      toast({
        title: 'Articles connexes trouvés',
        description: '3 articles similaires ont été identifiés'
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
          <h2 className="text-xl font-bold">Génération du briefing IA...</h2>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold">Votre Briefing IA</h2>
        </div>
        <Button onClick={generateAIBriefing} variant="outline" size="sm">
          <TrendingUp className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {briefingItems.map((item, index) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Score: {item.relevanceScore}%
                  </Badge>
                  {item.aiTags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
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
                  className="w-20 h-20 object-cover rounded-lg ml-4"
                />
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {item.aiSummary && (
              <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg mb-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{item.aiSummary}</p>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-4">{item.summary}</p>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => saveArticle(item)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <BookmarkPlus className="w-4 h-4" />
                Sauvegarder
              </Button>
              
              <Button
                onClick={() => window.open(item.url, '_blank')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Lire l'original
              </Button>
              
              <Button
                onClick={() => exploreRelated(item)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Explorer
              </Button>
              
              <Button
                onClick={() => {
                  navigator.share?.({
                    title: item.title,
                    text: item.summary,
                    url: item.url
                  });
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {briefingItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun article disponible</h3>
            <p className="text-muted-foreground">
              Essayez d'ajuster vos préférences ou de recharger le briefing.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AINewsBriefing;
