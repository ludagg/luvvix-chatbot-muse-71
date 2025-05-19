
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
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Bot,
  Search,
  Filter,
  Star,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import PopularAgents from "@/components/ai-studio/PopularAgents";

const AIStudioMarketplacePage = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("views");
  const [featuredAgents, setFeaturedAgents] = useState<any[]>([]);
  const [creators, setCreators] = useState<any>({});
  
  useEffect(() => {
    document.title = "Marketplace - LuvviX AI Studio";
    
    const fetchAgents = async () => {
      try {
        // Fetch regular agents
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*, user_id")
          .eq("is_public", true)
          .order(sortBy, { ascending: false });
          
        if (error) throw error;
        
        // Fetch featured agents
        const { data: featuredData, error: featuredError } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("is_public", true)
          .order("rating", { ascending: false })
          .limit(4);
          
        if (featuredError) throw featuredError;
        
        // Get unique creator IDs from all agents
        const creatorIds = [...new Set([
          ...(data?.map(agent => agent.user_id) || []),
          ...(featuredData?.map(agent => agent.user_id) || [])
        ])];
        
        // Fetch creator profiles
        if (creatorIds.length > 0) {
          const { data: creatorsData, error: creatorsError } = await supabase
            .from("user_profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", creatorIds);
            
          if (creatorsError) throw creatorsError;
          
          // Create creators lookup object
          const creatorsMap = {};
          creatorsData?.forEach(creator => {
            creatorsMap[creator.id] = creator;
          });
          
          setCreators(creatorsMap);
        }
        
        setAgents(data || []);
        setFeaturedAgents(featuredData || []);
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, [sortBy]);
  
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
  
  const getCreatorName = (userId: string) => {
    const creator = creators[userId];
    if (!creator) return "Créateur anonyme";
    return creator.username || creator.full_name || "Créateur anonyme";
  };
  
  const filteredAgents = agents.filter(agent => {
    // Filter by search query
    if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !agent.objective.toLowerCase().includes(searchQuery.toLowerCase())) {
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

  return (
    <TooltipProvider>
      <div className="pt-24 flex-1">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-grow bg-slate-50 dark:bg-slate-900 py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-center">
                  Marketplace d'agents IA
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl text-center mb-8">
                  Découvrez et utilisez des agents IA spécialisés créés par la communauté
                </p>
                
                <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      placeholder="Rechercher un agent..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Filtrer par</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les agents</SelectItem>
                      <SelectItem value="free">Gratuits</SelectItem>
                      <SelectItem value="paid">Payants</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48">
                      <div className="flex items-center">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        <span>Trier par</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="views">
                        <div className="flex items-center">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Popularité
                        </div>
                      </SelectItem>
                      <SelectItem value="rating">
                        <div className="flex items-center">
                          <Award className="mr-2 h-4 w-4" />
                          Évaluation
                        </div>
                      </SelectItem>
                      <SelectItem value="created_at">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Les plus récents
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Featured Agents Section */}
              {!loading && featuredAgents.length > 0 && !searchQuery && category === 'all' && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">
                    Agents en vedette
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredAgents.map((agent) => (
                      <Card key={agent.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start">
                            <Avatar className="mr-3 h-10 w-10 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                              <AvatarFallback>
                                {getAvatarIcon(agent.avatar_style)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="mb-1">{agent.name}</CardTitle>
                              <CardDescription>
                                {agent.personality === "expert" && "Expert"}
                                {agent.personality === "friendly" && "Amical"}
                                {agent.personality === "concise" && "Concis"}
                                {agent.personality === "empathetic" && "Empathique"}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-3 text-slate-600 dark:text-slate-300">
                            {agent.objective}
                          </p>
                          
                          <div className="flex items-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center mr-4">
                              <Star className="h-4 w-4 mr-1 text-amber-500" />
                              <span>{(agent.rating || 0).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>{agent.views || 0} vues</span>
                            </div>
                            {agent.is_paid && (
                              <div className="ml-auto font-medium text-green-600">
                                {agent.price}€
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 text-xs">
                            <Link 
                              to={`/ai-studio/creators/${agent.user_id}`} 
                              className="text-violet-600 hover:underline flex items-center"
                            >
                              {creators[agent.user_id]?.avatar_url && (
                                <Avatar className="h-4 w-4 mr-1">
                                  <AvatarImage src={creators[agent.user_id]?.avatar_url} />
                                  <AvatarFallback>{getCreatorName(agent.user_id).charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                              {getCreatorName(agent.user_id)}
                            </Link>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
                            <Link to={`/ai-studio/agents/${agent.id}`}>
                              Voir et discuter
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
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
              ) : filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start">
                          <Avatar className="mr-3 h-10 w-10 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                            <AvatarFallback>
                              {getAvatarIcon(agent.avatar_style)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="mb-1">{agent.name}</CardTitle>
                            <CardDescription>
                              {agent.personality === "expert" && "Expert"}
                              {agent.personality === "friendly" && "Amical"}
                              {agent.personality === "concise" && "Concis"}
                              {agent.personality === "empathetic" && "Empathique"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-slate-600 dark:text-slate-300">
                          {agent.objective}
                        </p>
                        
                        <div className="flex items-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center mr-4">
                            <Star className="h-4 w-4 mr-1 text-amber-500" />
                            <span>{(agent.rating || 0).toFixed(1)}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{agent.views || 0} vues</span>
                          </div>
                          {agent.is_paid && (
                            <div className="ml-auto font-medium text-green-600">
                              {agent.price}€
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 text-xs">
                          <Link 
                            to={`/ai-studio/creators/${agent.user_id}`} 
                            className="text-violet-600 hover:underline flex items-center"
                          >
                            {creators[agent.user_id]?.avatar_url && (
                              <Avatar className="h-4 w-4 mr-1">
                                <AvatarImage src={creators[agent.user_id]?.avatar_url} />
                                <AvatarFallback>{getCreatorName(agent.user_id).charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            {getCreatorName(agent.user_id)}
                          </Link>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
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
                  <Button asChild className="bg-violet-600 hover:bg-violet-700">
                    <Link to="/ai-studio">
                      Retour à l'accueil
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AIStudioMarketplacePage;
