
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Plus,
  Bot,
  Sparkles,
  MessageSquare,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  Share,
  ExternalLink,
  Search
} from "lucide-react";

const AIStudioDashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    document.title = "Dashboard - LuvviX AI Studio";
    
    if (!user) return;
    
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setAgents(data || []);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer vos agents IA.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, [user, toast]);
  
  const deleteAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("ai_agents")
        .delete()
        .eq("id", agentId);
        
      if (error) throw error;
      
      setAgents(agents.filter(agent => agent.id !== agentId));
      
      toast({
        title: "Agent supprimé",
        description: "Votre agent IA a été supprimé avec succès."
      });
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cet agent IA.",
        variant: "destructive"
      });
    }
  };
  
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gradient-to-b from-slate-900 to-slate-950 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">
                LuvviX AI Studio
              </h1>
              <p className="text-slate-400">
                Gérez et créez vos agents IA personnalisés
              </p>
            </div>
            
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300" asChild>
              <Link to="/ai-studio/create" className="flex items-center gap-2 py-6 px-5">
                <Plus size={18} /> Créer un agent IA
              </Link>
            </Button>
          </div>
          
          <div className="mb-8">
            <div className="relative flex-grow max-w-md mx-auto md:mx-0">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300 shadow-lg"
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="bg-slate-800/30 backdrop-blur-md rounded-xl p-1 border border-slate-700/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg">Tous</TabsTrigger>
              <TabsTrigger value="public" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg">Publics</TabsTrigger>
              <TabsTrigger value="private" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg">Privés</TabsTrigger>
              <TabsTrigger value="paid" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg">Payants</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden bg-slate-800/20 backdrop-blur-md border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-500">
                      <div className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2 bg-slate-700" />
                        <Skeleton className="h-4 w-full bg-slate-700" />
                      </div>
                      <div className="p-6 border-t border-slate-700/50">
                        <Skeleton className="h-24 w-full mb-4 bg-slate-700" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-1/3 bg-slate-700" />
                          <Skeleton className="h-4 w-1/3 bg-slate-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden border-slate-700/50 bg-slate-800/20 backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 rounded-xl group">
                      <div className={`h-1 w-full ${agent.is_public ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-violet-400 to-indigo-500'}`}></div>
                      <CardHeader className="p-6">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-bold text-slate-200">{agent.name}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-slate-800 border border-slate-700 shadow-xl">
                              <DropdownMenuItem asChild className="hover:bg-slate-700">
                                <Link to={`/ai-studio/edit/${agent.id}`} className="flex items-center text-slate-200">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Modifier</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="hover:bg-slate-700">
                                <Link to={`/ai-studio/chat/${agent.id}`} className="flex items-center text-slate-200">
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  <span>Discuter</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem
                                onClick={() => deleteAgent(agent.id)}
                                className="text-red-400 focus:text-red-400 hover:bg-red-950/30 hover:text-red-300"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription className="text-slate-400">
                          {agent.objective.substring(0, 100)}{agent.objective.length > 100 ? '...' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="flex items-center text-slate-400 text-sm space-x-4">
                          <div className="flex items-center">
                            <Bot className="h-4 w-4 mr-1 text-violet-400" />
                            <span>{agent.personality}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-blue-400" />
                            <span>{agent.views || 0} vues</span>
                          </div>
                          {agent.is_paid && (
                            <div className="text-emerald-400 flex items-center font-medium">
                              <span>{agent.price}€</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-6 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 transition-colors duration-300"
                        >
                          <Link to={`/ai-studio/chat/${agent.id}`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Discuter
                          </Link>
                        </Button>
                        {agent.is_public ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                          >
                            <Link to={`/ai-studio/agents/${agent.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Voir public
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                          >
                            <Link to={`/ai-studio/edit/${agent.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-lg">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-slate-700/50 mb-6">
                    <Bot className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-200 mb-2">
                    Aucun agent IA trouvé
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {searchQuery ? 
                      "Aucun agent ne correspond à votre recherche." : 
                      "Vous n'avez pas encore créé d'agent IA. Commencez maintenant !"}
                  </p>
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300" asChild>
                    <Link to="/ai-studio/create" className="flex items-center gap-2 py-2">
                      <Sparkles className="h-4 w-4" /> Créer mon premier agent
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="public" className="mt-6">
              {/* Structure similaire à l'onglet "all" avec les mêmes améliorations visuelles */}
              {!loading && filteredAgents.filter(agent => agent.is_public).length === 0 && (
                <div className="text-center p-12 bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-lg">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-slate-700/50 mb-6">
                    <Share className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-200 mb-2">
                    Aucun agent public
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Rendez un agent public pour le partager avec le monde entier.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="private" className="mt-6">
              {/* Structure similaire à l'onglet "public" */}
              {!loading && filteredAgents.filter(agent => !agent.is_public).length === 0 && (
                <div className="text-center p-12 bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-lg">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-slate-700/50 mb-6">
                    <Bot className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-200 mb-2">
                    Aucun agent privé
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Les agents privés ne sont visibles que par vous.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="paid" className="mt-6">
              {/* Structure similaire aux autres onglets */}
              {!loading && filteredAgents.filter(agent => agent.is_paid).length === 0 && (
                <div className="text-center p-12 bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-lg">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-slate-700/50 mb-6">
                    <Bot className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-200 mb-2">
                    Aucun agent payant
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Créez un agent payant pour monétiser votre expertise.
                  </p>
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

export default AIStudioDashboardPage;
