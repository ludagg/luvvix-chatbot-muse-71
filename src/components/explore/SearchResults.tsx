
import React from 'react';
import { ExternalLink, Play, Image, FileText, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

const SearchResults = ({ results, query }: SearchResultsProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700';
      case 'image': return 'bg-green-100 text-green-700';
      case 'file': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Aucun résultat trouvé
        </h3>
        <p className="text-gray-500">
          Essayez de modifier votre recherche ou utilisez d'autres mots-clés
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {results.length} résultat{results.length > 1 ? 's' : ''} pour "{query}"
      </p>
      
      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {result.thumbnail && (
                <div className="flex-shrink-0">
                  <img 
                    src={result.thumbnail} 
                    alt={result.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={getTypeColor(result.type)}>
                    {getIcon(result.type)}
                    <span className="ml-1 capitalize">{result.type}</span>
                  </Badge>
                  <span className="text-xs text-gray-500">{result.source}</span>
                </div>
                
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {result.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {result.snippet}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {result.timestamp.toLocaleDateString()}
                  </span>
                  
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir plus
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
