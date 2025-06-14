
interface SearchResult {
  id: string;
  type: 'web' | 'video' | 'image' | 'file';
  title: string;
  snippet: string;
  url: string;
  thumbnail?: string;
  source: string;
  timestamp: Date;
}

class SearchService {
  async multiSearch(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Simulation de résultats de recherche
    const mockResults = [
      {
        id: '1',
        type: 'web' as const,
        title: `Résultats pour "${query}"`,
        snippet: `Voici les informations trouvées concernant ${query}. Cette recherche inclut des données récentes et pertinentes.`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        source: 'Web',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'video' as const,
        title: `Vidéo: ${query}`,
        snippet: `Une vidéo explicative sur ${query} avec des exemples pratiques.`,
        url: `https://youtube.com/watch?v=example`,
        thumbnail: 'https://img.youtube.com/vi/example/mqdefault.jpg',
        source: 'YouTube',
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'image' as const,
        title: `Images de ${query}`,
        snippet: `Collection d'images liées à ${query}`,
        url: `https://images.example.com/${query}`,
        thumbnail: 'https://via.placeholder.com/300x200',
        source: 'Images',
        timestamp: new Date()
      }
    ];

    return mockResults;
  }

  async searchFiles(query: string): Promise<SearchResult[]> {
    // Recherche dans les fichiers locaux/cloud
    return [];
  }
}

export const searchService = new SearchService();
