
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'web' | 'video' | 'image' | 'file' | 'discussion';
  thumbnail?: string;
  source: string;
  timestamp?: string;
  relevanceScore?: number;
}

// Interface pour SerpAPI
interface SerpResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  source?: string;
  thumbnail?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category, userId, includeFiles, fileContent } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const results: SearchResult[] = [];

    // 1. Recherche Web avec SerpAPI (gratuit avec limite)
    if (category === 'all' || category === 'web') {
      try {
        const webResults = await searchWeb(query);
        results.push(...webResults);
      } catch (error) {
        console.error('Web search error:', error);
      }
    }

    // 2. Recherche YouTube
    if (category === 'all' || category === 'videos') {
      try {
        const videoResults = await searchYouTube(query);
        results.push(...videoResults);
      } catch (error) {
        console.error('YouTube search error:', error);
      }
    }

    // 3. Recherche d'images via Unsplash API (gratuit)
    if (category === 'all' || category === 'images') {
      try {
        const imageResults = await searchImages(query);
        results.push(...imageResults);
      } catch (error) {
        console.error('Image search error:', error);
      }
    }

    // 4. Recherche dans les fichiers de l'utilisateur (si connecté)
    if ((category === 'all' || category === 'files') && userId) {
      try {
        const fileResults = await searchUserFiles(query, userId);
        results.push(...fileResults);
      } catch (error) {
        console.error('File search error:', error);
      }
    }

    // 5. Analyse du fichier uploadé
    if (includeFiles && fileContent) {
      try {
        const fileAnalysis = await analyzeUploadedFile(fileContent, query);
        results.push(...fileAnalysis);
      } catch (error) {
        console.error('File analysis error:', error);
      }
    }

    // 6. Recherche dans les discussions (Reddit via API gratuite)
    if (category === 'all' || category === 'discussions') {
      try {
        const discussionResults = await searchDiscussions(query);
        results.push(...discussionResults);
      } catch (error) {
        console.error('Discussion search error:', error);
      }
    }

    // Trier par pertinence
    results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: results.slice(0, 50), // Limiter à 50 résultats
        query,
        category,
        totalResults: results.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    // Utilisation de l'API de recherche gratuite de DuckDuckGo
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    // Résultats principaux
    if (data.Results) {
      data.Results.forEach((result: any, index: number) => {
        results.push({
          id: `web_${index}`,
          title: result.Text || 'Résultat sans titre',
          description: result.FirstURL || '',
          url: result.FirstURL,
          type: 'web',
          source: 'DuckDuckGo',
          relevanceScore: 10 - index
        });
      });
    }

    // Résultats connexes
    if (data.RelatedTopics) {
      data.RelatedTopics.slice(0, 10).forEach((result: any, index: number) => {
        if (result.Text && result.FirstURL) {
          results.push({
            id: `web_related_${index}`,
            title: result.Text.split(' - ')[0] || 'Résultat connexe',
            description: result.Text,
            url: result.FirstURL,
            type: 'web',
            source: 'DuckDuckGo',
            relevanceScore: 8 - index
          });
        }
      });
    }

    return results;
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

async function searchYouTube(query: string): Promise<SearchResult[]> {
  try {
    // Utilisation de l'API YouTube (nécessite une clé API)
    const API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!API_KEY) {
      console.log('YouTube API key not configured');
      return [];
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items.map((item: any, index: number) => ({
      id: `youtube_${item.id.videoId}`,
      title: item.snippet.title,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      type: 'video' as const,
      thumbnail: item.snippet.thumbnails.medium?.url,
      source: 'YouTube',
      timestamp: item.snippet.publishedAt,
      relevanceScore: 9 - index
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

async function searchImages(query: string): Promise<SearchResult[]> {
  try {
    // Utilisation de l'API Unsplash (gratuite avec limite)
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&client_id=your_unsplash_access_key`
    );
    
    if (!response.ok) {
      // Fallback vers Pixabay API (gratuite)
      return await searchPixabayImages(query);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any, index: number) => ({
      id: `unsplash_${item.id}`,
      title: item.description || item.alt_description || 'Image',
      description: item.description || item.alt_description || '',
      url: item.links.html,
      type: 'image' as const,
      thumbnail: item.urls.small,
      source: 'Unsplash',
      relevanceScore: 8 - index
    }));
  } catch (error) {
    console.error('Unsplash search error:', error);
    return [];
  }
}

async function searchPixabayImages(query: string): Promise<SearchResult[]> {
  try {
    // API Pixabay gratuite (sans clé pour les requêtes de base)
    const response = await fetch(
      `https://pixabay.com/api/?key=your_pixabay_key&q=${encodeURIComponent(query)}&image_type=photo&per_page=10`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    return data.hits.map((item: any, index: number) => ({
      id: `pixabay_${item.id}`,
      title: item.tags || 'Image',
      description: item.tags || '',
      url: item.pageURL,
      type: 'image' as const,
      thumbnail: item.webformatURL,
      source: 'Pixabay',
      relevanceScore: 7 - index
    }));
  } catch (error) {
    console.error('Pixabay search error:', error);
    return [];
  }
}

async function searchUserFiles(query: string, userId: string): Promise<SearchResult[]> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Recherche dans les fichiers cloud de l'utilisateur
    const { data: files, error } = await supabase
      .from('cloud_files')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    return files.map((file: any, index: number) => ({
      id: `file_${file.id}`,
      title: file.name,
      description: `Fichier ${file.type} - ${formatFileSize(file.size)}`,
      url: `/cloud/file/${file.id}`,
      type: 'file' as const,
      source: 'LuvviX Cloud',
      timestamp: file.created_at,
      relevanceScore: 6 - index
    }));
  } catch (error) {
    console.error('User files search error:', error);
    return [];
  }
}

async function analyzeUploadedFile(fileContent: string, query: string): Promise<SearchResult[]> {
  try {
    // Analyse simple du contenu du fichier
    const lines = fileContent.split('\n');
    const relevantLines = lines.filter(line => 
      line.toLowerCase().includes(query.toLowerCase())
    );

    if (relevantLines.length === 0) {
      return [];
    }

    return [{
      id: 'uploaded_file_analysis',
      title: `Analyse du fichier uploadé - ${relevantLines.length} correspondances`,
      description: relevantLines.slice(0, 3).join(' ... '),
      type: 'file' as const,
      source: 'Fichier uploadé',
      relevanceScore: 10
    }];
  } catch (error) {
    console.error('File analysis error:', error);
    return [];
  }
}

async function searchDiscussions(query: string): Promise<SearchResult[]> {
  try {
    // Recherche Reddit via API gratuite
    const response = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10&sort=relevance`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    return data.data.children.map((item: any, index: number) => ({
      id: `reddit_${item.data.id}`,
      title: item.data.title,
      description: item.data.selftext || item.data.title,
      url: `https://reddit.com${item.data.permalink}`,
      type: 'discussion' as const,
      source: `r/${item.data.subreddit}`,
      timestamp: new Date(item.data.created_utc * 1000).toISOString(),
      relevanceScore: 7 - index
    }));
  } catch (error) {
    console.error('Reddit search error:', error);
    return [];
  }
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
