
import { supabase } from '@/integrations/supabase/client';
import { NewsApiResponse, NewsItem, NewsSubscription } from '@/types/news';
import { getCurrentUser } from '@/services/auth-utils';

// Function to get user's location for personalized news
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

// Function to fetch latest news
export const fetchLatestNews = async (
  category: string = 'all',
  country: string = '',
  query: string = ''
): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-news', {
      body: { category, country, query },
    });

    if (error) {
      console.error('Error fetching news:', error);
      throw new Error(error.message);
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
  } catch (error) {
    console.error('Error in fetchLatestNews:', error.message || error);
    throw error;
  }
};

// Function to subscribe user to news topics
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

// Function to get current user's subscription
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

// Function to unsubscribe from newsletter
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
