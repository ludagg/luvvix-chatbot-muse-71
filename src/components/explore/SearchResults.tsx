
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Share2, BookOpen, Download, Eye, Calendar, User, Globe, Play, Image as ImageIcon, FileText, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
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
        return <Play className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'image':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'file':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'video':
        return 'from-red-500 to-pink-500';
      case 'image':
        return 'from-green-500 to-emerald-500';
      case 'file':
        return 'from-purple-500 to-violet-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <motion.div
          key={result.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="group p-6 hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 rounded-2xl overflow-hidden relative">
            {/* Indicateur de type avec gradient */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getTypeGradient(result.type)}`}></div>
            
            <div className="flex gap-6">
              {/* Thumbnail avec effet hover */}
              {result.thumbnail && (
                <motion.div 
                  className="flex-shrink-0 relative overflow-hidden rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-28 h-28 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  {result.type === 'video' && result.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {result.duration}
                    </div>
                  )}
                </motion.div>
              )}
              
              <div className="flex-1 min-w-0">
                {/* Header avec badges */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getTypeColor(result.type)} text-xs font-medium px-3 py-1 rounded-full border`}>
                      {getTypeIcon(result.type)}
                      <span className="ml-1 uppercase">{result.type}</span>
                    </Badge>
                    <span className="text-sm text-gray-500 font-medium">{result.source}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(result)}
                      className="text-gray-400 hover:text-blue-600 h-8 w-8 p-0 rounded-full hover:bg-blue-50"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      className="text-gray-400 hover:text-blue-600 h-8 w-8 p-0 rounded-full hover:bg-blue-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Titre avec effet hover */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer leading-tight">
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {result.title}
                  </a>
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed">
                  {result.snippet}
                </p>
                
                {/* Métadonnées */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDistanceToNow(result.timestamp, { 
                      addSuffix: true, 
                      locale: language === 'fr' ? fr : undefined
                    })}
                  </div>
                  
                  {result.author && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{result.author}</span>
                    </div>
                  )}
                  
                  {result.views && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{result.views.toLocaleString()} {t('common.views')}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions spéciales pour les fichiers */}
                {result.type === 'file' && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('common.download')}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
      
      {results.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">{t('explore.no.results')}</p>
        </motion.div>
      )}
    </div>
  );
};

export default SearchResults;
