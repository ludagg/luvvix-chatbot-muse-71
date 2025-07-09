import { supabase } from '@/integrations/supabase/client';
import { NewsApiResponse, NewsItem } from '@/types/news';

// Fonction pour résumer un texte via Gemini 1.5 Flash (HTTPS direct)
const summarizeWithGemini = async (text: string): Promise<string> => {
  const geminiApiKey = 'AIzaSyAwoG5ldTXX8tEwdN-Df3lzWWT4ZCfOQPE'; // ← Mets ta clé API Gemini ici

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: `Résume clairement cet article en UNE phrase :\n\n${text}`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text.slice(0, 200) + '...';
  } catch (error) {
    console.error('Erreur résumé Gemini :', error);
    return text.slice(0, 200) + '...';
  }
};

// Fonction principale de récupération et résumé des actus
export const fetchLatestNews = async (
  category: string = 'all',
  country: string = 'fr',
  query: string = ''
): Promise<NewsItem[]> => {
  const newsApiKey = 'pub_e9e18325ddca4013bc0b60a1bdf8e008';

  try {
    const params = new URLSearchParams({
      apikey: newsApiKey,
      language: 'fr',
      country,
    });
    if (category !== 'all') params.append('category', category);
    if (query) params.append('q', query);

    const response = await fetch(`https://newsdata.io/api/1/latest?apikey=pub_e9e18325ddca4013bc0b60a1bdf8e008&language=fr`);
    const data = await response.json();

    if (!data?.results || data.results.length === 0) {
      throw new Error('Aucune actualité disponible');
    }

    // Résumer chaque actualité avec Gemini
    const items: NewsItem[] = await Promise.all(
      data.results.map(async (item: any, index: number) => {
        const baseText = item.description || item.content || item.title;
        const aiSummary = await summarizeWithGemini(baseText);

        return {
          id: item.link || `news-${index}`,
          title: item.title,
          summary: aiSummary,
          content: item.content || item.description,
          publishedAt: item.pubDate || new Date().toISOString(),
          source: item.source_id || 'NewsData.io',
          category: category,
          url: item.link,
          imageUrl: item.image_url || null,
          location: country ? { country } : undefined,
        };
      })
    );

    return items;
  } catch (error: any) {
    console.error('Error in fetchLatestNews (NewsData.io):', error.message || error);

    // Fallback via Supabase Edge Function
    try {
      const { data, error: edgeError } = await supabase.functions.invoke('get-news', {
        body: { category, country, query },
      });

      if (edgeError) {
        console.error('Error fetching news from edge function:', edgeError);
        throw new Error(edgeError.message);
      }

      const newsResponse = data as NewsApiResponse;

      if (!newsResponse.items || !Array.isArray(newsResponse.items)) {
        throw new Error('Invalid news data received');
      }

      return newsResponse.items;
    } catch (fallbackError) {
      console.error('Both sources failed:', fallbackError);

      // Dernier recours : article statique
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

// Alias pour compatibilité
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
