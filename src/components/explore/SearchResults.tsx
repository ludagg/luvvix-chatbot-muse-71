import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Share2, BookOpen, Download, Eye, Calendar, User, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';

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

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, query }) => {
  const { t, language } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  const handleShare = (result: SearchResult) => {
    if (navigator.share) {
      navigator.share({
        title: result.title,
        text: result.snippet,
        url: result.url,
      });
    } else {
      navigator.clipboard.writeText(result.url);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      case 'file':
        return '📄';
      default:
        return '🌐';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-700';
      case 'image':
        return 'bg-green-100 text-green-700';
      case 'file':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t.common.loading}
        </h3>
        <p className="text-gray-500">
          {language === 'fr' 
            ? `Recherche en cours pour "${query}"...`
            : `Searching for "${query}"...`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <motion.div
          key={result.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex gap-4">
              {result.thumbnail && (
                <div className="flex-shrink-0">
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-24 h-24 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${getTypeColor(result.type)} text-xs`}>
                      {getTypeIcon(result.type)} {result.type.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">{result.source}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(result)}
                      className="text-gray-400 hover:text-gray-600"
                      title={t.explore.results.share}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      className="text-gray-400 hover:text-gray-600"
                      title={t.explore.results.open}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {result.snippet}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(result.timestamp, { 
                      addSuffix: true, 
                      locale 
                    })}
                  </div>
                  
                  {result.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {result.author}
                    </div>
                  )}
                  
                  {result.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {result.views.toLocaleString()} {t.explore.results.views}
                    </div>
                  )}
                  
                  {result.duration && (
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      {result.duration}
                    </div>
                  )}
                </div>
                
                {result.type === 'file' && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.explore.results.download}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SearchResults;
