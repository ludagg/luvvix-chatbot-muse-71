
import { supabase } from '@/integrations/supabase/client';
import { NewsItem } from '@/types/news';

// Service d'actualités amélioré avec une meilleure source RSS
export class EnhancedNewsService {
  private static readonly RSS_SOURCES = [
    'https://feeds.feedburner.com/franceinfo/une',
    'https://www.lemonde.fr/rss/une.xml',
    'https://rss.cnn.com/rss/edition.rss',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.lefigaro.fr/lefigaro/laune'
  ];

  static async fetchEnhancedNews(category: string = 'all', country: string = 'fr'): Promise<NewsItem[]> {
    try {
      // Utilisation de l'API RSS2JSON avec rotation des sources
      const sourceUrl = this.RSS_SOURCES[Math.floor(Math.random() * this.RSS_SOURCES.length)];
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(sourceUrl)}&count=20&order_by=pubDate&order_dir=desc`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status !== 'ok' || !data.items) {
        throw new Error('Failed to fetch RSS data');
      }

      return data.items.map((item: any, index: number) => ({
        id: item.guid || `news-${Date.now()}-${index}`,
        title: item.title || 'Sans titre',
        summary: this.extractCleanSummary(item.description || item.content),
        content: item.content || item.description || '',
        publishedAt: item.pubDate || new Date().toISOString(),
        source: item.author || data.feed?.title || 'Actualités',
        category: category !== 'all' ? category : 'general',
        url: item.link || '#',
        imageUrl: this.extractImageUrl(item) || null
      }));
    } catch (error) {
      console.error('Error fetching enhanced news:', error);
      // Fallback vers le service existant
      return this.getFallbackNews();
    }
  }

  private static extractCleanSummary(description: string): string {
    if (!description) return '';
    
    // Nettoie le HTML et extrait un résumé propre
    const cleanText = description
      .replace(/<[^>]*>/g, '') // Supprime les tags HTML
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Supprime les entités HTML
      .trim();
    
    // Limite à 150 caractères avec coupure propre
    if (cleanText.length <= 150) return cleanText;
    
    const truncated = cleanText.substring(0, 147);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 100 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  private static extractImageUrl(item: any): string | null {
    // Cherche une image dans différents champs
    if (item.enclosure?.link) return item.enclosure.link;
    if (item.thumbnail) return item.thumbnail;
    
    // Cherche dans le contenu HTML
    const content = item.content || item.description || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
    
    return null;
  }

  private static getFallbackNews(): NewsItem[] {
    return [{
      id: 'fallback-1',
      title: 'Service d\'actualités temporairement indisponible',
      summary: 'Veuillez réessayer dans quelques instants.',
      content: 'Le service d\'actualités rencontre des difficultés techniques.',
      publishedAt: new Date().toISOString(),
      source: 'LuvviX News',
      category: 'system',
      url: '#'
    }];
  }

  // Fonction pour obtenir une explication IA d'un article
  static async getAIExplanation(article: NewsItem): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: {
          message: `Explique-moi cet article d'actualité de manière simple et concise en français (maximum 200 mots) : 

Titre: ${article.title}
Résumé: ${article.summary}
Source: ${article.source}

Fournis une explication claire et objective des faits principaux.`
        }
      });

      if (error) throw error;
      return data?.response || 'Désolé, impossible d\'expliquer cet article pour le moment.';
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      return 'Désolé, le service d\'explication IA est temporairement indisponible.';
    }
  }

  // Sauvegarde d'article (localStorage pour simplicité)
  static saveArticle(article: NewsItem): void {
    try {
      const saved = JSON.parse(localStorage.getItem('luvvix_saved_articles') || '[]');
      const exists = saved.find((a: NewsItem) => a.id === article.id);
      
      if (!exists) {
        saved.unshift(article);
        // Limite à 50 articles sauvegardés
        if (saved.length > 50) saved.splice(50);
        localStorage.setItem('luvvix_saved_articles', JSON.stringify(saved));
      }
    } catch (error) {
      console.error('Error saving article:', error);
    }
  }

  static getSavedArticles(): NewsItem[] {
    try {
      return JSON.parse(localStorage.getItem('luvvix_saved_articles') || '[]');
    } catch (error) {
      console.error('Error getting saved articles:', error);
      return [];
    }
  }

  static isArticleSaved(articleId: string): boolean {
    try {
      const saved = JSON.parse(localStorage.getItem('luvvix_saved_articles') || '[]');
      return saved.some((a: NewsItem) => a.id === articleId);
    } catch (error) {
      return false;
    }
  }
}
