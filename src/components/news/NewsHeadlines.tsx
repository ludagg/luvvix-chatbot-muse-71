
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, ExternalLink, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NewsItem } from '@/types/news';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NewsHeadlinesProps {
  newsItems?: NewsItem[];
  isLoading: boolean;
  error: unknown;
}

const NewsHeadlines: React.FC<NewsHeadlinesProps> = ({ newsItems, isLoading, error }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleSaveArticle = (article: NewsItem) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour sauvegarder des articles.",
        variant: "destructive",
      });
      return;
    }
    
    // For now just show a success message
    // In a future implementation, this would save the article to the user's saved articles
    toast({
      title: "Article sauvegardé",
      description: `"${article.title}" a été ajouté à vos articles sauvegardés.`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card border border-border">
            <CardHeader className="animate-pulse bg-muted/50 h-32"></CardHeader>
            <CardContent>
              <div className="animate-pulse bg-muted/50 h-4 w-3/4 mb-2"></div>
              <div className="animate-pulse bg-muted/50 h-4 w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning">
        <AlertDescription>
          Une erreur s'est produite lors du chargement des actualités. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Aucune actualité disponible pour le moment. Veuillez revenir plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {newsItems.map((item) => (
        <Card key={item.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
          {item.imageUrl ? (
            <div className="w-full h-56 overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  // Fallback image on error
                  e.currentTarget.src = "https://placehold.co/800x400?text=Actualité";
                }}
              />
            </div>
          ) : (
            <div className="w-full h-56 bg-muted flex items-center justify-center">
              <Newspaper className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">
              {item.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>{item.source}</span>
              <span>•</span>
              <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{item.summary}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                Lire l'article <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleSaveArticle(item)}
            >
              <Bookmark className="h-4 w-4 mr-1" /> Sauvegarder
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default NewsHeadlines;
