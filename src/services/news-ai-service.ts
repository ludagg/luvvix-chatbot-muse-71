
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  category: string;
  language?: string;
}

export interface AINewsAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  categories: string[];
}

class NewsAIService {
  private readonly RSS_FEEDS = {
    'google-news': 'https://news.google.com/rss?hl=',
    'lemonde': 'https://www.lemonde.fr/rss/une.xml',
    'bbc': 'https://feeds.bbci.co.uk/news/rss.xml',
    'reuters': 'https://www.reuters.com/rssFeed/worldNews',
    'france24': 'https://www.france24.com/fr/rss',
    'liberation': 'https://www.liberation.fr/arc/outboundfeeds/rss-all/',
    'figaro': 'https://www.lefigaro.fr/rss/figaro_actualites.xml'
  };

  async fetchNews(language: string = 'fr', sources: string[] = ['google-news']): Promise<NewsArticle[]> {
    try {
      const allArticles: NewsArticle[] = [];

      for (const source of sources) {
        try {
          const articles = await this.fetchFromSource(source, language);
          allArticles.push(...articles);
        } catch (error) {
          console.error(`Error fetching from ${source}:`, error);
        }
      }

      // Trier par date de publication
      return allArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  private async fetchFromSource(source: string, language: string): Promise<NewsArticle[]> {
    try {
      let feedUrl = this.RSS_FEEDS[source as keyof typeof this.RSS_FEEDS];
      
      if (source === 'google-news') {
        feedUrl += language;
      }

      // Utiliser un service de conversion RSS vers JSON
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(`RSS fetch failed: ${data.message}`);
      }

      return data.items.map((item: any, index: number) => ({
        id: `${source}-${index}-${Date.now()}`,
        title: item.title,
        summary: this.extractSummary(item.description || item.content || ''),
        content: item.content || item.description || '',
        url: item.link,
        imageUrl: item.enclosure?.link || item.thumbnail || null,
        source: source,
        publishedAt: item.pubDate,
        category: 'general',
        language: language
      }));
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
      return [];
    }
  }

  private extractSummary(content: string): string {
    // Nettoyer le HTML et extraire un résumé
    const cleanText = content.replace(/<[^>]*>/g, '').trim();
    return cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText;
  }

  async generateAISummary(article: NewsArticle, language: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: {
          message: `Résume cet article de presse en ${language === 'fr' ? 'français' : 'anglais'} en 2-3 phrases claires et concises, sans jargon technique. Article: "${article.title}" - ${article.content.substring(0, 500)}...`
        }
      });

      if (error) throw error;
      return data.response || article.summary;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return article.summary;
    }
  }

  async generateDetailedAnalysis(article: NewsArticle, language: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: {
          message: `Fais une analyse approfondie et détaillée de cet article en ${language === 'fr' ? 'français' : 'anglais'}. Explique le contexte, les enjeux, les conséquences possibles, et donne des perspectives supplémentaires. Article: "${article.title}" - ${article.content}`
        }
      });

      if (error) throw error;
      return data.response || 'Analyse non disponible';
    } catch (error) {
      console.error('Error generating detailed analysis:', error);
      return 'Analyse non disponible pour le moment.';
    }
  }
}

export const newsAIService = new NewsAIService();
