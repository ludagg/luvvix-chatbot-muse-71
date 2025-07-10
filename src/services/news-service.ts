import { supabase } from '@/integrations/supabase/client';
import { NewsApiResponse, NewsItem, NewsSubscription } from '@/types/news';
import { getCurrentUser } from '@/services/auth-utils';

// Cache temporaire avec TTL
interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
  ttl: number;
}

const newsCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Fonction pour obtenir la localisation de l'utilisateur via IP
export const getUserLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location data');
    return await response.json();
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

// === Gemini résumé et traduction via Edge Function ===
const enhanceNewsWithGemini = async (items: any[], targetLanguage: string = 'fr'): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
      body: {
        message: `Tu es un expert journaliste multilingue. Pour chaque article ci-dessous, génère un titre accrocheur et une description détaillée (2-3 phrases) en ${getLanguageName(targetLanguage)}. 
        
Format de réponse attendu pour chaque article :
ARTICLE_INDEX: {index}
TITRE: [titre accrocheur en ${getLanguageName(targetLanguage)}]
DESCRIPTION: [description détaillée de 2-3 phrases en ${getLanguageName(targetLanguage)}]
---

Articles à traiter:
${items.map((item, idx) => `
${idx}: ${item.title || 'Sans titre'}
Contenu: ${(item.description || item.content || '').slice(0, 300)}...
`).join('\n')}

Traite tous les articles dans l'ordre et respecte strictement le format demandé.`
      }
    });

    if (error) throw error;

    const geminiResponse = data?.response || '';
    return parseGeminiEnhancedNews(items, geminiResponse, targetLanguage);
  } catch (error) {
    console.error('Erreur enhancement Gemini:', error);
    return items.map((item, idx) => ({
      id: item.link || `news-${idx}`,
      title: item.title || 'Article sans titre',
      summary: (item.description || item.content || 'Aucun résumé disponible').slice(0, 200) + '...',
      content: item.content || item.description || '',
      publishedAt: item.pubDate || new Date().toISOString(),
      source: item.source_id || 'NewsData.io',
      category: 'general',
      url: item.link || '#',
      imageUrl: item.image_url || null,
    }));
  }
};

const parseGeminiEnhancedNews = (originalItems: any[], geminiResponse: string, targetLanguage: string): NewsItem[] => {
  const articles = geminiResponse.split('---').filter(section => section.trim());
  
  return originalItems.map((item, idx) => {
    const articleSection = articles.find(section => 
      section.includes(`ARTICLE_INDEX: ${idx}`) || section.includes(`${idx}:`)
    );
    
    let enhancedTitle = item.title || 'Article sans titre';
    let enhancedDescription = (item.description || item.content || 'Aucun résumé disponible').slice(0, 150) + '...';
    
    if (articleSection) {
      const titleMatch = articleSection.match(/TITRE:\s*(.+?)(?:\n|DESCRIPTION:)/s);
      const descMatch = articleSection.match(/DESCRIPTION:\s*(.+?)(?:\n---|\n$|$)/s);
      
      if (titleMatch) enhancedTitle = titleMatch[1].trim();
      if (descMatch) enhancedDescription = descMatch[1].trim();
    }
    
    return {
      id: item.link || `news-${idx}`,
      title: enhancedTitle,
      summary: enhancedDescription,
      content: item.content || item.description || '',
      publishedAt: item.pubDate || new Date().toISOString(),
      source: item.source_id || 'NewsData.io',
      category: 'general',
      url: item.link || '#',
      imageUrl: item.image_url || null,
    };
  });
};

const getLanguageName = (code: string): string => {
  const languages: { [key: string]: string } = {
    'fr': 'français',
    'en': 'anglais',
    'es': 'espagnol',
    'de': 'allemand',
    'it': 'italien',
    'pt': 'portugais',
    'ar': 'arabe',
    'zh': 'chinois',
    'ja': 'japonais',
    'ko': 'coréen'
  };
  return languages[code] || 'français';
};

// Fonction pour vérifier et nettoyer le cache
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, entry] of newsCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      newsCache.delete(key);
    }
  }
};

