
import { supabase } from '@/integrations/supabase/client';
import { NewsItem } from '@/types/news';

const RSS_SOURCES = {
  // Sources françaises
  'le-monde': 'https://www.lemonde.fr/rss/une.xml',
  'le-figaro': 'https://www.lefigaro.fr/rss/figaro_actualites.xml',
  'liberation': 'https://www.liberation.fr/arc/outboundfeeds/rss-all/',
  'franceinfo': 'https://www.francetvinfo.fr/titres.rss',
  'bfmtv': 'https://www.bfmtv.com/rss/info/flux-rss/flux-toutes-les-actualites/',
  
  // Sources internationales
  'bbc-world': 'https://feeds.bbci.co.uk/news/world/rss.xml',
  'reuters': 'https://feeds.reuters.com/reuters/topNews',
  'cnn': 'http://rss.cnn.com/rss/edition.rss',
  'associated-press': 'https://feeds.feedburner.com/ap-top-news',
  
  // Sources tech
  'techcrunch': 'https://techcrunch.com/feed/',
  'the-verge': 'https://www.theverge.com/rss/index.xml',
  'wired': 'https://www.wired.com/feed/rss',
  
  // Sources business
  'financial-times': 'https://www.ft.com/rss/home',
  'bloomberg': 'https://feeds.bloomberg.com/markets/news.rss',
  
  // Google News par catégorie
  'google-general': 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr',
  'google-tech': 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=fr&gl=FR&ceid=FR:fr',
  'google-business': 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=fr&gl=FR&ceid=FR:fr',
  'google-sports': 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=fr&gl=FR&ceid=FR:fr',
  'google-science': 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=fr&gl=FR&ceid=FR:fr'
};

export const enhancedNewsService = {
  async fetchFromMultipleSources(category: string = 'all', maxArticles: number = 20): Promise<NewsItem[]> {
    try {
      const selectedSources = this.getSourcesByCategory(category);
      const allArticles: NewsItem[] = [];

      // Fetch from multiple sources in parallel
      const fetchPromises = selectedSources.map(async (sourceKey) => {
        try {
          const feedUrl = RSS_SOURCES[sourceKey as keyof typeof RSS_SOURCES];
          const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=10`;
          
          const response = await fetch(proxyUrl);
          const data = await response.json();
          
          if (data.status === 'ok' && data.items) {
            return data.items.map((item: any, index: number) => ({
              id: `${sourceKey}-${index}-${Date.now()}`,
              title: item.title,
              summary: item.description || item.content || '',
              content: item.content || item.description || '',
              publishedAt: item.pubDate,
              source: data.feed?.title || sourceKey,
              category: category,
              url: item.link,
              imageUrl: this.extractImageFromContent(item.description || item.content) || null,
              location: { country: 'fr' }
            }));
          }
          return [];
        } catch (error) {
          console.warn(`Failed to fetch from ${sourceKey}:`, error);
          return [];
        }
      });

      const results = await Promise.allSettled(fetchPromises);
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value);
        }
      });

      // Remove duplicates based on title similarity
      const uniqueArticles = this.removeDuplicates(allArticles);
      
      // Sort by publication date (most recent first)
      const sortedArticles = uniqueArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      // Limit results and enhance with AI summaries
      const limitedArticles = sortedArticles.slice(0, maxArticles);
      return await this.enhanceWithAISummaries(limitedArticles);

    } catch (error) {
      console.error('Error fetching from multiple sources:', error);
      return [];
    }
  },

  getSourcesByCategory(category: string): string[] {
    switch (category) {
      case 'technology':
        return ['google-tech', 'techcrunch', 'the-verge', 'wired'];
      case 'business':
        return ['google-business', 'bloomberg', 'financial-times'];
      case 'sports':
        return ['google-sports'];
      case 'science':
        return ['google-science'];
      case 'france':
        return ['le-monde', 'le-figaro', 'liberation', 'franceinfo', 'bfmtv'];
      case 'international':
        return ['bbc-world', 'reuters', 'cnn', 'associated-press'];
      default:
        return ['google-general', 'le-monde', 'bbc-world', 'techcrunch'];
    }
  },

  removeDuplicates(articles: NewsItem[]): NewsItem[] {
    const seen = new Set();
    return articles.filter((article) => {
      const key = article.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  extractImageFromContent(content: string): string | null {
    if (!content) return null;
    
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = content.match(imgRegex);
    
    if (match) {
      return match[1];
    }
    
    // Try to find image URLs in text
    const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i;
    const urlMatch = content.match(urlRegex);
    
    return urlMatch ? urlMatch[1] : null;
  },

  async enhanceWithAISummaries(articles: NewsItem[]): Promise<NewsItem[]> {
    try {
      const enhancedArticles = await Promise.all(
        articles.map(async (article) => {
          try {
            const aiSummary = await this.generateAISummary(article);
            return {
              ...article,
              title: aiSummary.catchyTitle || article.title,
              summary: aiSummary.briefDescription || article.summary,
              aiEnhanced: true
            };
          } catch (error) {
            console.warn('Failed to enhance article with AI:', error);
            return article;
          }
        })
      );

      return enhancedArticles;
    } catch (error) {
      console.error('Error enhancing with AI summaries:', error);
      return articles;
    }
  },

  async generateAISummary(article: NewsItem): Promise<{
    catchyTitle: string;
    briefDescription: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: {
          message: `Analyse cet article de presse et génère:
1. Un titre accrocheur en français (max 80 caractères)
2. Une description brève et engageante (max 150 caractères)

Article:
Titre: ${article.title}
Contenu: ${article.content.slice(0, 500)}...

Réponds uniquement au format JSON:
{
  "catchyTitle": "titre accrocheur ici",
  "briefDescription": "description brève ici"
}`,
          conversationType: 'news_summary'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Parse the AI response
      try {
        const aiResponse = JSON.parse(data.response);
        return {
          catchyTitle: aiResponse.catchyTitle || article.title,
          briefDescription: aiResponse.briefDescription || article.summary
        };
      } catch (parseError) {
        // If JSON parsing fails, try to extract from text
        const response = data.response;
        const titleMatch = response.match(/"catchyTitle":\s*"([^"]+)"/);
        const descMatch = response.match(/"briefDescription":\s*"([^"]+)"/);
        
        return {
          catchyTitle: titleMatch ? titleMatch[1] : article.title,
          briefDescription: descMatch ? descMatch[1] : article.summary
        };
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return {
        catchyTitle: article.title,
        briefDescription: article.summary
      };
    }
  }
};
