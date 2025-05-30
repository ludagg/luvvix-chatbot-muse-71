
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Upload, 
  Globe, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  MessageCircle,
  Brain,
  Share2,
  Translate,
  FileSignature,
  Bot,
  Users,
  Clock,
  Sparkles,
  Mic,
  Camera,
  Link as LinkIcon,
  Filter,
  Download,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'web' | 'video' | 'image' | 'file' | 'discussion';
  thumbnail?: string;
  source: string;
  timestamp?: string;
  relevanceScore?: number;
}

interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  results_count: number;
  category: string;
}

const ExplorePage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Suggestions prédéfinies basées sur la langue
  const predefinedSuggestions = {
    fr: [
      "Comment fonctionne l'intelligence artificielle ?",
      "Dernières tendances en technologie",
      "Recettes de cuisine faciles",
      "Tutoriel programmation web",
      "Histoire de l'art moderne",
      "Conseils pour bien dormir",
      "Exercices de fitness à domicile",
      "Apprentissage des langues"
    ],
    en: [
      "How does artificial intelligence work?",
      "Latest technology trends",
      "Easy cooking recipes",
      "Web programming tutorial",
      "Modern art history",
      "Sleep better tips",
      "Home fitness exercises",
      "Language learning"
    ],
    es: [
      "¿Cómo funciona la inteligencia artificial?",
      "Últimas tendencias tecnológicas",
      "Recetas de cocina fáciles",
      "Tutorial de programación web",
      "Historia del arte moderno",
      "Consejos para dormir mejor",
      "Ejercicios de fitness en casa",
      "Aprendizaje de idiomas"
    ]
  };

  useEffect(() => {
    document.title = `${t('explore.title')} - LuvviX`;
    loadSearchHistory();
    loadSuggestions();
  }, [t]);

  const loadSearchHistory = async () => {
    if (!user) return;
    
    try {
      // Ici on simule l'historique de recherche
      // Dans une vraie implémentation, ceci viendrait de la base de données
      const mockHistory: SearchHistory[] = [
        {
          id: '1',
          query: 'Intelligence artificielle',
          timestamp: '2024-01-15T10:30:00Z',
          results_count: 156,
          category: 'web'
        },
        {
          id: '2',
          query: 'Tutoriel React',
          timestamp: '2024-01-14T15:20:00Z',
          results_count: 89,
          category: 'web'
        }
      ];
      setSearchHistory(mockHistory);
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const loadSuggestions = () => {
    const { language } = useLanguage();
    const langSuggestions = predefinedSuggestions[language as keyof typeof predefinedSuggestions] || predefinedSuggestions.en;
    setSuggestions(langSuggestions);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error(t('common.error'));
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setAiSummary('');

    try {
      // Appel à notre edge function de recherche
      const { data, error } = await supabase.functions.invoke('luvvix-search', {
        body: {
          query: searchQuery,
          category: selectedCategory,
          userId: user?.id,
          includeFiles: uploadedFile ? true : false,
          fileContent: uploadedFile ? await uploadedFile.text() : null
        }
      });

      if (error) throw error;

      if (data.success) {
        setSearchResults(data.results);
        
        // Sauvegarder dans l'historique si utilisateur connecté
        if (user) {
          await saveSearchToHistory(searchQuery, data.results.length, selectedCategory);
        }
        
        // Générer un résumé IA automatiquement
        generateAISummary(data.results);
        
        toast.success(`${data.results.length} ${t('explore.results_found')}`);
      } else {
        toast.error(data.error || t('common.error'));
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSearching(false);
    }
  };

  const generateAISummary = async (results: SearchResult[]) => {
    if (results.length === 0) return;
    
    setIsGeneratingSummary(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-generate-summary', {
        body: {
          query: searchQuery,
          results: results.slice(0, 5), // Première 5 résultats pour le résumé
          language: useLanguage().language
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error('Summary generation error:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const saveSearchToHistory = async (query: string, resultCount: number, category: string) => {
    const newHistoryItem: SearchHistory = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString(),
      results_count: resultCount,
      category
    };
    
    setSearchHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Garde les 10 derniers
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`${t('common.upload')}: ${file.name}`);
    }
  };

  const handleVoiceSearch = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = useLanguage().language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      toast.info('Parlez maintenant...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success('Recherche vocale terminée');
    };

    recognition.onerror = (event) => {
      toast.error('Erreur de reconnaissance vocale: ' + event.error);
    };

    recognition.start();
  };

  const shareResult = async (result: SearchResult) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title,
          text: result.description,
          url: result.url
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard(result.url || result.title);
      }
    } else {
      copyToClipboard(result.url || result.title);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copy'));
  };

  const createMindMapFromResult = async (result: SearchResult) => {
    // Intégration avec LuvviX MindMap
    window.open(`/mindmap?topic=${encodeURIComponent(result.title)}`, '_blank');
  };

  const translateResult = async (result: SearchResult) => {
    // Intégration avec LuvviX Translate
    window.open(`/translate?text=${encodeURIComponent(result.description)}`, '_blank');
  };

  const createFormFromResult = async (result: SearchResult) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un formulaire');
      return;
    }
    
    // Intégration avec LuvviX Forms
    window.open(`/forms/create?topic=${encodeURIComponent(result.title)}`, '_blank');
  };

  const createAIAgent = async (result: SearchResult) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un agent IA');
      return;
    }
    
    // Intégration avec AI Studio
    window.open(`/ai-studio/create?expertise=${encodeURIComponent(result.title)}`, '_blank');
  };

  const publishToCenter = async (result: SearchResult) => {
    if (!user) {
      toast.error('Vous devez être connecté pour publier');
      return;
    }
    
    // Intégration avec LuvviX Center
    window.open(`/center?share=${encodeURIComponent(JSON.stringify(result))}`, '_blank');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web': return Globe;
      case 'videos': return Video;
      case 'images': return ImageIcon;
      case 'files': return FileText;
      case 'discussions': return MessageCircle;
      default: return Search;
    }
  };

  const categories = [
    { id: 'all', name: t('news.categories.all'), icon: Search },
    { id: 'web', name: t('explore.categories.web'), icon: Globe },
    { id: 'videos', name: t('explore.categories.videos'), icon: Video },
    { id: 'images', name: t('explore.categories.images'), icon: ImageIcon },
    { id: 'files', name: t('explore.categories.files'), icon: FileText },
    { id: 'discussions', name: t('explore.categories.discussions'), icon: MessageCircle },
  ];

  return (
    <>
      <Helmet>
        <title>{t('explore.title')} - {t('explore.subtitle')}</title>
        <meta name="description" content={t('explore.description')} />
        <meta name="keywords" content="search, AI, multimodal, web, files, videos, images, LuvviX" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <Navbar />
        
        <main className="flex-1 pt-20">
          {/* Hero Section */}
          <section className="relative py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {t('explore.title')}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                  {t('explore.description')}
                </p>
                
                {/* Barre de recherche principale */}
                <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      {/* Recherche principale */}
                      <div className="relative">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder={t('explore.search_placeholder')}
                              className="pl-12 pr-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleVoiceSearch}
                                className="h-10 w-10 p-0 rounded-full hover:bg-blue-100"
                              >
                                <Mic className="h-4 w-4" />
                              </Button>
                              <label className="cursor-pointer">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-10 w-10 p-0 rounded-full hover:bg-blue-100"
                                  asChild
                                >
                                  <span>
                                    <Camera className="h-4 w-4" />
                                  </span>
                                </Button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                />
                              </label>
                            </div>
                          </div>
                          <Button
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold"
                          >
                            {isSearching ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            ) : (
                              t('explore.search_btn')
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Catégories */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <Button
                              key={category.id}
                              variant={selectedCategory === category.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedCategory(category.id)}
                              className={`rounded-full ${
                                selectedCategory === category.id
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                  : 'hover:bg-blue-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {category.name}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Upload de fichier */}
                      <div className="flex justify-center">
                        <label className="cursor-pointer">
                          <Button variant="outline" className="rounded-full" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadedFile ? uploadedFile.name : t('explore.upload_file')}
                            </span>
                          </Button>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.gif,.mp4,.mov,.wav,.mp3"
                          />
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <div className="container mx-auto max-w-7xl px-4 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Historique des recherches */}
                {user && searchHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t('explore.recent_searches')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {searchHistory.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => setSearchQuery(item.query)}
                          >
                            <div className="font-medium text-sm">{item.query}</div>
                            <div className="text-xs text-gray-500">
                              {item.results_count} résultats
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recherches suggérées */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      {t('explore.suggested_searches')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {suggestions.slice(0, 6).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left h-auto p-2 text-sm"
                          onClick={() => setSearchQuery(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Résultats principaux */}
              <div className="lg:col-span-3 space-y-6">
                {/* Résumé IA */}
                {aiSummary && (
                  <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        {t('explore.ai_summary')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300">{aiSummary}</p>
                    </CardContent>
                  </Card>
                )}

                {isGeneratingSummary && (
                  <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        <span>Génération du résumé IA...</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Résultats de recherche */}
                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">
                        {searchResults.length} {t('explore.results_found')}
                      </h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          {t('common.filter')}
                        </Button>
                      </div>
                    </div>

                    {searchResults.map((result) => {
                      const CategoryIcon = getCategoryIcon(result.type);
                      return (
                        <Card key={result.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              {result.thumbnail && (
                                <img
                                  src={result.thumbnail}
                                  alt={result.title}
                                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CategoryIcon className="h-4 w-4 text-gray-500" />
                                      <Badge variant="secondary" className="text-xs">
                                        {result.type}
                                      </Badge>
                                      <span className="text-xs text-gray-500">{result.source}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 cursor-pointer">
                                      {result.url ? (
                                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                                          {result.title}
                                        </a>
                                      ) : (
                                        result.title
                                      )}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                      {result.description}
                                    </p>
                                    {result.url && (
                                      <div className="flex items-center gap-1 text-sm text-green-600 mb-3">
                                        <LinkIcon className="h-3 w-3" />
                                        <span className="truncate">{result.url}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => shareResult(result)}
                                  >
                                    <Share2 className="h-3 w-3 mr-1" />
                                    {t('explore.share_result')}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => createMindMapFromResult(result)}
                                  >
                                    <Brain className="h-3 w-3 mr-1" />
                                    {t('explore.create_mindmap')}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => translateResult(result)}
                                  >
                                    <Translate className="h-3 w-3 mr-1" />
                                    {t('explore.translate_result')}
                                  </Button>
                                  {user && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => createFormFromResult(result)}
                                      >
                                        <FileSignature className="h-3 w-3 mr-1" />
                                        {t('explore.create_form')}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => createAIAgent(result)}
                                      >
                                        <Bot className="h-3 w-3 mr-1" />
                                        {t('explore.create_agent')}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => publishToCenter(result)}
                                      >
                                        <Users className="h-3 w-3 mr-1" />
                                        {t('explore.publish_center')}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* État de chargement */}
                {isSearching && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">{t('explore.loading')}</p>
                  </div>
                )}

                {/* Aucun résultat */}
                {!isSearching && searchResults.length === 0 && searchQuery && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('explore.no_results')}</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Essayez avec des mots-clés différents ou utilisez les suggestions.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ExplorePage;
