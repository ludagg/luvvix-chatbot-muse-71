
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, Search, Heart, MessageSquare, Sliders, 
  Sparkles, TrendingUp, Calendar, Star, Eye
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

// Interface pour les profils utilisateur
interface AgentUserProfile {
  id?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
}

// Interface pour les agents IA
interface AIAgent {
  id: string;
  name: string;
  description: string;
  objective: string;
  model: string;
  category: string;
  user_id: string;
  is_public: boolean;
  likes: number;
  views: number;
  prompt?: string;
  avatar_url?: string;
  user_profiles?: AgentUserProfile;
}

// Types pour les catégories et options de tri
type CategoryOption = {
  value: string;
  label: string;
  icon: React.ElementType;
}

type SortOption = {
  value: string;
  label: string;
  icon: React.ElementType;
}

const AIStudioMarketplacePage = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAgents();
  }, [categoryFilter, sortOrder]);

  const fetchAgents = async () => {
    setLoading(true);
    let query = supabase
      .from('ai_agents')
      .select(`*`)
      .eq('is_public', true);

    if (categoryFilter !== 'all') {
      query = query.eq('avatar_style', categoryFilter);
    }

    if (sortOrder === 'popular') {
      query = query.order('views', { ascending: false });
    } else if (sortOrder === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortOrder === 'most_liked') {
      query = query.order('views', { ascending: false });
    }

    try {
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching agents:', error);
      } else {
        // Transformation des données pour correspondre à l'interface AIAgent
        const formattedAgents: AIAgent[] = data?.map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.objective || '',
          objective: agent.objective || '',
          model: 'gpt-4',
          category: agent.avatar_style || 'general',
          user_id: agent.user_id,
          is_public: agent.is_public,
          likes: agent.views || 0,
          views: agent.views || 0,
          avatar_url: agent.avatar_url || '',
          user_profiles: {
            id: '',
            full_name: '',
            username: '',
            avatar_url: ''
          }
        })) || [];
        
        setAgents(formattedAgents);
      }
    } catch (err) {
      console.error('Unexpected error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const filteredAgents = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return agents.filter(agent =>
      agent.name.toLowerCase().includes(lowerCaseQuery) ||
      agent.description.toLowerCase().includes(lowerCaseQuery) ||
      agent.objective.toLowerCase().includes(lowerCaseQuery) ||
      agent.category.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchQuery, agents]);
  
  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const currentAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when changing sort order
  };

  const categoryOptions: CategoryOption[] = [
    { value: 'all', label: 'Tous', icon: Sparkles },
    { value: 'productivity', label: 'Productivité', icon: TrendingUp },
    { value: 'education', label: 'Éducation', icon: MessageSquare },
    { value: 'entertainment', label: 'Divertissement', icon: Star },
    { value: 'health', label: 'Santé', icon: Heart },
    { value: 'finance', label: 'Finance', icon: Search },
  ];

  const sortOptions: SortOption[] = [
    { value: 'popular', label: 'Populaire', icon: TrendingUp },
    { value: 'newest', label: 'Nouveaux', icon: Calendar },
    { value: 'most_liked', label: 'Plus aimés', icon: Heart },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>LuvviX AI Studio - Marketplace</title>
        <meta name="description" content="Explorez le LuvviX AI Studio Marketplace pour découvrir et utiliser les Agents IA créés par la communauté." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Marketplace des <span className="text-luvvix-purple">Agents IA</span>
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Découvrez et utilisez des assistants IA créés par notre communauté pour vous aider dans vos tâches quotidiennes
            </motion.p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
              <div className="relative w-full md:w-2/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Rechercher un agent IA..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={toggleFilters} variant="outline" className="w-full md:w-auto">
                  <Sliders className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
                <Button variant="luvvix" className="w-full md:w-auto">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Créer un Agent
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-4 overflow-hidden"
                >
                  <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                            <Search className="w-4 h-4 mr-2 text-luvvix-purple" />
                            Catégorie
                          </h3>
                          <div className="bg-gray-50 dark:bg-gray-700 p-1 rounded-lg">
                            <div className="grid grid-cols-3 gap-1 md:grid-cols-6">
                              {categoryOptions.map(option => (
                                <Button
                                  key={option.value}
                                  variant={categoryFilter === option.value ? "luvvix" : "ghost"}
                                  className="h-auto py-2 justify-start"
                                  onClick={() => handleCategoryChange(option.value)}
                                >
                                  <option.icon className="w-4 h-4 mr-2" />
                                  <span className="text-sm">{option.label}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-luvvix-purple" />
                            Trier par
                          </h3>
                          <div className="bg-gray-50 dark:bg-gray-700 p-1 rounded-lg">
                            <div className="grid grid-cols-3 gap-1">
                              {sortOptions.map(option => (
                                <Button
                                  key={option.value}
                                  variant={sortOrder === option.value ? "luvvix" : "ghost"}
                                  className="h-auto py-2 justify-start"
                                  onClick={() => handleSortOrderChange(option.value)}
                                >
                                  <option.icon className="w-4 h-4 mr-2" />
                                  <span className="text-sm">{option.label}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count & Current Filter */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-gray-600 dark:text-gray-400">
              {filteredAgents.length} agents trouvés
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryFilter !== 'all' && (
                <Badge variant="luvvix" className="bg-luvvix-purple/90 hover:bg-luvvix-purple">
                  {categoryOptions.find(option => option.value === categoryFilter)?.label}
                  <button className="ml-1" onClick={() => handleCategoryChange('all')}>×</button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary">
                  "{searchQuery}"
                  <button className="ml-1" onClick={() => setSearchQuery('')}>×</button>
                </Badge>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-luvvix-purple" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentAgents.length > 0 ? (
                currentAgents.map(agent => (
                  <motion.div
                    key={agent.id}
                    variants={itemVariants}
                    className="h-full"
                  >
                    <Link to={`/ai-studio/agents/${agent.id}`} className="block h-full">
                      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-md bg-white dark:bg-gray-800">
                        <div className="relative">
                          <AspectRatio ratio={16/9}>
                            <img
                              src={agent.avatar_url || "https://via.placeholder.com/400x200?text=AI+Agent"}
                              alt={agent.name}
                              className="w-full h-full object-cover"
                            />
                          </AspectRatio>
                          <div className="absolute top-2 right-2">
                            <Badge variant="luvvix" className="font-semibold">
                              {agent.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                            {agent.name}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-3">
                            {agent.description}
                          </p>
                        </CardContent>
                        
                        <CardFooter className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-rose-500 dark:text-rose-400">
                              <Heart className="w-4 h-4 mr-1" />
                              <span className="text-sm">{agent.likes}</span>
                            </div>
                            <div className="flex items-center text-blue-500 dark:text-blue-400">
                              <Eye className="w-4 h-4 mr-1" />
                              <span className="text-sm">{agent.views}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs h-8">
                            Explorer
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 text-center">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aucun agent IA trouvé
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Essayez de modifier vos critères de recherche ou consultez nos suggestions ci-dessous
                  </p>
                  <Button 
                    variant="luvvix"
                    className="mt-6"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                      setSortOrder('popular');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Pagination */}
          {filteredAgents.length > itemsPerPage && (
            <div className="mt-10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Call to Action */}
          <motion.div 
            className="mt-16 bg-gradient-to-r from-luvvix-purple to-luvvix-darkpurple text-white p-8 md:p-12 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Créez votre propre Agent IA
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Rejoignez notre communauté et partagez votre expertise en créant un Agent IA personnalisé
            </p>
            <Button 
              variant="white" 
              size="lg"
              className="font-medium shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Commencer maintenant
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AIStudioMarketplacePage;
