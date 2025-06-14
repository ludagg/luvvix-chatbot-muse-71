
import React from 'react';
import { History, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SearchHistoryProps {
  history: string[];
  onSelectSearch: (search: string) => void;
  onClearHistory: () => void;
}

const SearchHistory = ({ history, onSelectSearch, onClearHistory }: SearchHistoryProps) => {
  if (history.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          <History className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Aucun historique</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-4 h-4" />
          Historique
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {history.slice(0, 5).map((search, index) => (
          <button
            key={index}
            onClick={() => onSelectSearch(search)}
            className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            {search}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default SearchHistory;
