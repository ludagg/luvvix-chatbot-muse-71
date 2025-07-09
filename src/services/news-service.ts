import { supabase } from '@/integrations/supabase/client';
import { NewsApiResponse, NewsItem, NewsSubscription } from '@/types/news';
import { getCurrentUser } from '@/services/auth-utils';

// Fonction pour obtenir la localisation de l'utilisateur
export const getUserLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location data');
    return await response.json();
  } catch (error) {
    console.error('Error getting user location:', error);
    return { country_code: 'FR', country_name: 'France' }; // Valeur par défaut
  }
};

// Fonction pour récupérer les actualités par défaut basées sur la localisation
export const fetchDefaultNews = async (): Promise<NewsItem[]> => {
  try {
    const location = await getUserLocation();
    const countryCode = location.country_code || 'FR';
    
    // Récupérer des actualités générales pour le pays
    return await fetchLatestNews('general', countryCode.toLowerCase(), '');
  } catch (error) {
    console.error('Error fetching default news:', error);
    return [];
  }
};

// Fonction pour récupérer les dernières actualités
export const fetchLatestNews = async (
  category: string = 'general',
  country: string = '',
  query: string = ''
): Promise<NewsItem[]> => {
  try {
    // Utilisation d'une API ouverte gratuite (Google News RSS)
    const countryCode = country || 'fr'; // Par défaut France
    let feedUrl = `https://news.google.com/rss`;
    
    if (country) {
      feedUrl += `?gl=${country}`;
    }
    
    if (category !== 'general' && category !== 'all') {
      feedUrl += `&ceid=${countryCode}:${category}`;
    }
    
    if (query) {
      // Encodage de la requête pour l'URL
      const encodedQuery = encodeURIComponent(query);
      feedUrl = `https://news.google.com/rss/search?q=${encodedQuery}`;
    }
    
    // Utilise le proxy RSS2JSON pour convertir le flux RSS en JSON
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }
    
    // Transformation des données au format NewsItem
    const items: NewsItem[] = data.items.map((item: any, index: number) => ({
      id: item.guid || `news-${index}`,
      title: item.title,
      summary: item.description?.substring(0, 200) + '...' || '',
      content: item.content || item.description || '',
      publishedAt: item.pubDate,
      source: item.author || data.feed.title,
      category: category,
      url: item.link,
      imageUrl: item.enclosure?.link || item.thumbnail || null,
      location: country ? { country: country } : undefined
    }));
    
    return items.slice(0, 10); // Limiter à 10 articles
  } catch (error) {
    console.error('Error in fetchLatestNews:', error);
    // Retourner des données statiques en dernier recours
    return [{
      id: 'fallback-1',
      title: 'Actualités disponibles',
      summary: 'Configurez vos préférences pour une expérience personnalisée.',
      content: 'Personnalisez votre fil d\'actualités selon vos intérêts.',
      publishedAt: new Date().toISOString(),
      source: 'LuvviX News',
      category: 'general',
      url: '#',
    }];
  }
};

// Add getNews as an alias for fetchLatestNews for backward compatibility
export const getNews = fetchLatestNews;

// Fonction pour vérifier si l'utilisateur a configuré ses préférences
export const hasUserConfiguredPreferences = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('news_preferences')
      .eq('user_id', user.id)
      .single();

    if (error) return false;
    
    return data?.news_preferences && 
           data.news_preferences.categories && 
           data.news_preferences.categories.length > 0;
  } catch (error) {
    console.error('Error checking user preferences:', error);
    return false;
  }
};

// Fonction pour sauvegarder les préférences simplifiées
export const saveSimplifiedPreferences = async (categories: string[]): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const preferences = {
      categories,
      sources: [],
      keywords: [],
      frequency: 'realtime',
      language: 'fr',
      location: true
    };

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        news_preferences: preferences
      }, {
        onConflict: 'user_id'
      });

    return !error;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};

// Fonction pour s'abonner aux sujets d'actualités
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
      body: {
        topics,
        email,
        preferences
      },
    });

    if (error) {
      console.error('Error subscribing to topics:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in subscribeToNewsTopics:', error);
    return false;
  }
};

// Fonction pour obtenir l'abonnement de l'utilisateur actuel
export const getCurrentUserSubscription = async (): Promise<NewsSubscription | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Using the raw SQL approach since the auto-generated types don't include the new table yet
    const { data, error } = await supabase
      .from('news_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);
    
    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }

    // Convert the raw data to the NewsSubscription type
    return data[0] as unknown as NewsSubscription;
  } catch (error) {
    console.error('Error in getCurrentUserSubscription:', error);
    return null;
  }
};

// Fonction pour se désabonner de la newsletter
export const unsubscribeFromNewsletter = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    // Using the raw SQL approach since the auto-generated types don't include the new table yet
    const { error } = await supabase
      .from('news_subscriptions')
      .delete()
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in unsubscribeFromNewsletter:', error);
    return false;
  }
};
