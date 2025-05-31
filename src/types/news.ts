
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  source: string;
  category: string;
  url: string;
  imageUrl?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

// Add NewsArticle as an alias for NewsItem for backward compatibility
export type NewsArticle = NewsItem;

export interface NewsSubscription {
  id: string;
  user_id: string;
  email: string;
  topics: string[];
  preferences: {
    frequency: 'daily' | 'weekly' | 'realtime';
    categories: string[];
    location: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface NewsApiResponse {
  items: NewsItem[];
  totalResults: number;
  status: string;
  error?: string;
  details?: string;
  message?: string;
}
