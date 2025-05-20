
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bot, Search, Star, Users, Sparkles, Award, Flame, Bookmark, Clock, Zap, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Agent {
  id: string;
  name: string;
  avatar_style: string;
  objective: string;
  personality: string;
  is_public: boolean;
  is_paid: boolean;
  price: number;
  views: number;
  rating: number;
  created_at: string;
  updated_at: string;
  slug: string;
  user_id: string;
  user?: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
  reviews_count?: number;
  conversations_count?: number;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
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
  
  const categories: { [key: string]: { name: string; icon: React.ReactNode } } = {
    all: { name: "Tous", icon: <Bot className="h-4 w-4" /> },
    productivity: { name: "Productivité", icon: <Zap className="h-4 w-4" /> },
    education: { name: "Éducation", icon: <Award className="h-4 w-4" /> },
    entertainment: { name: "Divertissement", icon: <Sparkles className="h-4 w-4" /> },
    business: { name: "Entreprise", icon: <Users className="h-4 w-4" /> },
  };
  
  // Trending creators mock data - in a real app, this would come from the database
  const trendingCreators = [
    { id: "1", name: "Innovate AI", avatarUrl: "", agentsCount: 12, followerCount: 1243 },
    { id: "2", name: "Education Plus", avatarUrl: "", agentsCount: 8, followerCount: 985 },
    { id: "3", name: "Creative Minds", avatarUrl: "", agentsCount: 15, followerCount: 2142 },
  ];

  useEffect(() => {
    fetchAgents();
  }, [category, sortBy, activeTab]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("ai_agents")
        .select(`
          *,
          user_profiles:user_id(full_name, avatar_url, username)
        `)
        .eq("is_public", true);
      
      // Apply category filter if not "all"
      if (category !== "all") {
        // In a real app, you would have a category field in your table
        // query = query.eq("category", category);
      }
      
      // Apply sorting
      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "popular":
          query = query.order("views", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("views", { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the results to match our Agent type
      const formattedAgents: Agent[] = data.map((agent: any) => ({
        ...agent,
        user: agent.user_profiles,
        // Add some mock stats that would come from joins in a full implementation
        reviews_count: Math.floor(Math.random() * 50),
        conversations_count: Math.floor(Math.random() * 500) + 50,
      }));
      
      // Apply search filter in memory (in a real app, you might want to do this in the database query)
      const filteredAgents = searchQuery
        ? formattedAgents.filter(agent => 
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.objective.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : formattedAgents;
        
      setAgents(filteredAgents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents IA.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAgents();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
              Marketplace des Agents IA
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Découvrez des assistants IA intelligents créés par notre communauté pour améliorer votre productivité et résoudre vos problèmes.
            </p>
          </div>
          
          {/* Main Marketplace Tabs */}
          <Tabs defaultValue="discover" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full max-w-2xl">
                <TabsTrigger value="discover">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Découvrir</span>
                </TabsTrigger>
                <TabsTrigger value="trending">
                  <Flame className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Tendances</span>
                </TabsTrigger>
                <TabsTrigger value="new">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nouveautés</span>
                </TabsTrigger>
                <TabsTrigger value="creators">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Créateurs</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" disabled={!user}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Favoris</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-grow">
                <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Rechercher un agent IA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Rechercher</span>
                  </Button>
                </form>
              </div>
              
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[160px]">
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
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Les plus populaires</SelectItem>
                    <SelectItem value="rating">Mieux notés</SelectItem>
                    <SelectItem value="recent">Plus récents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tab content */}
            <TabsContent value="discover" className="mt-0">
              {/* Stats Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Bot className="h-8 w-8 text-violet-500 mb-2" />
                    <p className="text-2xl font-bold">{loading ? <Skeleton className="w-16 h-8" /> : "2,456"}</p>
                    <p className="text-sm text-slate-500">Agents disponibles</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Users className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{loading ? <Skeleton className="w-16 h-8" /> : "845"}</p>
                    <p className="text-sm text-slate-500">Créateurs actifs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Zap className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-2xl font-bold">{loading ? <Skeleton className="w-16 h-8" /> : "1.2M"}</p>
                    <p className="text-sm text-slate-500">Conversations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Star className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold">{loading ? <Skeleton className="w-16 h-8" /> : "4.8"}</p>
                    <p className="text-sm text-slate-500">Note moyenne</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Agent Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-2 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                              <AvatarFallback>{getAgentAvatar(agent)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <CardDescription className="text-xs">
                                par {agent.user?.full_name || "Créateur anonyme"}
                              </CardDescription>
                            </div>
                          </div>
                          {agent.rating > 0 && (
                            <Badge variant="secondary" className="flex items-center">
                              <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                              {agent.rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {agent.objective}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline">{agent.personality}</Badge>
                          {agent.is_paid && (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button asChild>
                          <Link to={`/ai-studio/chat/${agent.id}`}>
                            Discuter
                          </Link>
                        </Button>
                        <div className="text-xs text-slate-500 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {agent.conversations_count || 0} conversations
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Aucun agent trouvé</h3>
                  <p className="text-slate-500 mb-6">
                    Nous n'avons pas trouvé d'agents IA correspondant à votre recherche.
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setCategory("all");
                    fetchAgents();
                  }}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
              <h2 className="text-2xl font-bold mb-6 text-center">Agents IA populaires cette semaine</h2>
              {/* Similar grid as discover, but with trending agents */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 6)
                    .map((agent) => (
                      <Card key={agent.id} className="overflow-hidden border-2 border-amber-100 dark:border-amber-900 hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="relative pb-2">
                          <Badge className="absolute top-2 right-2 bg-amber-500">
                            <Flame className="h-3 w-3 mr-1" />
                            Tendance
                          </Badge>
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-2 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                              <AvatarFallback>{getAgentAvatar(agent)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <CardDescription className="text-xs">
                                par {agent.user?.full_name || "Créateur anonyme"}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {agent.objective}
                          </p>
                          <div className="flex mt-2 space-x-3 text-xs text-slate-500">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {agent.conversations_count || 0} conversations
                            </div>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {agent.reviews_count || 0} avis
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Button asChild>
                            <Link to={`/ai-studio/chat/${agent.id}`}>
                              Discuter
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <h2 className="text-2xl font-bold mb-6 text-center">Nouveaux Agents IA</h2>
              {/* Similar grid as discover, but with newest agents */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 6)
                    .map((agent) => (
                      <Card key={agent.id} className="overflow-hidden border-2 border-blue-100 dark:border-blue-900 hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="relative pb-2">
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Nouveau
                          </Badge>
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-2 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                              <AvatarFallback>{getAgentAvatar(agent)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <CardDescription className="text-xs">
                                par {agent.user?.full_name || "Créateur anonyme"}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {agent.objective}
                          </p>
                          <div className="flex mt-2">
                            <Badge variant="outline">{agent.personality}</Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Button asChild>
                            <Link to={`/ai-studio/chat/${agent.id}`}>
                              Discuter
                            </Link>
                          </Button>
                          <div className="text-xs text-slate-500">
                            {new Date(agent.created_at).toLocaleDateString()}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="creators" className="mt-0">
              <h2 className="text-2xl font-bold mb-6 text-center">Créateurs Populaires</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {trendingCreators.map((creator) => (
                  <Card key={creator.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="text-center pb-2">
                      <Avatar className="h-16 w-16 mx-auto mb-2">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-600 text-white">
                          {creator.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-lg">{creator.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-4">
                      <div className="flex justify-center space-x-4 text-sm">
                        <div>
                          <p className="font-bold">{creator.agentsCount}</p>
                          <p className="text-xs text-slate-500">Agents</p>
                        </div>
                        <div>
                          <p className="font-bold">{creator.followerCount}</p>
                          <p className="text-xs text-slate-500">Abonnés</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center pt-0">
                      <Button variant="outline" size="sm">
                        Voir le profil
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-0">
              {!user ? (
                <div className="text-center py-12">
                  <Bookmark className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Connectez-vous pour voir vos favoris</h3>
                  <p className="text-slate-500 mb-6">
                    Vous devez être connecté pour ajouter des agents à vos favoris.
                  </p>
                  <Button asChild>
                    <Link to="/auth">Se connecter</Link>
                  </Button>
                </div>
              ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Aucun favori</h3>
                  <p className="text-slate-500 mb-6">
                    Vous n'avez pas encore ajouté d'agents à vos favoris.
                  </p>
                  <Button onClick={() => setActiveTab("discover")}>
                    Découvrir des agents
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioMarketplacePage;
