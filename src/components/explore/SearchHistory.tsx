import React from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/useLanguage';

interface SearchHistoryProps {
  history: string[];
  onSelectSearch: (search: string) => void;
  onClearHistory: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  history, 
  onSelectSearch, 
  onClearHistory 
}) => {
  const { t, language } = useLanguage();
  
  const trendingSearches = language === 'fr' ? [
    "Intelligence artificielle 2024",
    "Développement web moderne", 
    "Économie circulaire",
    "Métavers actualités",
    "Blockchain applications"
  ] : [
    "Artificial Intelligence 2024",
    "Modern web development",
    "Circular economy", 
    "Metaverse news",
    "Blockchain applications"
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{t.explore.history.title}</h3>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-gray-500 hover:text-red-600"
              title={t.explore.history.clear}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-64">
        <div className="p-4 space-y-3">
          {history.length > 0 ? (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {t.explore.history.recent}
                </h4>
                {history.map((search, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelectSearch(search)}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700 truncate"
                  >
                    {search}
                  </motion.button>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  {t.explore.history.trends}
                </h4>
                <div className="space-y-2">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectSearch(search)}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50 transition-colors text-sm text-blue-600 truncate"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <History className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {t.explore.noSearchHistory}
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">{t.explore.popularSuggestions}</h4>
                {trendingSearches.slice(0, 3).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectSearch(search)}
                    className="w-full text-left p-2 rounded-lg hover:bg-blue-50 transition-colors text-sm text-blue-600 truncate"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default SearchHistory;
