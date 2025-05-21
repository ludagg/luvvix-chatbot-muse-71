
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
  Sparkles, TrendingUp, Calendar, Star, Eye, 
  ArrowRight, Bot, Zap, Filter, Clock, Trophy
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
import { HoverGlowCard } from '@/components/ui/hover-glow-card';

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
  const itemsPerPage = 9;

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
          model: agent.model || 'gpt-4',
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

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f1219] via-[#171c28] to-[#1e2436]">
        <Navbar />

        <main className="flex-grow py-16">
          <div className="container mx-auto px-4">
            {/* Header Section */}
            <div className="mb-12 text-center relative">
              {/* Background Elements */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-20 left-40 w-72 h-72 bg-luvvix-purple/10 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-40 w-80 h-80 bg-luvvix-teal/5 rounded-full filter blur-3xl"></div>
              </div>
            
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white mb-4 relative z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Marketplace des <span className="bg-gradient-to-r from-luvvix-lightpurple to-luvvix-teal bg-clip-text text-transparent">Agents IA</span>
              </motion.h1>
              <motion.p 
                className="text-lg text-white/80 max-w-2xl mx-auto relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Découvrez et utilisez des assistants IA créés par notre communauté pour vous aider dans vos tâches quotidiennes
              </motion.p>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-10">
              <motion.div 
                className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative w-full md:w-2/3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  <Input
                    type="text"
                    placeholder="Rechercher un agent IA..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 bg-white/10 border-white/20 text-white focus:border-luvvix-purple/50 h-11"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    onClick={toggleFilters} 
                    variant="outline" 
                    className="w-full md:w-auto border-white/20 text-white hover:bg-white/10"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </Button>
                  <Button 
                    variant="luvvix" 
                    className="w-full md:w-auto bg-gradient-to-r from-luvvix-purple to-luvvix-darkpurple"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Créer un Agent
                  </Button>
                </div>
              </motion.div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mt-4 overflow-hidden"
                  >
                    <Card className="bg-white/5 backdrop-blur-md bg-opacity-90 border border-white/10 shadow-lg">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                              <Search className="w-4 h-4 mr-2 text-luvvix-lightpurple" />
                              Catégorie
                            </h3>
                            <div className="bg-white/5 p-1 rounded-lg border border-white/10">
                              <div className="grid grid-cols-3 gap-1 md:grid-cols-6">
                                {categoryOptions.map(option => (
                                  <Button
                                    key={option.value}
                                    variant={categoryFilter === option.value ? "luvvix" : "ghost"}
                                    className={`h-auto py-2 justify-start ${categoryFilter === option.value ? "bg-luvvix-purple" : "text-white hover:bg-white/10"}`}
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
                            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2 text-luvvix-lightpurple" />
                              Trier par
                            </h3>
                            <div className="bg-white/5 p-1 rounded-lg border border-white/10">
                              <div className="grid grid-cols-3 gap-1">
                                {sortOptions.map(option => (
                                  <Button
                                    key={option.value}
                                    variant={sortOrder === option.value ? "luvvix" : "ghost"}
                                    className={`h-auto py-2 justify-start ${sortOrder === option.value ? "bg-luvvix-purple" : "text-white hover:bg-white/10"}`}
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

            {/* Active Filters & Results Count */}
            <motion.div 
              className="mb-8 flex flex-wrap justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-white/70 flex items-center">
                {filteredAgents.length} agents trouvés
                
                {sortOrder === 'popular' && (
                  <Badge variant="outline" className="ml-2 border-luvvix-teal/50 bg-luvvix-teal/10 text-luvvix-teal">
                    <Trophy className="w-3 h-3 mr-1" /> 
                    Populaires
                  </Badge>
                )}
                
                {sortOrder === 'newest' && (
                  <Badge variant="outline" className="ml-2 border-luvvix-lightpurple/50 bg-luvvix-lightpurple/10 text-luvvix-lightpurple">
                    <Clock className="w-3 h-3 mr-1" /> 
                    Récents
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categoryFilter !== 'all' && (
                  <Badge 
                    variant="outline" 
                    className="bg-luvvix-purple/20 text-luvvix-lightpurple border-luvvix-purple/40 px-3 py-1 h-7"
                  >
                    {categoryOptions.find(option => option.value === categoryFilter)?.label}
                    <button className="ml-2 hover:text-white transition-colors" onClick={() => handleCategoryChange('all')}>×</button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge 
                    variant="outline" 
                    className="bg-white/10 text-white/80 border-white/20 px-3 py-1 h-7"
                  >
                    "{searchQuery}"
                    <button className="ml-2 hover:text-white transition-colors" onClick={() => setSearchQuery('')}>×</button>
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Agent Cards Grid - Modern & Futuristic */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-luvvix-purple mb-4" />
                <p className="text-white/70">Chargement des agents IA...</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {currentAgents.length > 0 ? (
                  currentAgents.map((agent) => (
                    <motion.div
                      key={agent.id}
                      variants={itemVariants}
                      className="h-full"
                    >
                      <HoverGlowCard>
                        <Link to={`/ai-studio/agents/${agent.id}`} className="block h-full">
                          <Card className="overflow-hidden h-full flex flex-col border-0 shadow-md bg-white/5 backdrop-blur-sm">
                            <div className="relative">
                              <AspectRatio ratio={16/9}>
                                <div className="w-full h-full bg-gradient-to-br from-luvvix-purple/20 to-luvvix-teal/20 relative overflow-hidden">
                                  {agent.avatar_url ? (
                                    <img
                                      src={agent.avatar_url}
                                      alt={agent.name}
                                      className="w-full h-full object-cover opacity-80"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Bot className="w-16 h-16 text-white/20" />
                                    </div>
                                  )}
                                  
                                  {/* Overlay gradient */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>
                              </AspectRatio>
                              
                              {/* Category badge */}
                              <div className="absolute top-3 right-3 z-10">
                                <Badge 
                                  variant="outline" 
                                  className="font-medium bg-white/10 backdrop-blur-md border-white/20 text-white"
                                >
                                  {agent.category || "Général"}
                                </Badge>
                              </div>
                              
                              {/* Agent name displayed at bottom of image */}
                              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                                <h2 className="text-xl font-semibold text-white line-clamp-1 tracking-tight">
                                  {agent.name}
                                </h2>
                              </div>
                            </div>
                            
                            <CardContent className="p-5 flex-1 flex flex-col bg-white/5">
                              <p className="text-white/80 text-sm line-clamp-3 mb-4">
                                {agent.description}
                              </p>
                              
                              <div className="flex items-center mt-auto space-x-4">
                                <div className="flex items-center text-rose-400">
                                  <Heart className="w-4 h-4 mr-1 fill-rose-400" />
                                  <span className="text-sm">{agent.likes}</span>
                                </div>
                                <div className="flex items-center text-blue-400">
                                  <Eye className="w-4 h-4 mr-1" />
                                  <span className="text-sm">{agent.views}</span>
                                </div>
                              </div>
                            </CardContent>
                            
                            <CardFooter className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
                              <div className="w-7 h-7 rounded-full bg-luvvix-purple/30 border border-white/10 flex items-center justify-center text-xs text-white font-medium">
                                {agent.user_profiles?.username ? agent.user_profiles.username.substring(0, 1).toUpperCase() : "U"}
                              </div>
                              
                              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 font-medium group">
                                Explorer 
                                <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      </HoverGlowCard>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 text-center">
                    <Search className="w-16 h-16 text-white/20 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-3">
                      Aucun agent IA trouvé
                    </h3>
                    <p className="text-white/60 max-w-md mx-auto mb-6">
                      Essayez de modifier vos critères de recherche ou consultez nos suggestions ci-dessous
                    </p>
                    <Button 
                      variant="outline"
                      className="border-luvvix-purple text-luvvix-lightpurple hover:bg-luvvix-purple/10"
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
              <motion.div 
                className="mt-12"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} border border-white/10 bg-white/5 text-white hover:bg-white/10`}
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
                          className={`${currentPage === i + 1 ? "bg-luvvix-purple border-luvvix-purple text-white" : "border border-white/10 bg-white/5 text-white"} hover:bg-white/10`}
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
                        className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} border border-white/10 bg-white/5 text-white hover:bg-white/10`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </motion.div>
            )}

            {/* Call to Action */}
            <motion.div 
              className="mt-20 bg-gradient-to-r from-luvvix-darkpurple/90 to-luvvix-purple/90 border border-luvvix-purple/20 backdrop-blur-md text-white p-8 md:p-12 rounded-2xl shadow-lg text-center relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-luvvix-lightpurple/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-luvvix-teal/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-luvvix-darkpurple/30 to-transparent"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                  Créez votre propre Agent IA
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
                  Rejoignez notre communauté et partagez votre expertise en créant un Agent IA personnalisé
                </p>
                <Button 
                  size="lg"
                  className="bg-white text-gray-800 hover:bg-white/90 border-0 shadow-lg font-medium px-6"
                  asChild
                >
                  <Link to="/ai-studio/create">
                    <Zap className="w-5 h-5 mr-2" />
                    Commencer maintenant
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AIStudioMarketplacePage;
