
import React, { useState } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';

const MobileSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([
    'LuvviX Translate',
    'Météo Paris',
    'Assistant IA',
    'Actualités tech'
  ]);

  const trendingSearches = [
    'Intelligence artificielle',
    'LuvviX Weather',
    'Traduction automatique',
    'News France',
    'Cloud storage'
  ];

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const removeHistoryItem = (index: number) => {
    setSearchHistory(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 overflow-auto p-4 pb-20">
      {/* Barre de recherche */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher dans LuvviX OS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Recherches tendances */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Tendances</h3>
        </div>
        <div className="space-y-2">
          {trendingSearches.map((search, index) => (
            <button
              key={index}
              className="w-full text-left p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-gray-900">{search}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Historique des recherches */}
      {searchHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Historique</h3>
            </div>
            <button
              onClick={clearHistory}
              className="text-blue-500 text-sm font-medium"
            >
              Effacer tout
            </button>
          </div>
          <div className="space-y-2">
            {searchHistory.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{search}</span>
                </div>
                <button
                  onClick={() => removeHistoryItem(index)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSearch;
