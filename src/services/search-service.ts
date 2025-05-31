
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
  position?: number;
}

const SERPAPI_KEY = '00cdc35836508e3559df7a87a14bd3401fd26e0dd6a4afc6b1fabf054d026db6';

export const searchService = {
  async multiSearch(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      // Recherche web via SerpAPI
      const webResults = await this.searchWeb(query);
      results.push(...webResults);
      
      // Recherche vidéos YouTube via SerpAPI
      const videoResults = await this.searchYouTube(query);
      results.push(...videoResults);
      
      // Recherche d'images via SerpAPI
      const imageResults = await this.searchImages(query);
      results.push(...imageResults);
      
    } catch (error) {
      console.error('Erreur recherche multimodale:', error);
    }
    
    return results.sort((a, b) => (a.position || 0) - (b.position || 0));
  },

  async searchWeb(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=10`);
      const data = await response.json();
      
      const results: SearchResult[] = [];
      
      if (data.organic_results) {
        data.organic_results.forEach((result: any, index: number) => {
          results.push({
            id: `web-${Date.now()}-${index}`,
            type: 'web',
            title: result.title || 'Résultat',
            snippet: result.snippet || 'Aucune description disponible',
            url: result.link,
            source: result.displayed_link || 'Web',
            timestamp: new Date(),
            position: result.position || index + 1,
            thumbnail: result.thumbnail
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('Erreur recherche web SerpAPI:', error);
      return [];
    }
  },

  async searchYouTube(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`);
      const data = await response.json();
      
      const results: SearchResult[] = [];
      
      if (data.video_results) {
        data.video_results.slice(0, 5).forEach((video: any, index: number) => {
          results.push({
            id: `video-${Date.now()}-${index}`,
            type: 'video',
            title: video.title || 'Vidéo',
            snippet: video.description || 'Aucune description',
            url: video.link,
            thumbnail: video.thumbnail?.static,
            source: 'YouTube',
            timestamp: new Date(video.published_date || Date.now()),
            author: video.channel?.name,
            views: video.views,
            duration: video.length,
            position: index + 1
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('Erreur recherche YouTube SerpAPI:', error);
      return [];
    }
  },

  async searchImages(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google&tbm=isch&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=6`);
      const data = await response.json();
      
      const results: SearchResult[] = [];
      
      if (data.images_results) {
        data.images_results.slice(0, 6).forEach((image: any, index: number) => {
          results.push({
            id: `image-${Date.now()}-${index}`,
            type: 'image',
            title: image.title || `Image ${index + 1}`,
            snippet: image.snippet || 'Image liée à votre recherche',
            url: image.original,
            thumbnail: image.thumbnail,
            source: image.source || 'Google Images',
            timestamp: new Date(),
            position: index + 1
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('Erreur recherche images SerpAPI:', error);
      return [];
    }
  }
};
