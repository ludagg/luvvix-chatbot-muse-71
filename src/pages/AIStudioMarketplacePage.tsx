
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Bot,
  Search,
  Filter,
  Star,
  MessageSquare,
  Sparkles,
  Flame,
  TrendingUp,
  Users,
  Heart,
  Award,
  Gift,
  Gauge,
  BrainCircuit,
  BarChart3,
  ThumbsUp,
  UserRound,
  Zap,
  Trophy
} from "lucide-react";

const AIStudioMarketplacePage = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [currentTab, setCurrentTab] = useState("agents");
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalCreators: 0,
    totalConversations: 0,
    averageRating: 0
  });
  
  useEffect(() => {
    document.title = "Marketplace - LuvviX AI Studio";
    
    const fetchMarketplaceData = async () => {
      try {
        setLoading(true);
        
        // Fetch public agents
        const { data: agentsData, error: agentsError } = await supabase
          .from("ai_agents")
          .select(`
            *,
            user_profiles:user_id(
              id,
              full_name,
              username,
              avatar_url
            ),
            ai_favorites:ai_favorites(count)
          `)
          .eq("is_public", true);
          
        if (agentsError) throw agentsError;
        
        // Fetch top creators (users with most agents)
        const { data: creatorsData, error: creatorsError } = await supabase
          .from("user_profiles")
          .select(`
            id,
            full_name,
            username,
            avatar_url,
            ai_agents:ai_agents(count)
          `)
          .order("ai_agents", { ascending: false })
          .limit(10);
          
        if (creatorsError) throw creatorsError;
        
        // Fetch marketplace stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_marketplace_stats');
        
        if (statsError && statsError.message !== "Function \"get_marketplace_stats\" does not exist") {
          throw statsError;
        }
        
        // Process data
        const processedAgents = agentsData?.map(agent => ({
          ...agent,
          creator: agent.user_profiles,
          favorites_count: agent.ai_favorites?.length || 0
        })) || [];
        
        const processedCreators = creatorsData?.map(creator => ({
          ...creator,
          agent_count: creator.ai_agents?.length || 0
        })) || [];
        
        // Set states
        setAgents(processedAgents);
        setCreators(processedCreators);
        
        if (statsData) {
          setStats(statsData);
        } else {
          // Fallback stats if RPC doesn't exist
          setStats({
            totalAgents: processedAgents.length,
            totalCreators: new Set(processedAgents.map(a => a.user_id)).size,
            totalConversations: processedAgents.reduce((sum, a) => sum + (a.views || 0), 0),
            averageRating: processedAgents.reduce((sum, a) => sum + (a.rating || 0), 0) / 
              (processedAgents.filter(a => a.rating).length || 1)
          });
        }
      } catch (error) {
        console.error("Error fetching marketplace data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketplaceData();
  }, []);
  
  const getAvatarIcon = (avatarStyle: string) => {
    switch (avatarStyle) {
      case "bot":
        return <Bot className="h-full w-full p-1.5" />;
      case "sparkles":
        return <Sparkles className="h-full w-full p-1.5" />;
      default:
        return <Bot className="h-full w-full p-1.5" />;
    }
  };
  
  const filteredAgents = agents.filter(agent => {
    // Filter by search query
    if (searchQuery && 
        !agent.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !agent.objective.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(agent.creator?.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    
    // Filter by category
    if (category === "free" && agent.is_paid) {
      return false;
    }
    if (category === "paid" && !agent.is_paid) {
      return false;
    }
    
    return true;
  });
  
  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "favorites":
        return (b.favorites_count || 0) - (a.favorites_count || 0);
      case "popular":
      default:
        return (b.views || 0) - (a.views || 0);
    }
  });
  
  // Get trending agents (highest view-to-age ratio)
  const trendingAgents = [...agents]
    .map(agent => {
      const ageInDays = (new Date().getTime() - new Date(agent.created_at).getTime()) / (1000 * 60 * 60 * 24) + 0.5;
      return {
        ...agent,
        trendScore: (agent.views || 0) / ageInDays
      };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-sm font-medium mb-4">
              <Sparkles size={16} className="mr-2" /> Découvrez des IA spécialisées
            </div>
            
            <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Marketplace d'agents IA
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-8">
              Explorez, utilisez et partagez des assistants IA spécialisés créés par notre communauté d'experts
            </p>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { 
                label: "Agents IA", 
                value: stats.totalAgents, 
                icon: Bot, 
                color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300" 
              },
              { 
                label: "Créateurs", 
                value: stats.totalCreators, 
                icon: UserRound, 
                color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" 
              },
              { 
                label: "Conversations", 
                value: stats.totalConversations, 
                icon: MessageSquare, 
                color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" 
              },
              { 
                label: "Note moyenne", 
                value: stats.averageRating.toFixed(1), 
                icon: Star, 
                color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300" 
              }
            ].map((stat, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Trending Agents Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <Flame className="mr-2 text-red-500" size={24} />
                Agents en tendance
              </h2>
              <Link 
                to="/ai-studio/create" 
                className="text-violet-600 dark:text-violet-400 hover:underline text-sm font-medium"
              >
                Créer le vôtre →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))
              ) : trendingAgents.length > 0 ? (
                trendingAgents.map((agent, index) => (
                  <Card key={agent.id} className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all">
                    <div className="h-1 w-full bg-gradient-to-r from-red-400 to-orange-400"></div>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="mr-2 h-8 w-8 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                            {agent.avatar_style ? (
                              <AvatarFallback>
                                {getAvatarIcon(agent.avatar_style)}
                              </AvatarFallback>
                            ) : (
                              <AvatarFallback>
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <CardTitle className="text-base font-semibold">
                              {agent.name.length > 20 ? `${agent.name.substring(0, 20)}...` : agent.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              par {agent.creator?.username || "Anonyme"}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1 text-red-500 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <TrendingUp className="h-3 w-3" />
                          <span>#{index + 1}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300 mb-3">
                        {agent.objective}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            <span>{agent.views || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-amber-500" />
                            <span>{(agent.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        {agent.is_paid && (
                          <span className="font-medium text-green-600 dark:text-green-400">{agent.price}€</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white">
                        <Link to={`/ai-studio/agents/${agent.id}`}>
                          Discuter
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-4 text-center p-8">
                  <p>Aucun agent en tendance pour le moment.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Marketplace Content */}
          <div className="w-full max-w-7xl mx-auto">
            <Tabs defaultValue="agents" className="w-full" onValueChange={setCurrentTab}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="agents" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <Bot className="h-4 w-4 mr-2" />
                    Agents IA
                  </TabsTrigger>
                  <TabsTrigger value="creators" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Créateurs
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    Catégories
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      placeholder="Rechercher un agent..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {currentTab === "agents" && (
                    <div className="flex gap-2">
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full sm:w-auto">
                          <Filter className="h-4 w-4 mr-2" />
                          <span>Filtrer</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les agents</SelectItem>
                          <SelectItem value="free">Gratuits</SelectItem>
                          <SelectItem value="paid">Payants</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-auto">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span>Trier</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popular">Populaires</SelectItem>
                          <SelectItem value="newest">Récents</SelectItem>
                          <SelectItem value="rating">Mieux notés</SelectItem>
                          <SelectItem value="favorites">Plus de favoris</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
              
              <TabsContent value="agents" className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-6 w-40" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-10 w-32" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : sortedAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedAgents.map((agent) => (
                      <Card key={agent.id} className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                        <CardHeader>
                          <div className="flex items-start">
                            <div className="relative">
                              <Avatar className="mr-3 h-10 w-10 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                                <AvatarFallback>
                                  {getAvatarIcon(agent.avatar_style)}
                                </AvatarFallback>
                              </Avatar>
                              {agent.favorites_count > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="absolute -bottom-1 -right-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 rounded-full p-0.5 border border-white dark:border-slate-800">
                                        <Heart className="h-3 w-3 fill-current" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{agent.favorites_count} utilisateurs ont ajouté cet agent à leurs favoris</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {agent.name}
                                  </CardTitle>
                                  <CardDescription className="flex items-center">
                                    <span>par {agent.creator?.username || "Anonyme"}</span>
                                    {new Date(agent.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                                      <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-0 text-xs">
                                        Nouveau
                                      </Badge>
                                    )}
                                  </CardDescription>
                                </div>
                                {agent.is_paid ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-0">
                                    {agent.price}€
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-0">
                                    Gratuit
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-3 text-slate-600 dark:text-slate-300 text-sm">
                            {agent.objective}
                          </p>
                          
                          <div className="flex items-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center mr-3">
                              <Star className="h-4 w-4 mr-1 text-amber-500" />
                              <span>{(agent.rating || 0).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center mr-3">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>{agent.views || 0} vues</span>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="outline" className="text-xs font-normal border-slate-200 dark:border-slate-700">
                                {agent.personality || "Standard"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button asChild className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white">
                            <Link to={`/ai-studio/agents/${agent.id}`}>
                              Voir et discuter
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
                    <Bot className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                      Aucun agent trouvé
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {searchQuery ? 
                        "Aucun agent ne correspond à votre recherche." : 
                        "Il n'y a pas encore d'agents dans le marketplace."}
                    </p>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white">
                      <Link to="/ai-studio">
                        Retour à l'accueil
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="creators" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {loading ? (
                    Array(8).fill(0).map((_, i) => (
                      <Card key={i} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <Skeleton className="h-16 w-16 rounded-full mb-4" />
                            <Skeleton className="h-6 w-32 mb-1" />
                            <Skeleton className="h-4 w-24 mb-3" />
                            <Skeleton className="h-8 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : creators.length > 0 ? (
                    creators.map((creator, index) => (
                      <Card key={creator.id} className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                              <Avatar className="h-16 w-16 border-2 border-white dark:border-slate-800 shadow-sm">
                                {creator.avatar_url ? (
                                  <AvatarImage src={creator.avatar_url} alt={creator.username || "Créateur"} />
                                ) : (
                                  <AvatarFallback className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 text-xl font-semibold">
                                    {(creator.username || creator.full_name || "U").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              {index < 3 && (
                                <div className="absolute -bottom-1 -right-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 rounded-full p-1 border-2 border-white dark:border-slate-800">
                                  <Trophy className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                              {creator.full_name || creator.username || "Créateur anonyme"}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                              @{creator.username || "anonyme"}
                            </p>
                            <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                              <div className="flex items-center">
                                <Bot className="h-4 w-4 mr-1 text-violet-500" />
                                <span>{creator.agent_count} agents</span>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-900 dark:text-violet-400 dark:hover:bg-violet-900/20"
                            >
                              Voir les agents
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
                      <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                        Aucun créateur trouvé
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Soyez le premier à créer et partager vos agents IA.
                      </p>
                      <Button asChild className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white">
                        <Link to="/ai-studio/create">
                          Devenir créateur
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Support Client",
                      description: "Assistants pour répondre aux questions fréquentes des clients",
                      icon: MessageSquare,
                      color: "from-blue-500 to-sky-500",
                      count: agents.filter(a => a.objective.toLowerCase().includes("support") || 
                                              a.objective.toLowerCase().includes("client")).length
                    },
                    {
                      name: "Productivité",
                      description: "Agents pour améliorer votre efficacité quotidienne",
                      icon: Zap,
                      color: "from-violet-500 to-purple-500",
                      count: agents.filter(a => a.objective.toLowerCase().includes("productivité") || 
                                              a.objective.toLowerCase().includes("efficacité")).length
                    },
                    {
                      name: "Éducation",
                      description: "Tuteurs virtuels et assistants pédagogiques",
                      icon: Award,
                      color: "from-green-500 to-emerald-500",
                      count: agents.filter(a => a.objective.toLowerCase().includes("éducation") || 
                                              a.objective.toLowerCase().includes("enseignement")).length
                    },
                    {
                      name: "Santé & Bien-être",
                      description: "Agents pour votre santé physique et mentale",
                      icon: Heart,
                      color: "from-red-500 to-rose-500",
                      count: agents.filter(a => a.objective.toLowerCase().includes("santé") || 
                                              a.objective.toLowerCase().includes("bien-être")).length
                    },
                    {
                      name: "Finance",
                      description: "Conseillers financiers et assistants de gestion",
                      icon: BarChart3,
                      color: "from-amber-500 to-orange-500",
                      count: agents.filter(a => a.objective.toLowerCase().includes("finance") || 
                                              a.objective.toLowerCase().includes("financier")).length
                    },
                    {
                      name: "Créativité",
                      description: "Assistants pour stimuler votre créativité",
                      icon: Sparkles,
                      color: "from-pink-500 to-rose-500",
                      count: agents.filter(a => a.objective.toLowerCase().includes("créa") || 
                                              a.objective.toLowerCase().includes("design")).length
                    },
                    {
                      name: "Marketing",
                      description: "Agents spécialisés en marketing et communication",
                      icon: TrendingUp,
                      color: "from-cyan-500 to-blue-500",
                      count: agents.filter(a => a.objective.toLowerCase().includes("marketing") || 
                                              a.objective.toLowerCase().includes("communication")).length
                    },
                    {
                      name: "Développement",
                      description: "Assistants pour les développeurs et programmeurs",
                      icon: BrainCircuit,
                      color: "from-indigo-500 to-blue-600",
                      count: agents.filter(a => a.objective.toLowerCase().includes("développement") || 
                                              a.objective.toLowerCase().includes("code")).length
                    },
                    {
                      name: "Autres",
                      description: "Tous les autres agents spécialisés",
                      icon: Gift,
                      color: "from-slate-500 to-slate-700",
                      count: agents.length - 
                        agents.filter(a => 
                          a.objective.toLowerCase().includes("support") || 
                          a.objective.toLowerCase().includes("client") ||
                          a.objective.toLowerCase().includes("productivité") ||
                          a.objective.toLowerCase().includes("efficacité") ||
                          a.objective.toLowerCase().includes("éducation") ||
                          a.objective.toLowerCase().includes("enseignement") ||
                          a.objective.toLowerCase().includes("santé") ||
                          a.objective.toLowerCase().includes("bien-être") ||
                          a.objective.toLowerCase().includes("finance") ||
                          a.objective.toLowerCase().includes("financier") ||
                          a.objective.toLowerCase().includes("créa") ||
                          a.objective.toLowerCase().includes("design") ||
                          a.objective.toLowerCase().includes("marketing") ||
                          a.objective.toLowerCase().includes("communication") ||
                          a.objective.toLowerCase().includes("développement") ||
                          a.objective.toLowerCase().includes("code")
                        ).length
                    }
                  ].map((category, i) => (
                    <Card 
                      key={i} 
                      className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="h-2 w-full bg-gradient-to-r ${category.color}"></div>
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-4`}>
                          <category.icon size={24} />
                        </div>
                        
                        <CardTitle className="text-xl mb-2">
                          {category.name}
                        </CardTitle>
                        
                        <CardDescription className="mb-4">
                          {category.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-sm">
                            {category.count} agents
                          </Badge>
                        </div>
                        
                        <Button
                          variant="outline"
                          className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-900 dark:text-violet-400 dark:hover:bg-violet-900/20"
                          onClick={() => {
                            setSearchQuery(category.name);
                            setCurrentTab("agents");
                          }}
                        >
                          Explorer
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioMarketplacePage;
