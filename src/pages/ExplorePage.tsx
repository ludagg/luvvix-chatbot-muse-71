
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bot, History, Filter, Share2, Plus, FileText, Video, Image, Globe, Brain, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
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
  const { t } = useLanguage();
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
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('luvvix-search-history', JSON.stringify(newHistory));

      const searchResults = await searchService.multiSearch(searchQuery);
      setResults(searchResults);

      if (searchResults.length > 0) {
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
        
        toast.success(t('explore.search.complete'));
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      toast.error(t('common.error'));
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

  const exampleSearches = [
    t('explore.examples.ai'),
    t('explore.examples.tech'),
    t('explore.examples.cooking'),
    t('explore.examples.programming')
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header élégant */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('explore.title')}
                </h1>
                <p className="text-gray-500 text-sm font-medium">{t('explore.subtitle')}</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-3 py-1">
                <Brain className="w-3 h-3 mr-1" />
                {t('explore.ai.connected')}
              </Badge>
              {user && (
                <Badge variant="outline" className="bg-white/80 border-gray-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {user.email?.split('@')[0]}
                </Badge>
              )}
            </div>
          </div>

          {/* Barre de recherche moderne */}
          <div className="relative max-w-4xl mx-auto">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('explore.search.placeholder')}
                className="pl-14 pr-32 py-4 text-lg rounded-2xl border-2 border-gray-200/80 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 focus:shadow-xl"
                disabled={isSearching}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <FileUploader onFileAnalyzed={(content) => {
                  setQuery(`${t('explore.file.upload')}: ${content.substring(0, 100)}...`);
                }} />
                <Button 
                  onClick={() => handleSearch()}
                  disabled={isSearching || !query.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSearching ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      {t('common.search')}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Suggestions intelligentes */}
            <AnimatePresence>
              {(showSuggestions && suggestions.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 z-50 overflow-hidden"
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500">
                      <Sparkles className="w-3 h-3" />
                      {t('explore.suggestions')}
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl flex items-center gap-3 transition-all duration-200 group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="flex-1 font-medium">{suggestion}</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {showHistory && searchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 z-50 overflow-hidden"
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500">
                      <History className="w-3 h-3" />
                      {t('explore.history')}
                    </div>
                    {searchHistory.slice(0, 5).map((historyItem, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSuggestionClick(historyItem)}
                        className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-all duration-200 group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <History className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        <span className="flex-1">{historyItem}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Résultats de recherche */}
          <div className="lg:col-span-3">
            {results.length > 0 && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-1 shadow-lg">
                    <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl font-medium">
                      {t('explore.results.all')} ({resultCounts.all})
                    </TabsTrigger>
                    <TabsTrigger value="web" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl font-medium">
                      <Globe className="w-4 h-4 mr-1" />
                      {t('explore.results.web')} ({resultCounts.web})
                    </TabsTrigger>
                    <TabsTrigger value="video" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl font-medium">
                      <Video className="w-4 h-4 mr-1" />
                      {t('explore.results.videos')} ({resultCounts.video})
                    </TabsTrigger>
                    <TabsTrigger value="image" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl font-medium">
                      <Image className="w-4 h-4 mr-1" />
                      {t('explore.results.images')} ({resultCounts.image})
                    </TabsTrigger>
                    <TabsTrigger value="file" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl font-medium">
                      <FileText className="w-4 h-4 mr-1" />
                      {t('explore.results.files')} ({resultCounts.file})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-8">
                    <SearchResults results={filteredResults} query={query} />
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}

            {results.length === 0 && !isSearching && (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Search className="w-16 h-16 text-blue-600" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  {t('explore.start.title')}
                </h2>
                <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
                  {t('explore.start.subtitle')}
                </p>
                <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                  {exampleSearches.map((example) => (
                    <motion.button
                      key={example}
                      onClick={() => {
                        setQuery(example);
                        handleSearch(example);
                      }}
                      className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {example}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Assistant IA et outils */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
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
