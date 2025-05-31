
import React from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Clock, Search } from 'lucide-react';
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
  const { t } = useLanguage();

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('explore.history')}</h3>
              <p className="text-gray-200 text-sm">{history.length} recherches</p>
            </div>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Liste des recherches */}
      <div className="h-64">
        <ScrollArea className="h-full p-4">
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">{t('explore.history.empty')}</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {history.map((search, index) => (
                <motion.button
                  key={index}
                  onClick={() => onSelectSearch(search)}
                  className="w-full text-left p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                      <Search className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {search}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
};

export default SearchHistory;
