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
    return null;
  }
};

// Fonction pour récupérer les dernières actualités
export const fetchLatestNews = async (
  category: string = 'all',
  country: string = 'fr',
  query: string = ''
): Promise<NewsItem[]> => {
  const apiKey = 'pub_e9e18325ddca4013bc0b60a1bdf8e008';

  try {
    // Construction de l'URL NewsData.io
    const baseUrl = 'https://newsdata.io/api/1/latest';
    const params = new URLSearchParams({
      apikey: apiKey,
      language: 'fr',
    });

    if (category !== 'all') params.append('category', category);
    if (query) params.append('q', query);

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data = await response.json();

    if (!data?.results || data.results.length === 0) {
      throw new Error('Aucune actualité disponible');
    }

    // Mapping au format NewsItem[]
    const items: NewsItem[] = data.results.map((item: any, index: number) => ({
      id: item.link || `news-${index}`,
      title: item.title,
      summary: item.description?.slice(0, 200) + '...' || '',
      content: item.content || item.description,
      publishedAt: item.pubDate || new Date().toISOString(),
      source: item.source_id || 'NewsData.io',
      category: category,
      url: item.link,
      imageUrl: item.image_url || null,
      location: country ? { country } : undefined,
    }));

    return items;
  } catch (error: any) {
    console.error('Error in fetchLatestNews (NewsData.io):', error.message || error);

    // Fallback : Supabase edge function
    try {
      const { data, error: edgeError } = await supabase.functions.invoke('get-news', {
        body: { category, country, query },
      });

      if (edgeError) {
        console.error('Error fetching news from edge function:', edgeError);
        throw new Error(edgeError.message);
      }

      const newsResponse = data as NewsApiResponse;

      if (newsResponse.error) {
        console.error('News API error:', newsResponse.error, newsResponse.details || '');
        throw new Error(newsResponse.error);
      }

      if (!newsResponse.items || !Array.isArray(newsResponse.items)) {
        console.warn('Invalid news data format:', newsResponse);
        if (newsResponse.message) {
          throw new Error(newsResponse.message);
        }
        throw new Error('Invalid news data received');
      }

      return newsResponse.items;
    } catch (fallbackError) {
      console.error('Both news sources failed:', fallbackError);
      // Dernier fallback : données statiques
      return [{
        id: 'fallback-1',
        title: 'Impossible de charger les actualités',
        summary: 'Veuillez réessayer ultérieurement.',
        content: 'Le service d\'actualités est temporairement indisponible.',
        publishedAt: new Date().toISOString(),
        source: 'LuvviX News',
        category: 'error',
        url: '#',
      }];
    }
  }
};

// Alias
export const getNews = fetchLatestNews;

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