// === Récupération et résumé des dernières actualités avec cache ===
export const fetchLatestNews = async (
  category: string = 'all',
  country: string = 'fr',
  query: string = '',
  userLanguage: string = 'fr'
): Promise<NewsItem[]> => {
  // Clé de cache basée sur les paramètres
  const cacheKey = `${category}-${country}-${query}-${userLanguage}`;
  
  // Nettoyer le cache expiré
  cleanExpiredCache();
  
  // Vérifier le cache
  const cachedEntry = newsCache.get(cacheKey);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
    console.log('📰 Actualités servies depuis le cache');
    return cachedEntry.data;
  }

  const newsApiKey = 'pub_e9e18325ddca4013bc0b60a1bdf8e008';

  try {
    console.log('📰 Récupération de nouvelles actualités...');
    
    // Construction des paramètres
    const params = new URLSearchParams({
      apikey: newsApiKey,
      language: country === 'fr' ? 'fr' : 'en',
      country,
    });
    if (category !== 'all') params.append('category', category);
    if (query) params.append('q', query);

    // Appel à NewsData.io
    const response = await fetch(`https://newsdata.io/api/1/latest?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`NewsData.io status ${response.status}`);
    }
    const data = await response.json();

    if (!Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('Aucune actualité disponible');
    }

    // Enhancement avec Gemini pour la langue choisie
    const enhancedItems = await enhanceNewsWithGemini(data.results.slice(0, 10), userLanguage);

    // Mettre en cache
    newsCache.set(cacheKey, {
      data: enhancedItems,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    });

    console.log(`📰 ${enhancedItems.length} actualités traitées et mises en cache`);
    return enhancedItems;

  } catch (error: any) {
    console.error('Error in fetchLatestNews (primary):', error.message || error);

    // Fallback : Edge Function
    try {
      const { data, error: edgeError } = await supabase.functions.invoke('get-news', {
        body: { category, country, query },
      });
      if (edgeError) throw edgeError;

      const newsResponse = data as NewsApiResponse;
      if (!Array.isArray(newsResponse.items)) {
        throw new Error('Invalid news data received from edge');
      }
      return newsResponse.items;
    } catch (fallbackError) {
      console.error('Both sources failed:', fallbackError);

      // Dernier recours
      return [
        {
          id: 'fallback-1',
          title: 'Impossible de charger les actualités',
          summary: 'Veuillez réessayer ultérieurement. Le service d\'actualités rencontre temporairement des difficultés techniques.',
          content: '',
          publishedAt: new Date().toISOString(),
          source: 'LuvviX News',
          category: 'error',
          url: '#',
        },
      ];
    }
  }
};

// Alias
export const getNews = fetchLatestNews;

// === Fonction pour vider le cache manuellement ===
export const clearNewsCache = () => {
  newsCache.clear();
  console.log('🗑️ Cache des actualités vidé');
};

// === Statistiques du cache ===
export const getCacheStats = () => {
  cleanExpiredCache();
  return {
    size: newsCache.size,
    keys: Array.from(newsCache.keys()),
    totalMemory: JSON.stringify(Array.from(newsCache.values())).length
  };
};

// === Abonnement aux sujets ===
export const subscribeToNewsTopics = async (
  topics: string[],
  email: string,
  preferences: {
    frequency: 'daily' | 'weekly' | 'realtime';
    categories: string[];
    location: boolean;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('subscribe-to-topics', {
      body: { topics, email, preferences },
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error subscribing to topics:', err);
    return false;
  }
};

// === Gestion de l'abonnement utilisateur ===
export const getCurrentUserSubscription = async (): Promise<NewsSubscription | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('news_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0] as unknown as NewsSubscription;
  } catch (err) {
    console.error('Error in getCurrentUserSubscription:', err);
    return null;
  }
};

// === Désabonnement ===
export const unsubscribeFromNewsletter = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { error } = await supabase
      .from('news_subscriptions')
      .delete()
      .eq('user_id', user.id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error in unsubscribeFromNewsletter:', err);
    return false;
  }
};
