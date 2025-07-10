
import { supabase } from '@/integrations/supabase/client';
import { NewsApiResponse, NewsItem, NewsSubscription } from '@/types/news';
import { getCurrentUser } from '@/services/auth-utils';

// Fonction pour obtenir la localisation de l'utilisateur via IP
export const getUserLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location data');
    return await response.json(); // contient { city, region, country, latitude, longitude, etc. }
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

// Cache temporaire pour éviter les appels répétés
const newsCache = new Map<string, { data: NewsItem[], timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fonction pour obtenir les préférences utilisateur depuis les cookies
const getUserPreferences = () => {
  try {
    const savedPrefs = document.cookie
      .split('; ')
      .find(row => row.startsWith('news_preferences='));
    
    if (savedPrefs) {
      return JSON.parse(decodeURIComponent(savedPrefs.split('=')[1]));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des préférences:', error);
  }
  
  return {
    language: 'fr',
    categories: ['general', 'technology', 'business']
  };
};

// === Récupération des dernières actualités avec préférences utilisateur ===
export const fetchLatestNews = async (
  category?: string,
  country?: string,
  query?: string
): Promise<NewsItem[]> => {
  const preferences = getUserPreferences();
  
  // Utiliser les préférences si les paramètres ne sont pas spécifiés
  const finalLanguage = country || (preferences.language === 'en' ? 'us' : preferences.language);
  const finalCategory = category || preferences.categories[0] || 'general';
  
  // Clé de cache
  const cacheKey = `${finalCategory}-${finalLanguage}-${query || ''}`;
  
  // Vérifier le cache
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const newsApiKey = 'pub_e9e18325ddca4013bc0b60a1bdf8e008';

  try {
    // Construction des paramètres
    const params = new URLSearchParams({
      apikey: newsApiKey,
      language: preferences.language,
      country: finalLanguage,
    });
    
    if (finalCategory !== 'all') params.append('category', finalCategory);
    if (query) params.append('q', query);

    // Appel à NewsData.io /latest
    const response = await fetch(`https://newsdata.io/api/1/latest?apikey=pub_e9e18325ddca4013bc0b60a1bdf8e008&language=${preferences.language}&country=${finalLanguage}`);
    if (!response.ok) {
      throw new Error(`NewsData.io status ${response.status}`);
    }
    const data = await response.json();

    if (!Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('Aucune actualité disponible');
    }

    // Transformer les données avec des descriptions plus longues
    const items: NewsItem[] = data.results.map((item: any, idx: number) => {
      // Créer une description plus longue en combinant plusieurs champs
      let longDescription = '';
      
      if (item.description) {
        longDescription += item.description;
      }
      
      if (item.content && item.content !== item.description) {
        if (longDescription) longDescription += ' ';
        longDescription += item.content.substring(0, 200);
      }
      
      // Si toujours pas assez long, utiliser le titre étendu
      if (longDescription.length < 100 && item.title) {
        longDescription = item.title + '. ' + (longDescription || 'Article détaillé disponible.');
      }
      
      // Limiter à 300 caractères pour la description
      if (longDescription.length > 300) {
        longDescription = longDescription.substring(0, 297) + '...';
      } else if (!longDescription.endsWith('.') && !longDescription.endsWith('...')) {
        longDescription += '.';
      }

      return {
        id: item.link || `news-${idx}`,
        title: item.title,
        summary: longDescription,
        content: item.content || item.description || longDescription,
        publishedAt: item.pubDate || new Date().toISOString(),
        source: item.source_id || 'NewsData.io',
        category: finalCategory,
        url: item.link,
        imageUrl: item.image_url || null,
        location: finalLanguage ? { country: finalLanguage } : undefined,
      };
    });

    // Mettre en cache
    newsCache.set(cacheKey, { data: items, timestamp: Date.now() });

    return items;
  } catch (error: any) {
    console.error('Error in fetchLatestNews (primary):', error.message || error);

    // Fallback : Supabase Edge Function
    try {
      const { data, error: edgeError } = await supabase.functions.invoke('get-news', {
        body: { category: finalCategory, country: finalLanguage, query },
      });
      if (edgeError) throw edgeError;

      const newsResponse = data as NewsApiResponse;
      if (!Array.isArray(newsResponse.items)) {
        throw new Error('Invalid news data received from edge');
      }
      return newsResponse.items;
    } catch (fallbackError) {
      console.error('Both sources failed:', fallbackError);

      // Dernier recours : article d'erreur
      return [
        {
          id: 'fallback-1',
          title: 'Impossible de charger les actualités',
          summary: 'Veuillez réessayer ultérieurement ou vérifier votre connexion internet.',
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

// === Fonction pour obtenir les actualités basées sur les catégories préférées ===
export const fetchPreferredNews = async (): Promise<NewsItem[]> => {
  const preferences = getUserPreferences();
  const allNews: NewsItem[] = [];
  
  // Récupérer les actualités pour chaque catégorie préférée
  for (const category of preferences.categories) {
    try {
      const categoryNews = await fetchLatestNews(category);
      allNews.push(...categoryNews.slice(0, 3)); // 3 articles par catégorie
    } catch (error) {
      console.error(`Erreur pour la catégorie ${category}:`, error);
    }
  }
  
  // Mélanger et limiter à 8 articles
  const shuffled = allNews.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8);
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
