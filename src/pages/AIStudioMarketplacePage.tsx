import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FavoriteButton from "@/components/ai-studio/FavoriteButton";
import FollowButton from "@/components/ai-studio/FollowButton";
import {
  Bot,
  Search,
  Filter,
  Star,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const AIStudioMarketplacePage = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Marketplace - LuvviX AI Studio";
    
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("is_public", true)
          .order("views", { ascending: false });
          
        if (error) throw error;
        
        setAgents(data || []);
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
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
  
  const getAvatarColor = (avatarStyle: string) => {
    switch (avatarStyle) {
      case "bot":
        return "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300";
      case "sparkles":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300";
    }
  };
  
  const getAgentInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Marketplace d'agents IA
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl text-center mb-8">
              Découvrez et utilisez des agents IA sp��cialisés créés par la communauté
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
            </div>
          </div>
          
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
                <Card key={agent.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className={`${getAvatarColor(agent.avatar_style)}`}>
                          <AvatarFallback>{getAgentInitial(agent.name)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          <p className="text-sm text-gray-500">{agent.personality}</p>
                        </div>
                      </div>
                      <FavoriteButton agentId={agent.id} />
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
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <FollowButton creatorId={agent.user_id} size="sm" />
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/ai-studio/agent/${agent.slug || agent.id}`)}
                    >
                      Voir l'agent
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
  );
};

export default AIStudioMarketplacePage;
