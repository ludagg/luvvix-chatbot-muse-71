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

// === Gemini 1.5 Flash résumé via HTTPS direct ===
const summarizeWithGemini = async (text: string): Promise<string> => {
  const geminiApiKey = 'AIzaSyAwoG5ldTXX8tEwdN-Df3lzWWT4ZCfOQPE'; // ← Ta clé Gemini

  const endpoint =
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: `Résume clairement cet article en UNE phrase en anglais :\n\n${text}`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    return (
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      text.slice(0, 500) + '...'
    );
  } catch (err) {
    console.error('Erreur résumé Gemini :', err);
    return text.slice(0, 500) + '...';
  }
};

// === Récupération et résumé des dernières actualités ===
export const fetchLatestNews = async (
  category: string = 'all',
  country: string = 'fr',
  query: string = ''
): Promise<NewsItem[]> => {
  const newsApiKey = 'pub_e9e18325ddca4013bc0b60a1bdf8e008';

  try {
    // Construction des paramètres
    const params = new URLSearchParams({
      apikey: newsApiKey,
      language: 'fr',
      country,
    });
    if (category !== 'all') params.append('category', category);
    if (query) params.append('q', query);

    // Appel à NewsData.io /latest
    const response = await fetch(`https://newsdata.io/api/1/latest?apikey=pub_e9e18325ddca4013bc0b60a1bdf8e008&language=fr&country=fr`);
    if (!response.ok) {
      throw new Error(`NewsData.io status ${response.status}`);
    }
    const data = await response.json();

    if (!Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('Aucune actualité disponible');
    }

    // Résumer chaque article avec Gemini en parallèle
    const items: NewsItem[] = await Promise.all(
      data.results.map(async (item: any, idx: number) => {
        const baseText = item.description || item.content || item.title;
        const aiSummary = await summarizeWithGemini(baseText);

        return {
          id: item.link || `news-${idx}`,
          title: item.title,
          summary: aiSummary,
          content: item.content || item.description,
          publishedAt: item.pubDate || new Date().toISOString(),
          source: item.source_id || 'NewsData.io',
          category,
          url: item.link,
          imageUrl: item.image_url || null,
          location: country ? { country } : undefined,
        };
      })
    );

    return items;
  } catch (error: any) {
    console.error('Error in fetchLatestNews (primary):', error.message || error);

    // Fallback : Supabase Edge Function
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

      // Dernier recours : article d'erreur
      return [
        {
          id: 'fallback-1',
          title: 'Impossible de charger les actualités',
          summary: 'Veuillez réessayer ultérieurement.',
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