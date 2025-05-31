
interface SearchResult {
  id: string;
  type: 'web' | 'video' | 'image' | 'file';
  title: string;
  snippet: string;
  url: string;
  thumbnail?: string;
  source: string;
  timestamp: Date;
  author?: string;
  views?: number;
  duration?: string;
}

const SERPAPI_KEY = '00cdc35836508e3559df7a87a14bd3401fd26e0dd6a4afc6b1fabf054d026db6';

export const searchService = {
  async multiSearch(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      // Recherche web via SerpAPI
      const webResults = await this.searchWeb(query);
      results.push(...webResults);
    } catch (error) {
      console.error('Erreur recherche web:', error);
    }
    
    try {
      // Recherche YouTube via SerpAPI
      const videoResults = await this.searchYouTube(query);
      results.push(...videoResults);
    } catch (error) {
      console.error('Erreur recherche YouTube:', error);
    }
    
    try {
      // Recherche d'images via SerpAPI
      const imageResults = await this.searchImages(query);
      results.push(...imageResults);
    } catch (error) {
      console.error('Erreur recherche images:', error);
    }
    
    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  async searchWeb(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=10`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }
      
      const data = await response.json();
      const results: SearchResult[] = [];
      
      if (data.organic_results) {
        data.organic_results.forEach((result: any, index: number) => {
          results.push({
            id: `web-${Date.now()}-${index}`,
            type: 'web',
            title: result.title || 'Sans titre',
            snippet: result.snippet || result.displayed_link || '',
            url: result.link || '#',
            source: result.displayed_link ? new URL(result.displayed_link).hostname : 'Web',
            timestamp: new Date(),
            thumbnail: result.thumbnail
          });
        });
      }
      
      // Ajouter les featured snippets
      if (data.answer_box) {
        results.unshift({
          id: `featured-${Date.now()}`,
          type: 'web',
          title: data.answer_box.title || query,
          snippet: data.answer_box.snippet || data.answer_box.answer || '',
          url: data.answer_box.link || '#',
          source: data.answer_box.displayed_link ? new URL(data.answer_box.displayed_link).hostname : 'Featured',
          timestamp: new Date(),
          thumbnail: data.answer_box.thumbnail
        });
      }
      
      return results.slice(0, 8);
    } catch (error) {
      console.error('Erreur SerpAPI Web:', error);
      throw error;
    }
  },

  async searchYouTube(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI YouTube error: ${response.status}`);
      }
      
      const data = await response.json();
      const results: SearchResult[] = [];
      
      if (data.video_results) {
        data.video_results.slice(0, 5).forEach((video: any, index: number) => {
          results.push({
            id: `video-${Date.now()}-${index}`,
            type: 'video',
            title: video.title || 'Vidéo sans titre',
            snippet: video.description || `Vidéo YouTube de ${video.channel?.name || 'Auteur inconnu'}`,
            url: video.link || `https://youtube.com/watch?v=${video.video_id}`,
            thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`,
            source: 'YouTube',
            timestamp: new Date(),
            author: video.channel?.name || 'Auteur inconnu',
            views: video.views ? parseInt(video.views.replace(/[^\d]/g, '')) : undefined,
            duration: video.length || undefined
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('Erreur SerpAPI YouTube:', error);
      return [];
    }
  },

  async searchImages(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google&tbm=isch&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=6`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI Images error: ${response.status}`);
      }
      
      const data = await response.json();
      const results: SearchResult[] = [];
      
      if (data.images_results) {
        data.images_results.slice(0, 6).forEach((image: any, index: number) => {
          results.push({
            id: `image-${Date.now()}-${index}`,
            type: 'image',
            title: image.title || `Image: ${query} ${index + 1}`,
            snippet: image.snippet || `Image liée à ${query}`,
            url: image.original || image.link || '#',
            thumbnail: image.thumbnail || image.original,
            source: image.source || 'Web',
            timestamp: new Date(),
            author: image.source
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('Erreur SerpAPI Images:', error);
      return [];
    }
  },

  async searchNews(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google&tbm=nws&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=5`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI News error: ${response.status}`);
      }
      
      const data = await response.json();
      const results: SearchResult[] = [];
      
      if (data.news_results) {
        data.news_results.forEach((news: any, index: number) => {
          results.push({
            id: `news-${Date.now()}-${index}`,
            type: 'web',
            title: news.title || 'Article sans titre',
            snippet: news.snippet || news.snippet || '',
            url: news.link || '#',
            source: news.source || 'Actualités',
            timestamp: news.date ? new Date(news.date) : new Date(),
            thumbnail: news.thumbnail,
            author: news.source
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('Erreur SerpAPI News:', error);
      return [];
    }
  }
};
