import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, Sparkles, Code2, FileText, Upload, Plus, Trash2, Save, Settings2, MessageSquare } from "lucide-react";
import EmbedCodeGenerator from "@/components/ai-studio/EmbedCodeGenerator";

// Define an interface for the parameters object to help TypeScript
interface AgentParameters {
  system_prompt?: string;
  [key: string]: any;
}

const AIStudioEditAgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [contextFiles, setContextFiles] = useState<any[]>([]);
  const [uploadingContext, setUploadingContext] = useState(false);

  // Form state
  const [formState, setFormState] = useState({
    name: "",
    objective: "",
    personality: "expert",
    avatar_style: "bot",
    is_public: false,
    is_paid: false,
    price: "0",
    system_prompt: ""
  });
  
  // Context input states
  const [contextText, setContextText] = useState("");
  const [contextUrl, setContextUrl] = useState("");
  
  useEffect(() => {
    const fetchAgent = async () => {
      if (!user || !agentId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("id", agentId)
          .single();
          
        if (error) {
          setNotFound(true);
          return;
        }
        
        if (data.user_id !== user.id) {
          setUnauthorized(true);
          return;
        }
        
        setAgent(data);
        
        // Safely access parameters by ensuring it's an object and casting to our interface
        const parameters = (typeof data.parameters === 'object' ? data.parameters : {}) as AgentParameters;
        
        setFormState({
          name: data.name || "",
          objective: data.objective || "",
          personality: data.personality || "expert",
          avatar_style: data.avatar_style || "bot",
          is_public: data.is_public || false,
          is_paid: data.is_paid || false,
          price: data.price?.toString() || "0",
          system_prompt: parameters.system_prompt || ""
        });
        
        // Fetch context files/documents
        fetchContextFiles(data.id);
      } catch (error) {
        console.error("Error fetching agent:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données de l'agent IA."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId, user]);
  
  const fetchContextFiles = async (agentId: string) => {
    try {
      const { data, error } = await supabase
        .from("ai_agent_context")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setContextFiles(data || []);
    } catch (error) {
      console.error("Error fetching context files:", error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, value: boolean) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddContextText = async () => {
    if (!contextText.trim()) {
      toast({
        variant: "destructive",
        title: "Texte requis",
        description: "Veuillez entrer du texte pour ajouter au contexte."
      });
      return;
    }
    
    try {
      setUploadingContext(true);
      
      const { error } = await supabase
        .from("ai_agent_context")
        .insert({
          agent_id: agentId,
          content_type: "text",
          content: contextText
        });
        
      if (error) throw error;
      
      toast({
        title: "Contexte ajouté",
        description: "Le texte a été ajouté au contexte de l'agent."
      });
      
      setContextText("");
      fetchContextFiles(agentId as string);
    } catch (error) {
      console.error("Error adding context:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le contexte à l'agent."
      });
    } finally {
      setUploadingContext(false);
    }
  };
  
  const handleAddContextUrl = async () => {
    if (!contextUrl.trim() || !contextUrl.startsWith("http")) {
      toast({
        variant: "destructive",
        title: "URL invalide",
        description: "Veuillez entrer une URL valide commençant par http:// ou https://"
      });
      return;
    }
    
    try {
      setUploadingContext(true);
      
      const { error } = await supabase
        .from("ai_agent_context")
        .insert({
          agent_id: agentId,
          content_type: "url",
          url: contextUrl
        });
        
      if (error) throw error;
      
      toast({
        title: "URL ajoutée",
        description: "L'URL a été ajoutée au contexte de l'agent."
      });
      
      setContextUrl("");
      fetchContextFiles(agentId as string);
    } catch (error) {
      console.error("Error adding URL context:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter l'URL au contexte de l'agent."
      });
    } finally {
      setUploadingContext(false);
    }
  };
  
  const handleDeleteContext = async (contextId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier de contexte ?")) return;
    
    try {
      const { error } = await supabase
        .from("ai_agent_context")
        .delete()
        .eq("id", contextId);
        
      if (error) throw error;
      
      toast({
        title: "Fichier supprimé",
        description: "Le fichier de contexte a été supprimé avec succès."
      });
      
      fetchContextFiles(agentId as string);
    } catch (error) {
      console.error("Error deleting context:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fichier de contexte."
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formState.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom de l'agent est requis."
      });
      return;
    }
    
    if (!formState.objective.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur", 
        description: "L'objectif de l'agent est requis."
      });
      return;
    }
    
    // If agent is paid, validate price
    if (formState.is_paid) {
      const price = parseFloat(formState.price);
      if (isNaN(price) || price <= 0) {
        toast({
          variant: "destructive",
          title: "Prix invalide",
          description: "Veuillez entrer un prix valide supérieur à 0."
        });
        return;
      }
    }
    
    try {
      setSaving(true);
      
      // Safely create the updated parameters object by ensuring the original parameters is an object
      const currentParameters = (typeof agent?.parameters === 'object' ? agent?.parameters : {}) as AgentParameters;
      const updatedParameters: AgentParameters = {
        ...currentParameters,
        system_prompt: formState.system_prompt
      };
      
      const { error } = await supabase
        .from("ai_agents")
        .update({
          name: formState.name,
          objective: formState.objective,
          personality: formState.personality,
          avatar_style: formState.avatar_style,
          is_public: formState.is_public,
          is_paid: formState.is_paid,
          price: formState.is_paid ? parseFloat(formState.price) : 0,
          parameters: updatedParameters,
          updated_at: new Date().toISOString()
        })
        .eq("id", agentId);
        
      if (error) throw error;
      
      toast({
        title: "Agent mis à jour",
        description: "Les modifications ont été enregistrées avec succès."
      });
      
      // Refetch agent data to update the view
      const { data } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("id", agentId)
        .single();
        
      setAgent(data);
    } catch (error) {
      console.error("Error updating agent:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'agent IA."
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (notFound) {
    return <Navigate to="/ai-studio/dashboard" />;
  }
  
  if (unauthorized) {
    return <Navigate to="/ai-studio/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Modifier l'agent : {agent?.name}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Personnalisez les capacités et le comportement de votre agent IA
                  </p>
                </div>
                
                <div className="flex gap-4 flex-wrap">
                  <Button 
                    variant="outline"
                    asChild
                  >
                    <a href={`/ai-studio/chat/${agentId}`} target="_blank" rel="noreferrer">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Tester l'agent
                    </a>
                  </Button>
                  
                  <Button
                    onClick={() => navigate("/ai-studio/dashboard")}
                    variant="secondary"
                  >
                    Retour au dashboard
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="general">
                <TabsList className="mb-8">
                  <TabsTrigger value="general">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Général 
                  </TabsTrigger>
                  <TabsTrigger value="context">
                    <FileText className="h-4 w-4 mr-2" />
                    Contexte
                  </TabsTrigger>
                  <TabsTrigger value="integration">
                    <Code2 className="h-4 w-4 mr-2" />
                    Intégration
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Informations de base</CardTitle>
                          <CardDescription>
                            Définissez l'identité de votre assistant IA
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nom de l'agent</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formState.name}
                              onChange={handleInputChange}
                              placeholder="Ex: Assistant Marketing LuvviX"
                              className="w-full"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="objective">Objectif / Description</Label>
                            <Textarea
                              id="objective"
                              name="objective"
                              value={formState.objective}
                              onChange={handleInputChange}
                              placeholder="Ex: Cet assistant aide à créer des stratégies marketing et des campagnes publicitaires efficaces."
                              rows={4}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="avatar_style">Style d'avatar</Label>
                            <Select
                              value={formState.avatar_style}
                              onValueChange={(value) => handleSelectChange("avatar_style", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir un style d'avatar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bot">
                                  <div className="flex items-center">
                                    <div className="bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                                      <Bot className="h-3 w-3" />
                                    </div>
                                    Robot
                                  </div>
                                </SelectItem>
                                <SelectItem value="sparkles">
                                  <div className="flex items-center">
                                    <div className="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                                      <Sparkles className="h-3 w-3" />
                                    </div>
                                    Étincelles
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Comportement et personnalité</CardTitle>
                          <CardDescription>
                            Déterminez comment votre agent communique avec les utilisateurs
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="personality">Type de personnalité</Label>
                            <Select
                              value={formState.personality}
                              onValueChange={(value) => handleSelectChange("personality", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir une personnalité" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="expert">Expert (formel et précis)</SelectItem>
                                <SelectItem value="friendly">Amical (chaleureux et décontracté)</SelectItem>
                                <SelectItem value="concise">Concis (direct et efficace)</SelectItem>
                                <SelectItem value="empathetic">Empathique (compréhensif et attentif)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="system_prompt">Prompt système (avancé)</Label>
                            <Textarea
                              id="system_prompt"
                              name="system_prompt"
                              value={formState.system_prompt}
                              onChange={handleInputChange}
                              placeholder="Instructions spécifiques pour votre agent (laissez vide pour utiliser les paramètres standards)"
                              rows={6}
                              className="w-full"
                            />
                            <p className="text-xs text-slate-500">
                              Personnalisez les instructions données à l'IA. Si laissé vide, un prompt sera généré automatiquement en fonction des autres paramètres.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Publication et monétisation</CardTitle>
                        <CardDescription>
                          Gérez la visibilité et les options de monétisation de votre agent
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="is_public" className="text-base font-medium">Agent public</Label>
                            <p className="text-sm text-slate-500 mt-1">
                              Rendre cet agent accessible dans le marketplace pour les autres utilisateurs
                            </p>
                          </div>
                          <Switch
                            id="is_public"
                            checked={formState.is_public}
                            onCheckedChange={(checked) => handleSwitchChange("is_public", checked)}
                          />
                        </div>
                        
                        {formState.is_public && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div>
                              <Label htmlFor="is_paid" className="text-base font-medium">Agent payant</Label>
                              <p className="text-sm text-slate-500 mt-1">
                                Demander un paiement pour l'utilisation de cet agent
                              </p>
                            </div>
                            <Switch
                              id="is_paid"
                              checked={formState.is_paid}
                              onCheckedChange={(checked) => handleSwitchChange("is_paid", checked)}
                            />
                          </div>
                        )}
                        
                        {formState.is_public && formState.is_paid && (
                          <div className="mt-4 pt-4 border-t">
                            <Label htmlFor="price">Prix (€)</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              min="0.99"
                              step="0.01"
                              value={formState.price}
                              onChange={handleInputChange}
                              className="max-w-[200px] mt-2"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Prix en euros (minimum 0,99 €)
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                        size="lg"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Enregistrer les modifications
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="context">
                  <div className="space-y-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ajouter du contexte</CardTitle>
                        <CardDescription>
                          Fournissez des données et des connaissances à votre agent IA
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="border rounded-md p-4 bg-white dark:bg-slate-800">
                          <h3 className="font-medium mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-slate-500" />
                            Ajouter du texte
                          </h3>
                          <Textarea
                            value={contextText}
                            onChange={(e) => setContextText(e.target.value)}
                            placeholder="Collez ici du texte pour ajouter au contexte de l'agent..."
                            rows={5}
                            className="w-full mb-4"
                          />
                          <Button
                            onClick={handleAddContextText}
                            disabled={uploadingContext || !contextText.trim()}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                          >
                            {uploadingContext ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Ajouter au contexte
                          </Button>
                        </div>
                        
                        <div className="border rounded-md p-4 bg-white dark:bg-slate-800">
                          <h3 className="font-medium mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-slate-500" />
                            Ajouter une URL
                          </h3>
                          <Input
                            value={contextUrl}
                            onChange={(e) => setContextUrl(e.target.value)}
                            placeholder="https://exemple.com/votre-page"
                            className="w-full mb-4"
                          />
                          <Button
                            onClick={handleAddContextUrl}
                            disabled={uploadingContext || !contextUrl.trim()}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                          >
                            {uploadingContext ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Ajouter l'URL au contexte
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Contexte actuel</CardTitle>
                        <CardDescription>
                          Données et connaissances ajoutées à votre agent
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        {contextFiles.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Aucun fichier de contexte ajouté</p>
                            <p className="text-sm">Ajoutez du texte ou des URLs pour enrichir les connaissances de votre agent</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {contextFiles.map((file) => (
                              <div 
                                key={file.id} 
                                className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-slate-800"
                              >
                                <div className="flex items-center">
                                  {file.content_type === "text" ? (
                                    <FileText className="h-5 w-5 mr-3 text-blue-500" />
                                  ) : (
                                    <div className="h-5 w-5 mr-3 text-green-500">🔗</div>
                                  )}
                                  
                                  <div className="overflow-hidden">
                                    {file.content_type === "text" ? (
                                      <div className="font-medium">Document texte</div>
                                    ) : (
                                      <div className="font-medium truncate max-w-xs">{file.url}</div>
                                    )}
                                    <div className="text-xs text-slate-500">
                                      Ajouté le {new Date(file.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteContext(file.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="integration">
                  {agent && (
                    <EmbedCodeGenerator 
                      agentId={agent.id}
                      agentName={agent.name}
                      isPublic={agent.is_public}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioEditAgentPage;
