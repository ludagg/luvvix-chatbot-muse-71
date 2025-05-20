
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
      <div className="pt-24 flex-1">
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                LuvviX AI Studio
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Gérez et créez vos agents IA personnalisés
              </p>
            </div>
            
            <Button className="bg-violet-600 hover:bg-violet-700" asChild>
              <Link to="/ai-studio/create">
                <Plus size={18} className="mr-2" /> Créer un agent IA
              </Link>
            </Button>
          </div>
          
          <div className="mb-8 flex items-center">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="public">Publics</TabsTrigger>
              <TabsTrigger value="private">Privés</TabsTrigger>
              <TabsTrigger value="paid">Payants</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border border-slate-200 dark:border-slate-700">
                      <CardHeader className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-24 w-full mb-4" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className={`h-2 w-full bg-${agent.is_public ? 'green' : 'violet'}-500`}></div>
                      <CardHeader className="p-6">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-bold">{agent.name}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link to={`/ai-studio/edit/${agent.id}`} className="flex items-center">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Modifier</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/ai-studio/chat/${agent.id}`} className="flex items-center">
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  <span>Discuter</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteAgent(agent.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Supprimer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription>
                          {agent.objective.substring(0, 100)}{agent.objective.length > 100 ? '...' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm space-x-4">
                          <div className="flex items-center">
                            <Bot className="h-4 w-4 mr-1" />
                            <span>{agent.personality}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{agent.views || 0} vues</span>
                          </div>
                          {agent.is_paid && (
                            <div className="text-green-600 flex items-center">
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
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Bot className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                    Aucun agent IA trouvé
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {searchQuery ? 
                      "Aucun agent ne correspond à votre recherche." : 
                      "Vous n'avez pas encore créé d'agent IA. Commencez maintenant !"}
                  </p>
                  <Button className="bg-violet-600 hover:bg-violet-700" asChild>
                    <Link to="/ai-studio/create">
                      <Sparkles className="h-4 w-4 mr-2" /> Créer mon premier agent
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="public" className="mt-6">
              {loading ? (
                // Similar loading skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border border-slate-200 dark:border-slate-700">
                      <CardHeader className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-24 w-full mb-4" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgents
                    .filter(agent => agent.is_public)
                    .map((agent) => (
                      <Card key={agent.id} className="overflow-hidden border border-slate-200 dark:border-slate-700">
                        {/* Same card structure as above */}
                        <div className="h-2 w-full bg-green-500"></div>
                        <CardHeader className="p-6">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl font-bold">{agent.name}</CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link to={`/ai-studio/edit/${agent.id}`} className="flex items-center">
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Modifier</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/ai-studio/chat/${agent.id}`} className="flex items-center">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    <span>Discuter</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteAgent(agent.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Supprimer</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardDescription>
                            {agent.objective.substring(0, 100)}{agent.objective.length > 100 ? '...' : ''}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm space-x-4">
                            <div className="flex items-center">
                              <Bot className="h-4 w-4 mr-1" />
                              <span>{agent.personality}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{agent.views || 0} vues</span>
                            </div>
                            {agent.is_paid && (
                              <div className="text-green-600 flex items-center">
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
                          >
                            <Link to={`/ai-studio/chat/${agent.id}`}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Discuter
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link to={`/ai-studio/agents/${agent.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Voir public
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
              {!loading && filteredAgents.filter(agent => agent.is_public).length === 0 && (
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Share className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                    Aucun agent public
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Rendez un agent public pour le partager avec le monde entier.
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Similar structure for private and paid tabs */}
            <TabsContent value="private" className="mt-6">
              {/* Similar structure to public tab */}
              {!loading && filteredAgents.filter(agent => !agent.is_public).length === 0 && (
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Bot className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                    Aucun agent privé
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Les agents privés ne sont visibles que par vous.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="paid" className="mt-6">
              {/* Similar structure to public tab */}
              {!loading && filteredAgents.filter(agent => agent.is_paid).length === 0 && (
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Bot className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                    Aucun agent payant
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Créez un agent payant pour monétiser votre expertise.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div></div>
  );
};

export default AIStudioDashboardPage;
