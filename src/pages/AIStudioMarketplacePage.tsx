
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, Search, Star, Users, Sparkles, Award, Flame, Bookmark, 
  Clock, Zap, Filter, Heart, PlusCircle, TrendingUp, ShieldCheck,
  Tool, ArrowUp, Coins, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import aiAgentService, { Agent } from "@/services/ai-agent-service";

interface Creator {
  id: string;
  name: string;
  avatarUrl: string;
  agentsCount: number;
  followerCount: number;
  isVerified?: boolean;
  bio?: string;
}

const AIStudioMarketplacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [activeTab, setActiveTab] = useState("discover");
  const [myFavorites, setMyFavorites] = useState<string[]>([]);
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  const [trendingCreators, setTrendingCreators] = useState<Creator[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const categories: { [key: string]: { name: string; icon: React.ReactNode } } = {
    all: { name: "Tous", icon: <Bot className="h-4 w-4" /> },
    productivity: { name: "Productivité", icon: <Zap className="h-4 w-4" /> },
    education: { name: "Éducation", icon: <Award className="h-4 w-4" /> },
    entertainment: { name: "Divertissement", icon: <Sparkles className="h-4 w-4" /> },
    business: { name: "Entreprise", icon: <Users className="h-4 w-4" /> },
    tools: { name: "Outils", icon: <Tool className="h-4 w-4" /> },
    finance: { name: "Finance", icon: <Coins className="h-4 w-4" /> },
    global: { name: "Global", icon: <Globe className="h-4 w-4" /> },
  };
  
  // Fetch agents based on current filters
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedAgents: Agent[] = [];
      
      if (activeTab === 'favorites' && user) {
        fetchedAgents = await aiAgentService.getFavoriteAgents(user.id);
      } else {
        fetchedAgents = await aiAgentService.getAgents({
          category,
          sortBy,
          searchQuery
        });
      }
      
      setAgents(fetchedAgents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents IA. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, searchQuery, activeTab, user, toast]);

  useEffect(() => {
    fetchAgents();
    if (user) {
      fetchUserData();
    }
    
    // Fetch trending creators
    const loadTrendingCreators = async () => {
      try {
        const creators = await aiAgentService.getTrendingCreators();
        setTrendingCreators(creators);
      } catch (error) {
        console.error("Error fetching trending creators:", error);
      }
    };
    
    loadTrendingCreators();
  }, [fetchAgents, user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const [favorites, following] = await Promise.all([
        aiAgentService.getUserFavorites(user.id),
        aiAgentService.getUserFollowing(user.id)
      ]);
      
      setMyFavorites(favorites);
      setFollowedCreators(following);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAgents();
  };
  
  const toggleFavorite = async (agentId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des favoris",
        variant: "default",
      });
      return;
    }
    
    try {
      const isAdded = await aiAgentService.toggleFavorite(user.id, agentId);
      
      setMyFavorites(prev => 
        isAdded ? [...prev, agentId] : prev.filter(id => id !== agentId)
      );
      
      toast({
        title: isAdded ? "Ajouté aux favoris" : "Retiré des favoris",
        description: `L'agent a été ${isAdded ? 'ajouté à' : 'retiré de'} vos favoris`,
        variant: "default",
      });
      
      // If we're on the favorites tab, refresh the list
      if (activeTab === 'favorites') {
        fetchAgents();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  
  const toggleFollowCreator = async (creatorId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour suivre des créateurs",
        variant: "default",
      });
      return;
    }
    
    try {
      const isFollowed = await aiAgentService.toggleFollowCreator(user.id, creatorId);
      
      setFollowedCreators(prev => 
        isFollowed ? [...prev, creatorId] : prev.filter(id => id !== creatorId)
      );
      
      toast({
        title: isFollowed ? "Abonnement" : "Désabonnement",
        description: isFollowed ? "Vous suivez maintenant ce créateur" : "Vous ne suivez plus ce créateur",
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  
  // Generate avatar for each agent based on its avatar_style
  const getAgentAvatar = (agent: Agent) => {
    switch (agent.avatar_style) {
      case "bot":
        return <Bot className="h-5 w-5" />;
      case "sparkles":
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  const EmptyState = ({ icon, title, description, action }: { icon: React.ReactNode, title: string, description: string, action?: React.ReactNode }) => (
    <div className="text-center py-12">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container px-4 mx-auto max-w-7xl">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center max-w-3xl mx-auto"
          >
            <div className="inline-block mb-2 bg-gradient-to-r from-indigo-200 to-violet-200 dark:from-indigo-900 dark:to-violet-900 px-3 py-1 rounded-full text-sm font-medium">
              Marketplace LuvviX
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-300">
              Trouvez votre assistant IA idéal
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Découvrez des assistants IA intelligents créés par notre communauté pour améliorer votre productivité et résoudre vos problèmes.
            </p>
          </motion.div>
          
          {/* Main Marketplace Tabs */}
          <Tabs defaultValue="discover" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-1 shadow-lg border border-slate-200 dark:border-slate-800">
                <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full max-w-3xl bg-slate-100/70 dark:bg-slate-800/70 p-1">
                  <TabsTrigger value="discover" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Découvrir</span>
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                    <Flame className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Tendances</span>
                  </TabsTrigger>
                  <TabsTrigger value="new" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Nouveautés</span>
                  </TabsTrigger>
                  <TabsTrigger value="creators" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Créateurs</span>
                  </TabsTrigger>
                  <TabsTrigger value="favorites" disabled={!user} className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                    <Bookmark className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Favoris</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </motion.div>
            
            {/* Search and Filters */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
            >
              <div className="flex-grow">
                <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                  <div className={`relative flex-grow transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-violet-300 dark:ring-violet-700' : ''}`}>
                    <Search className={`h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-violet-500' : 'text-slate-400'}`} />
                    <Input
                      type="text"
                      placeholder="Rechercher un agent IA..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="pl-10 pr-4 border-slate-300 dark:border-slate-600 focus:ring-0 focus:border-violet-400"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Rechercher</span>
                  </Button>
                </form>
              </div>
              
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[160px] border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([value, { name, icon }]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center">
                          {icon}
                          <span className="ml-2">{name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Les plus populaires</SelectItem>
                    <SelectItem value="rating">Mieux notés</SelectItem>
                    <SelectItem value="recent">Plus récents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
            
            {/* Tab content */}
            <TabsContent value="discover" className="mt-0">
              {/* Stats Banner */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-950 hover:shadow-xl transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mb-3">
                      <Bot className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">{loading ? <Skeleton className="w-16 h-8" /> : agents.length || "0"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Agents disponibles</p>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950 hover:shadow-xl transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mb-3">
                      <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">{loading ? <Skeleton className="w-16 h-8" /> : trendingCreators.length}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Créateurs actifs</p>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-amber-950 hover:shadow-xl transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mb-3">
                      <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">{loading ? <Skeleton className="w-16 h-8" /> : "1.2M"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Conversations</p>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-emerald-950 hover:shadow-xl transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full mb-3">
                      <Star className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">{loading ? <Skeleton className="w-16 h-8" /> : "4.8"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Note moyenne</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              {user && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-8 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-xl p-6 shadow-md backdrop-blur-sm border border-white/20 dark:border-slate-700/30"
                >
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Devenez créateur d'agents IA</h3>
                      <p className="text-slate-700 dark:text-slate-300 max-w-2xl">
                        Partagez vos agents IA avec la communauté, gagnez des abonnés et contribuez à l'écosystème LuvviX.
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg">
                        <Link to="/ai-studio/create-agent">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Créer un agent public
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Agent Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full mr-2" />
                            <div>
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-12" />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-4/5" />
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : agents.length > 0 ? (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  transition={{ staggerChildren: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {agents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                      }}
                    >
                      <Card className="overflow-hidden group border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:border-violet-200 dark:hover:border-violet-800 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 mr-3 bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 dark:from-violet-900 dark:to-indigo-900 dark:text-violet-300 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarFallback>{getAgentAvatar(agent)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{agent.name}</CardTitle>
                                <div className="flex items-center">
                                  <Link 
                                    to={`/ai-studio/creator/${agent.user_id}`} 
                                    className="text-xs text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center"
                                  >
                                    par {agent.user?.full_name || "Créateur anonyme"}
                                    {Math.random() > 0.7 && (
                                      <ShieldCheck className="h-3 w-3 ml-1 text-blue-500" />
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {agent.rating > 0 && (
                                <Badge variant="secondary" className="flex items-center bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                  <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                                  {agent.rating.toFixed(1)}
                                </Badge>
                              )}
                              <button
                                onClick={() => toggleFavorite(agent.id)}
                                className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
                              >
                                {myFavorites.includes(agent.id) ? (
                                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                                ) : (
                                  <Heart className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {agent.objective}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">{agent.personality}</Badge>
                            {agent.is_paid && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                                Premium
                              </Badge>
                            )}
                            {agent.views > 1000 && (
                              <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                                Populaire
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                          <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow">
                            <Link to={`/ai-studio/chat/${agent.id}`}>
                              Discuter
                            </Link>
                          </Button>
                          <div className="flex items-center text-xs text-slate-500 gap-3">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {agent.conversations_count?.toLocaleString() || 0}
                            </div>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {agent.reviews_count || 0}
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState 
                  icon={<Bot className="h-8 w-8 text-violet-500" />}
                  title="Aucun agent trouvé"
                  description="Nous n'avons pas trouvé d'agents IA correspondant à votre recherche."
                  action={
                    <Button onClick={() => {
                      setSearchQuery("");
                      setCategory("all");
                      fetchAgents();
                    }}>
                      Réinitialiser les filtres
                    </Button>
                  }
                />
              )}
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-red-100/80 to-orange-100/80 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 shadow-md mb-8 backdrop-blur-sm border border-white/20 dark:border-slate-700/30"
              >
                <h2 className="text-2xl font-bold mb-2 text-center">
                  <Flame className="h-5 w-5 inline-block mr-2 text-red-500" />
                  Agents IA populaires cette semaine
                </h2>
                <p className="text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Ces agents se démarquent par leur grand nombre d'utilisateurs et d'excellentes évaluations.
                </p>
              </motion.div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  transition={{ staggerChildren: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {agents
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 6)
                    .map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                        }}
                      >
                        <Card className="overflow-hidden border-2 border-amber-100 dark:border-amber-900 group hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                          <CardHeader className="relative pb-2">
                            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white">
                              <Flame className="h-3 w-3 mr-1" />
                              Tendance
                            </Badge>
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 mr-3 bg-gradient-to-br from-amber-100 to-red-100 text-amber-600 dark:from-amber-900 dark:to-red-900 dark:text-amber-300 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarFallback>{getAgentAvatar(agent)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{agent.name}</CardTitle>
                                <div className="flex items-center">
                                  <Link 
                                    to={`/ai-studio/creator/${agent.user_id}`} 
                                    className="text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center"
                                  >
                                    par {agent.user?.full_name || "Créateur anonyme"}
                                    {Math.random() > 0.7 && (
                                      <ShieldCheck className="h-3 w-3 ml-1 text-blue-500" />
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                              {agent.objective}
                            </p>
                            <div className="flex flex-wrap mt-3 space-x-3 text-xs text-slate-500">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {agent.conversations_count?.toLocaleString() || 0} conversations
                              </div>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {agent.reviews_count || 0} avis
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-3 mt-2 border-t border-amber-100 dark:border-amber-900">
                            <Button asChild className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600">
                              <Link to={`/ai-studio/chat/${agent.id}`}>
                                Discuter
                              </Link>
                            </Button>
                            <button
                              onClick={() => toggleFavorite(agent.id)}
                              className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
                            >
                              {myFavorites.includes(agent.id) ? (
                                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                              ) : (
                                <Heart className="h-4 w-4" />
                              )}
                            </button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 shadow-md mb-8 backdrop-blur-sm border border-white/20 dark:border-slate-700/30"
              >
                <h2 className="text-2xl font-bold mb-2 text-center">
                  <Clock className="h-5 w-5 inline-block mr-2 text-blue-500" />
                  Nouveaux Agents IA
                </h2>
                <p className="text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Découvrez les derniers agents ajoutés à notre marketplace et soyez parmi les premiers à les tester.
                </p>
              </motion.div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  transition={{ staggerChildren: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {agents
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 6)
                    .map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                        }}
                      >
                        <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900 group hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                          <CardHeader className="relative pb-2">
                            <Badge className="absolute top-2 right-2 variant-secondary bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                              <Clock className="h-3 w-3 mr-1" />
                              Nouveau
                            </Badge>
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 mr-3 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-300 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarFallback>{getAgentAvatar(agent)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{agent.name}</CardTitle>
                                <div className="flex items-center">
                                  <Link 
                                    to={`/ai-studio/creator/${agent.user_id}`} 
                                    className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                                  >
                                    par {agent.user?.full_name || "Créateur anonyme"}
                                    {Math.random() > 0.7 && (
                                      <ShieldCheck className="h-3 w-3 ml-1 text-blue-500" />
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                              {agent.objective}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-3">
                              <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">{agent.personality}</Badge>
                              {agent.is_paid && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-3 mt-2 border-t border-blue-100 dark:border-blue-900">
                            <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                              <Link to={`/ai-studio/chat/${agent.id}`}>
                                Discuter
                              </Link>
                            </Button>
                            <div className="text-xs text-slate-500 flex items-center">
                              {new Date(agent.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="creators" className="mt-0">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-violet-100/80 to-purple-100/80 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 shadow-md mb-8 backdrop-blur-sm border border-white/20 dark:border-slate-700/30"
              >
                <h2 className="text-2xl font-bold mb-2 text-center">
                  <Users className="h-5 w-5 inline-block mr-2 text-violet-500" />
                  Créateurs Populaires
                </h2>
                <p className="text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Découvrez les meilleurs créateurs d'agents IA et suivez-les pour ne manquer aucune de leurs nouvelles créations.
                </p>
              </motion.div>
              
              <motion.div 
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                {trendingCreators.length > 0 ? trendingCreators.map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                    }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                      <CardHeader className="text-center pb-2">
                        <div className="relative inline-flex mx-auto">
                          <Avatar className="h-20 w-20 mx-auto mb-2 bg-gradient-to-br from-violet-500 to-indigo-500 text-white border-4 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform duration-300">
                            <AvatarImage src={creator.avatarUrl} />
                            <AvatarFallback className="text-lg">
                              {creator.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {creator.isVerified && (
                            <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-1 shadow-md">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{creator.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {creator.bio || "Créateur d'agents IA sur LuvviX"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center pb-4">
                        <div className="flex justify-center space-x-6 text-sm">
                          <div>
                            <p className="font-bold">{creator.agentsCount}</p>
                            <p className="text-xs text-slate-500">Agents</p>
                          </div>
                          <div>
                            <p className="font-bold">{creator.followerCount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Abonnés</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center gap-2 pt-0 pb-6">
                        <Button 
                          variant={followedCreators.includes(creator.id) ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleFollowCreator(creator.id)}
                          className={followedCreators.includes(creator.id) 
                            ? "border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-300" 
                            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"}
                        >
                          {followedCreators.includes(creator.id) ? "Abonné" : "S'abonner"}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/ai-studio/creator/${creator.id}`}>
                            Voir le profil
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-[300px] w-full" />
                  ))
                )}
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2">Vous souhaitez devenir créateur ?</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
                    Lancez-vous dans la création d'agents IA et rejoignez notre communauté active de créateurs.
                  </p>
                  {user ? (
                    <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md">
                      <Link to="/ai-studio/create-agent">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Devenir créateur
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md">
                      <Link to="/auth">
                        Se connecter pour commencer
                      </Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-0">
              {!user ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <EmptyState 
                    icon={<Bookmark className="h-8 w-8 text-violet-500" />}
                    title="Connectez-vous pour voir vos favoris"
                    description="Vous devez être connecté pour ajouter des agents à vos favoris."
                    action={
                      <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                        <Link to="/auth">Se connecter</Link>
                      </Button>
                    }
                  />
                </motion.div>
              ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : agents.length > 0 ? (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  transition={{ staggerChildren: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {agents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                      }}
                    >
                      <Card className="overflow-hidden group border-2 border-rose-100 dark:border-rose-900 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 mr-3 bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 dark:from-rose-900 dark:to-pink-900 dark:text-rose-300 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarFallback>{getAgentAvatar(agent)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{agent.name}</CardTitle>
                                <div className="flex items-center">
                                  <Link 
                                    to={`/ai-studio/creator/${agent.user_id}`} 
                                    className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center"
                                  >
                                    par {agent.user?.full_name || "Créateur anonyme"}
                                    {Math.random() > 0.7 && (
                                      <ShieldCheck className="h-3 w-3 ml-1 text-blue-500" />
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleFavorite(agent.id)}
                              className="text-rose-500"
                            >
                              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {agent.objective}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">{agent.personality}</Badge>
                            {agent.is_paid && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                                Premium
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-3 mt-2 border-t border-rose-100 dark:border-rose-900">
                          <Button asChild className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                            <Link to={`/ai-studio/chat/${agent.id}`}>
                              Discuter
                            </Link>
                          </Button>
                          <div className="flex items-center text-xs text-slate-500 gap-3">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {agent.conversations_count?.toLocaleString() || 0}
                            </div>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {agent.reviews_count || 0}
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <EmptyState 
                    icon={<Bookmark className="h-8 w-8 text-violet-500" />}
                    title="Aucun favori"
                    description="Vous n'avez pas encore ajouté d'agents à vos favoris."
                    action={
                      <Button onClick={() => setActiveTab("discover")} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                        Découvrir des agents
                      </Button>
                    }
                  />
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-10 py-6 bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 backdrop-blur-sm rounded-xl shadow-md border border-white/20 dark:border-slate-700/30">
            <div className="text-center max-w-3xl mx-auto px-4">
              <div className="inline-flex items-center justify-center p-1 mb-3 rounded-full bg-indigo-500/10">
                <ArrowUp className="h-4 w-4 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-indigo-800 dark:text-indigo-300">Améliorez votre expérience avec LuvviX AI Studio</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Accédez à encore plus d'agents IA, partagez vos créations et contribuez à notre marketplace en constante évolution.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {user ? (
                  <>
                    <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                      <Link to="/ai-studio/create-agent">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Créer un agent
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/ai-studio">
                        Tableau de bord
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                    <Link to="/auth">
                      Commencer maintenant
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioMarketplacePage;
