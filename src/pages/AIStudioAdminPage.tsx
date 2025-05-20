
import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast"; // Fixed import path
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Activity,
  Settings,
  Users,
  Bot,
  Database,
  Save,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Define the interface for the config object to include the id property
interface AdminConfig {
  id?: string; // Make id optional since it might not exist for new configs
  endpoint_url: string;
  api_key: string;
  model_name: string;
  quota_per_user: number;
  max_tokens: number;
  provider?: string; // Ajouter le fournisseur d'API (OpenAI, Cerebras, etc.)
}

const AIStudioAdminPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Update the state type to use our AdminConfig interface
  const [config, setConfig] = useState<AdminConfig>({
    endpoint_url: "https://api.cerebras.ai/v1/completions",
    api_key: "",
    model_name: "cerebras/Cerebras-GPT-4.5-8B-Base",
    quota_per_user: 100,
    max_tokens: 2000,
    provider: "cerebras",
  });
  
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalUsers: 0,
    totalMessages: 0,
  });
  
  const [agentStats, setAgentStats] = useState<any[]>([]);
  
  useEffect(() => {
    document.title = "Admin - LuvviX AI Studio";
    
    const checkToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("admin_tokens")
          .select("*")
          .eq("token", token)
          .single();
          
        if (error || !data) {
          throw new Error("Token invalide");
        }
        
        setAuthenticated(true);
        
        // Fetch admin configuration
        const { data: configData, error: configError } = await supabase
          .from("ai_admin_config")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1);
          
        if (configError) throw configError;
        
        if (configData && configData.length > 0) {
          setConfig(configData[0]);
        }
        
        // Fetch statistics
        await fetchStatistics();
      } catch (error) {
        console.error("Error authenticating:", error);
        toast({
          title: "Erreur d'authentification",
          description: "Token d'accès invalide ou expiré.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkToken();
  }, [token, toast]);
  
  const fetchStatistics = async () => {
    try {
      setRefreshing(true);
      
      // Get total agents count
      const { count: agentsCount, error: agentsError } = await supabase
        .from("ai_agents")
        .select("*", { count: "exact", head: true });
        
      // Get total active agents (with views > 0)
      const { count: activeAgentsCount, error: activeAgentsError } = await supabase
        .from("ai_agents")
        .select("*", { count: "exact", head: true })
        .gt("views", 0);
        
      // Get total users with agents
      const { count: usersCount, error: usersError } = await supabase
        .from("ai_agents")
        .select("user_id", { count: "exact", head: true })
        .limit(1);
        
      // Get total messages
      const { count: messagesCount, error: messagesError } = await supabase
        .from("ai_messages")
        .select("*", { count: "exact", head: true });
        
      // Get top agents by views
      const { data: topAgents, error: topAgentsError } = await supabase
        .from("ai_agents")
        .select("id, name, views, user_id, is_public, is_paid")
        .order("views", { ascending: false })
        .limit(10);
        
      if (agentsError || activeAgentsError || usersError || messagesError || topAgentsError) {
        throw new Error("Erreur lors de la récupération des statistiques");
      }
      
      setStats({
        totalAgents: agentsCount || 0,
        activeAgents: activeAgentsCount || 0,
        totalUsers: usersCount || 0,
        totalMessages: messagesCount || 0,
      });
      
      setAgentStats(topAgents || []);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les statistiques.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  const saveConfig = async () => {
    try {
      setSaving(true);
      
      // Check if config exists
      const { count, error: countError } = await supabase
        .from("ai_admin_config")
        .select("*", { count: "exact", head: true });
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        // Update existing config
        const { error } = await supabase
          .from("ai_admin_config")
          .update({
            endpoint_url: config.endpoint_url,
            api_key: config.api_key,
            model_name: config.model_name,
            quota_per_user: config.quota_per_user,
            max_tokens: config.max_tokens,
            provider: config.provider
          })
          .eq("id", config.id || ''); // Now TypeScript knows id is allowed
          
        if (error) throw error;
      } else {
        // Insert new config
        const { error } = await supabase
          .from("ai_admin_config")
          .insert({
            endpoint_url: config.endpoint_url,
            api_key: config.api_key,
            model_name: config.model_name,
            quota_per_user: config.quota_per_user,
            max_tokens: config.max_tokens,
            provider: config.provider
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres ont été mis à jour avec succès.",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // If not authenticated and not loading, redirect
  if (!authenticated && !loading) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-8 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-96 w-full mt-8" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-violet-600" />
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Administration LuvviX AI Studio
                  </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  Gérez les paramètres et surveillez l'activité de LuvviX AI Studio
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={fetchStatistics}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Rafraîchir
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Agents créés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.totalAgents}
                    </div>
                    <Bot className="h-8 w-8 text-violet-600 opacity-70" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Agents actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.activeAgents}
                    </div>
                    <Activity className="h-8 w-8 text-green-600 opacity-70" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.totalUsers}
                    </div>
                    <Users className="h-8 w-8 text-blue-600 opacity-70" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Messages échangés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.totalMessages}
                    </div>
                    <Database className="h-8 w-8 text-orange-600 opacity-70" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="agents">
              <TabsList className="grid grid-cols-2 w-[400px] mb-8">
                <TabsTrigger value="agents">Statistiques</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="agents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 des agents IA</CardTitle>
                    <CardDescription>
                      Agents les plus populaires classés par nombre de vues
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {agentStats.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Nom</TableHead>
                              <TableHead className="text-center">Public</TableHead>
                              <TableHead className="text-center">Payant</TableHead>
                              <TableHead className="text-right">Vues</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {agentStats.map((agent) => (
                              <TableRow key={agent.id}>
                                <TableCell className="font-mono text-xs">
                                  {agent.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="font-medium">{agent.name}</TableCell>
                                <TableCell className="text-center">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full ${
                                      agent.is_public
                                        ? "bg-green-500"
                                        : "bg-slate-300 dark:bg-slate-600"
                                    }`}
                                  ></span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full ${
                                      agent.is_paid
                                        ? "bg-blue-500"
                                        : "bg-slate-300 dark:bg-slate-600"
                                    }`}
                                  ></span>
                                </TableCell>
                                <TableCell className="text-right">
                                  {agent.views}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        Aucun agent avec des statistiques disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="config" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration API</CardTitle>
                    <CardDescription>
                      Paramètres de connexion à l'API Cerebras pour l'intelligence artificielle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        Fournisseur d'API
                      </label>
                      <Input
                        value={config.provider || "cerebras"}
                        onChange={(e) =>
                          setConfig({ ...config, provider: e.target.value })
                        }
                        placeholder="cerebras"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Nom du fournisseur d'API (cerebras, openai, etc.)
                      </p>
                    </div>
                  
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        URL de l'API
                      </label>
                      <Input
                        value={config.endpoint_url}
                        onChange={(e) =>
                          setConfig({ ...config, endpoint_url: e.target.value })
                        }
                        placeholder="https://api.cerebras.ai/v1/completions"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Endpoint complet pour les appels d'API
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        Clé d'API
                      </label>
                      <Input
                        type="password"
                        value={config.api_key}
                        onChange={(e) =>
                          setConfig({ ...config, api_key: e.target.value })
                        }
                        placeholder="csk-..."
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Clé secrète pour l'authentification API Cerebras
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">
                        Nom du modèle
                      </label>
                      <Input
                        value={config.model_name}
                        onChange={(e) =>
                          setConfig({ ...config, model_name: e.target.value })
                        }
                        placeholder="cerebras/Cerebras-GPT-4.5-8B-Base"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Nom du modèle d'IA à utiliser pour les requêtes
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">
                          Quota par utilisateur
                        </label>
                        <Input
                          type="number"
                          value={config.quota_per_user}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              quota_per_user: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          step="1"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Nombre maximal de messages par utilisateur et par jour
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">
                          Taille maximale de réponse
                        </label>
                        <Input
                          type="number"
                          value={config.max_tokens}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              max_tokens: parseInt(e.target.value),
                            })
                          }
                          min="100"
                          step="100"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Nombre maximal de tokens pour chaque réponse générée
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={saveConfig}
                      disabled={saving}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Enregistrer les paramètres
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default AIStudioAdminPage;
