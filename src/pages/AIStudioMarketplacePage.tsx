import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, Heart, Star, Users, Sparkles, Zap, 
  ChevronRight, MessageSquare, Settings, PlusCircle, ExternalLink, 
  ThumbsUp, Filter, Sliders } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AIAgent {
  id: string;
  created_at: string;
  name: string;
  description: string;
  objective: string;
  model: string;
  user_id: string;
  is_public: boolean;
  category: string;
  likes: number;
  views: number;
  prompt: string;
  avatar_url: string;
  user_profiles?: {
    id: string;
    created_at: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

const AIStudioMarketplacePage = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [categoryFilter, sortOrder]);

  const fetchAgents = async () => {
    setLoading(true);
    let query = supabase
      .from('ai_agents')
      .select(`
        *,
        user_profiles:user_id (
          id,
          created_at,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_public', true);

    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    if (sortOrder === 'popular') {
      query = query.order('views', { ascending: false });
    } else if (sortOrder === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortOrder === 'most_liked') {
      query = query.order('likes', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching agents:', error);
    } else {
      setAgents(data || []);
    }
    setLoading(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredAgents = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return agents.filter(agent =>
      agent.name.toLowerCase().includes(lowerCaseQuery) ||
      agent.description.toLowerCase().includes(lowerCaseQuery) ||
      agent.objective.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchQuery, agents]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
  };

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
  };

  const categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'productivity', label: 'Productivité' },
    { value: 'education', label: 'Éducation' },
    { value: 'entertainment', label: 'Divertissement' },
    { value: 'health', label: 'Santé' },
    { value: 'finance', label: 'Finance' },
  ];

  const sortOptions = [
    { value: 'popular', label: 'Populaire' },
    { value: 'newest', label: 'Nouveaux' },
    { value: 'most_liked', label: 'Plus aimés' },
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>LuvviX AI Studio - Marketplace</title>
        <meta name="description" content="Explore the LuvviX AI Studio Marketplace to discover and use AI Agents created by the community." />
      </Helmet>

      <Navbar />

      <main className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              Marketplace des Agents IA
            </h1>
            <Button onClick={toggleFilters} variant="outline">
              <Sliders className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="mb-6 overflow-hidden"
              >
                <Card className="bg-white dark:bg-gray-800 shadow-md">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Catégorie
                        </h3>
                        <Tabs defaultValue={categoryFilter} className="w-full">
                          <TabsList className="grid grid-cols-3">
                            {categoryOptions.map(option => (
                              <TabsTrigger
                                key={option.value}
                                value={option.value}
                                onClick={() => handleCategoryChange(option.value)}
                                className="text-sm"
                              >
                                {option.label}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Trier par
                        </h3>
                        <Tabs defaultValue={sortOrder} className="w-full">
                          <TabsList className="grid grid-cols-3">
                            {sortOptions.map(option => (
                              <TabsTrigger
                                key={option.value}
                                value={option.value}
                                onClick={() => handleSortOrderChange(option.value)}
                                className="text-sm"
                              >
                                {option.label}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Rechercher un agent IA..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500 dark:text-gray-400" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredAgents.length > 0 ? (
                filteredAgents.map(agent => (
                  <motion.div
                    key={agent.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                    variants={itemVariants}
                  >
                    <Link to={`/ai-studio/agents/${agent.id}`}>
                      <img
                        src={agent.avatar_url}
                        alt={agent.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {agent.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {agent.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1 text-red-500" />
                            <span>{agent.likes || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                            <span>{agent.views || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center w-full py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucun agent IA trouvé.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AIStudioMarketplacePage;
