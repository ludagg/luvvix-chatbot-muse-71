
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bot, History, Filter, Share2, Plus, FileText, Video, Image, Globe, Brain, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import SearchResults from '@/components/explore/SearchResults';
import AIAssistant from '@/components/explore/AIAssistant';
import SearchHistory from '@/components/explore/SearchHistory';
import FileUploader from '@/components/explore/FileUploader';
import { searchService } from '@/services/search-service';
import { aiService } from '@/services/ai-service';
import { toast } from 'sonner';

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

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedResults?: string[];
}

const ExplorePage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Charger l'historique de recherche
    const savedHistory = localStorage.getItem('luvvix-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    setShowHistory(false);

    try {
      // Ajouter à l'historique
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('luvvix-search-history', JSON.stringify(newHistory));

      // Recherche multimodale
      const searchResults = await searchService.multiSearch(searchQuery);
      setResults(searchResults);

      // Demander un résumé IA automatiquement
      setIsAiThinking(true);
      const aiSummary = await aiService.generateSearchSummary(searchQuery, searchResults);
      
      setAiMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          type: 'assistant',
          content: aiSummary,
          timestamp: new Date(),
          relatedResults: searchResults.slice(0, 3).map(r => r.id)
        }
      ]);
      
      toast.success('Recherche terminée et analysée par l\'IA');
    } catch (error) {
      console.error('Erreur de recherche:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
      setIsAiThinking(false);
    }
  };

  const generateSuggestions = async (inputValue: string) => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await aiService.generateSearchSuggestions(inputValue);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Erreur suggestions:', error);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setShowHistory(value.length === 0);
    
    // Debounce pour les suggestions
    const timer = setTimeout(() => {
      generateSuggestions(value);
    }, 300);

    return () => clearTimeout(timer);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const filteredResults = results.filter(result => 
    activeTab === 'all' || result.type === activeTab
  );

  const resultCounts = {
    all: results.length,
    web: results.filter(r => r.type === 'web').length,
    video: results.filter(r => r.type === 'video').length,
    image: results.filter(r => r.type === 'image').length,
    file: results.filter(r => r.type === 'file').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Header avec navigation */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LuvviX Explore
                </h1>
                <p className="text-sm text-gray-500">Recherche IA Multimodale</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Brain className="w-3 h-3 mr-1" />
                IA Connectée
              </Badge>
              {user && (
                <Badge variant="outline">
                  {user.email?.split('@')[0]}
                </Badge>
              )}
            </div>
          </div>

          {/* Barre de recherche principale */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Rechercher des sites, vidéos, fichiers, ou poser une question..."
                className="pl-12 pr-24 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 shadow-lg"
                disabled={isSearching}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <FileUploader onFileAnalyzed={(content) => {
                  setQuery(`Analyser ce fichier: ${content.substring(0, 100)}...`);
                }} />
                <Button 
                  onClick={() => handleSearch()}
                  disabled={isSearching || !query.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                >
                  {isSearching ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Suggestions et historique */}
            <AnimatePresence>
              {(showSuggestions && suggestions.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-3 py-2">Suggestions IA</p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {showHistory && searchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-3 py-2">Recherches récentes</p>
                    {searchHistory.slice(0, 5).map((historyItem, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(historyItem)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                      >
                        <History className="w-4 h-4 text-gray-400" />
                        <span>{historyItem}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Résultats de recherche */}
          <div className="lg:col-span-3">
            {results.length > 0 && (
              <div className="mb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5 bg-white rounded-xl border">
                    <TabsTrigger value="all" className="data-[state=active]:bg-blue-100">
                      Tout ({resultCounts.all})
                    </TabsTrigger>
                    <TabsTrigger value="web" className="data-[state=active]:bg-blue-100">
                      <Globe className="w-4 h-4 mr-1" />
                      Web ({resultCounts.web})
                    </TabsTrigger>
                    <TabsTrigger value="video" className="data-[state=active]:bg-blue-100">
                      <Video className="w-4 h-4 mr-1" />
                      Vidéos ({resultCounts.video})
                    </TabsTrigger>
                    <TabsTrigger value="image" className="data-[state=active]:bg-blue-100">
                      <Image className="w-4 h-4 mr-1" />
                      Images ({resultCounts.image})
                    </TabsTrigger>
                    <TabsTrigger value="file" className="data-[state=active]:bg-blue-100">
                      <FileText className="w-4 h-4 mr-1" />
                      Fichiers ({resultCounts.file})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-6">
                    <SearchResults results={filteredResults} query={query} />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {results.length === 0 && !isSearching && (
              <div className="text-center py-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center"
                >
                  <Search className="w-16 h-16 text-blue-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  Commencez votre exploration
                </h2>
                <p className="text-gray-500 mb-6">
                  Recherchez du contenu web, des vidéos, des images ou posez n'importe quelle question
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Intelligence artificielle",
                    "Actualités technologie",
                    "Recettes cuisine",
                    "Tutoriels programmation"
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setQuery(example);
                        handleSearch(example);
                      }}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assistant IA et outils */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">
              <AIAssistant 
                messages={aiMessages}
                isThinking={isAiThinking}
                onMessage={(message) => {
                  setAiMessages(prev => [...prev, {
                    id: `user-${Date.now()}`,
                    type: 'user',
                    content: message,
                    timestamp: new Date()
                  }]);
                  // Traiter le message avec l'IA
                  aiService.processUserMessage(message, results).then(response => {
                    setAiMessages(prev => [...prev, {
                      id: `ai-${Date.now()}`,
                      type: 'assistant',
                      content: response,
                      timestamp: new Date()
                    }]);
                  });
                }}
              />
              
              <SearchHistory 
                history={searchHistory}
                onSelectSearch={(search) => {
                  setQuery(search);
                  handleSearch(search);
                }}
                onClearHistory={() => {
                  setSearchHistory([]);
                  localStorage.removeItem('luvvix-search-history');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
