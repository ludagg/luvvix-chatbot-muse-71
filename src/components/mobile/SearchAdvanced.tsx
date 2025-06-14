
import React, { useState } from 'react';
import { Search, Filter, X, MapPin, Calendar, Users, Hash, AtSign } from 'lucide-react';

interface SearchFilters {
  content_type: 'all' | 'posts' | 'users' | 'hashtags';
  date_range: 'all' | 'today' | 'week' | 'month';
  location?: string;
  from_user?: string;
  has_media: boolean;
  verified_only: boolean;
}

interface SearchAdvancedProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClose: () => void;
}

const SearchAdvanced = ({ onSearch, onClose }: SearchAdvancedProps) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    content_type: 'all',
    date_range: 'all',
    has_media: false,
    verified_only: false
  });

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), filters);
    }
  };

  const clearFilters = () => {
    setFilters({
      content_type: 'all',
      date_range: 'all',
      has_media: false,
      verified_only: false
    });
  };

  const hasActiveFilters = filters.content_type !== 'all' || 
                          filters.date_range !== 'all' || 
                          filters.has_media || 
                          filters.verified_only || 
                          filters.location || 
                          filters.from_user;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher sur LuvviX..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-full transition-colors relative ${
            showFilters || hasActiveFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Filter className="w-5 h-5" />
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filtres de recherche</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-blue-500 text-sm font-medium"
              >
                Effacer tout
              </button>
            )}
          </div>

          {/* Content type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de contenu</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Tout', icon: Search },
                { key: 'posts', label: 'Posts', icon: Hash },
                { key: 'users', label: 'Utilisateurs', icon: Users },
                { key: 'hashtags', label: 'Hashtags', icon: Hash }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilters(prev => ({ ...prev, content_type: key as any }))}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.content_type === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Toutes' },
                { key: 'today', label: "Aujourd'hui" },
                { key: 'week', label: 'Cette semaine' },
                { key: 'month', label: 'Ce mois' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilters(prev => ({ ...prev, date_range: key as any }))}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.date_range === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Contient des médias</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, has_media: !prev.has_media }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  filters.has_media ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  filters.has_media ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Comptes vérifiés uniquement</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, verified_only: !prev.verified_only }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  filters.verified_only ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  filters.verified_only ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* Location and user filters */}
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Lieu"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.from_user || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, from_user: e.target.value }))}
                placeholder="De l'utilisateur"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search suggestions */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Recherches récentes</h4>
            <div className="space-y-2">
              {['#ReactJS', 'développement web', '@tech_guru', 'intelligence artificielle'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="flex items-center space-x-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{term}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Tendances</h4>
            <div className="space-y-2">
              {['#LuvviX', '#TechNews', '#AI2024', '#WebDev'].map((hashtag, index) => (
                <button
                  key={hashtag}
                  onClick={() => setQuery(hashtag)}
                  className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{hashtag}</span>
                  </div>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search button */}
      {query.trim() && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSearch}
            className="w-full bg-blue-500 text-white py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
          >
            Rechercher "{query}"
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAdvanced;
