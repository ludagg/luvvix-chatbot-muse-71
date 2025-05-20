
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, Share, Info, Star, Users, Calendar, Code, BookOpen, ExternalLink, Copy, Download, BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";
import EmbedCodeGenerator from "@/components/ai-studio/EmbedCodeGenerator";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AIStudioAgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*, user_profiles(*)")
          .eq("id", agentId)
          .single();
          
        if (error) throw error;
        
        if (!data.is_public) {
          throw new Error("Cet agent n'est pas public");
        }
        
        setAgent(data);
        
        // Incrémenter directement la vue dans la table ai_agents plutôt que d'utiliser la fonction RPC
        // Cela évite le problème de typage avec la fonction RPC
        try {
          const { error: updateError } = await supabase
            .from('ai_agents')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', agentId);
          
          if (updateError) console.error("Error incrementing views:", updateError);
        } catch (updateError) {
          console.error("Update Error:", updateError);
        }
        
      } catch (error) {
        console.error("Error fetching agent:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId]);

  const getPersonalityDetails = () => {
    switch(agent?.personality) {
      case "expert":
        return {
          icon: "🎓",
          name: "Expert",
          description: "Répond avec précision et autorité professionnelle",
          bgColor: "bg-blue-500/20",
          textColor: "text-blue-400"
        };
      case "friendly":
        return {
          icon: "😊",
          name: "Amical",
          description: "Répond de manière chaleureuse et conviviale",
          bgColor: "bg-green-500/20",
          textColor: "text-green-400"
        };
      case "concise":
        return {
          icon: "📋",
          name: "Concis",
          description: "Répond de façon directe et sans détour",
          bgColor: "bg-purple-500/20",
          textColor: "text-purple-400"
        };
      case "empathetic":
        return {
          icon: "💖",
          name: "Empathique",
          description: "Répond avec compréhension et compassion",
          bgColor: "bg-pink-500/20",
          textColor: "text-pink-400"
        };
      default:
        return {
          icon: "🤖",
          name: "Standard",
          description: "Assistant standard",
          bgColor: "bg-slate-500/20",
          textColor: "text-slate-400"
        };
    }
  };

  const copyAgentLink = () => {
    const url = `${window.location.origin}/ai-studio/agents/${agentId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Lien copié",
      description: "Le lien de l'agent a été copié dans le presse-papiers"
    });
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('agent-qr-code');
    if (canvas) {
      const url = (canvas as HTMLCanvasElement).toDataURL("image/png");
      const link = document.createElement('a');
      link.href = url;
      link.download = `${agent.name.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
        <Navbar />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : agent ? (
              <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg mb-6 overflow-hidden">
                  <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500"></div>
                  <div className="p-8">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="bg-violet-600/30 rounded-xl p-5 flex items-center justify-center">
                        <div className="text-5xl">
                          {agent.avatar_style === "bot" && "🤖"}
                          {agent.avatar_style === "sparkles" && "✨"}
                          {!agent.avatar_style && "🧠"}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-3 text-slate-100 flex items-center gap-2">
                          {agent.name}
                          {agent.rating > 4 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className="ml-2 bg-amber-600/30 text-amber-300 border-amber-600/30">
                                  <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                                  Populaire
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Agent très bien noté par la communauté</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </h1>
                        
                        <div className="flex flex-wrap items-center text-sm gap-3 text-slate-400 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Créé {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true, locale: fr })}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{agent.views || 0} vues</span>
                          </div>
                          
                          {agent.user_profiles && (
                            <div className="flex items-center">
                              <span>par {agent.user_profiles.username || agent.user_profiles.full_name || "Anonyme"}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center text-sm gap-2 mb-4">
                          <Badge variant="outline" className={`${getPersonalityDetails().bgColor} ${getPersonalityDetails().textColor} border-none`}>
                            <span className="mr-1">{getPersonalityDetails().icon}</span>
                            {getPersonalityDetails().name}
                          </Badge>
                          
                          {agent.rating > 0 && (
                            <Badge variant="outline" className="bg-amber-900/20 text-amber-300 border-amber-800/30">
                              <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                              {agent.rating.toFixed(1)}
                            </Badge>
                          )}
                          {agent.is_paid && (
                            <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800/30">
                              {agent.price}€
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-lg mb-6 text-slate-300 leading-relaxed">{agent.objective}</p>
                    
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            asChild 
                            className="bg-violet-600 hover:bg-violet-700 shadow-md hover:shadow-violet-600/20 transition-all text-white"
                            size="lg"
                          >
                            <Link to={`/ai-studio/chat/${agent.id}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Discuter avec cet agent
                            </Link>
                          </Button>
                          
                          <Button 
                            onClick={() => setActiveTab("integration")}
                            variant="outline" 
                            className="border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-slate-200"
                          >
                            <Share className="mr-2 h-4 w-4" />
                            Partager cet agent
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-1">
                    <TabsTrigger 
                      value="overview"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg"
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Présentation
                    </TabsTrigger>
                    <TabsTrigger 
                      value="capabilities"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg"
                    >
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Capacités
                    </TabsTrigger>
                    <TabsTrigger 
                      value="integration"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Intégration
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
                      <div className="p-8">
                        <h2 className="text-xl font-semibold mb-4 text-slate-100">À propos de cet agent</h2>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                          Cet agent a été conçu pour vous aider dans son domaine d'expertise.
                          Vous pouvez discuter avec lui pour obtenir des informations, des conseils
                          ou simplement pour avoir une conversation intéressante.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-700/30 rounded-xl p-5">
                            <h3 className="text-lg font-medium mb-3 text-slate-200">Personnalité</h3>
                            <div className="space-y-2">
                              <div className="flex items-center text-slate-300">
                                <span className={`${getPersonalityDetails().bgColor} ${getPersonalityDetails().textColor} p-2 rounded-lg mr-3 text-xl`}>
                                  {getPersonalityDetails().icon}
                                </span>
                                <div>
                                  <p className="font-medium">{getPersonalityDetails().name}</p>
                                  <p className="text-sm text-slate-400">{getPersonalityDetails().description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-700/30 rounded-xl p-5">
                            <h3 className="text-lg font-medium mb-3 text-slate-200">Partage rapide</h3>
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-slate-200 flex-1"
                                  onClick={copyAgentLink}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copier le lien
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-slate-200"
                                  onClick={() => setShowQR(!showQR)}
                                >
                                  {showQR ? "Masquer QR" : "Afficher QR"}
                                </Button>
                              </div>
                              
                              {showQR && (
                                <div className="bg-white p-3 rounded-lg w-fit mx-auto">
                                  <QRCodeSVG 
                                    id="agent-qr-code"
                                    value={`${window.location.origin}/ai-studio/agents/${agent.id}`}
                                    size={150}
                                    level="H"
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="w-full mt-2 text-xs text-slate-700"
                                    onClick={downloadQRCode}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Télécharger
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="capabilities">
                    <div className="space-y-6">
                      <Card className="bg-slate-800/40 backdrop-blur-md border-slate-700/50 shadow-lg overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-slate-100">Ce que cet agent peut faire</CardTitle>
                          <CardDescription className="text-slate-400">
                            Découvrez les capacités et les limites de cet agent IA
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-slate-700">
                              <AccordionTrigger className="text-slate-200 hover:text-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="bg-teal-600/20 text-teal-400 p-1.5 rounded">
                                    <MessageSquare className="h-4 w-4" />
                                  </div>
                                  <span>Conversation naturelle</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-slate-300">
                                Cet agent peut mener des conversations naturelles et cohérentes, en comprenant le contexte
                                et en maintenant la continuité des échanges.
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="item-2" className="border-slate-700">
                              <AccordionTrigger className="text-slate-200 hover:text-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="bg-blue-600/20 text-blue-400 p-1.5 rounded">
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                  <span>Connaissances spécialisées</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-slate-300">
                                L'agent dispose de connaissances spécifiques dans son domaine d'expertise
                                et peut fournir des informations pertinentes et précises sur ces sujets.
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="item-3" className="border-slate-700">
                              <AccordionTrigger className="text-slate-200 hover:text-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="bg-purple-600/20 text-purple-400 p-1.5 rounded">
                                    <BrainCircuit className="h-4 w-4" />
                                  </div>
                                  <span>Limites techniques</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-slate-300">
                                <p>L'agent a certaines limitations :</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                  <li>Ne peut pas accéder à Internet en temps réel</li>
                                  <li>Ne peut pas exécuter de code ou accéder à des fichiers</li>
                                  <li>Ses connaissances ont une date limite</li>
                                  <li>Ne peut pas voir d'images ou entendre des sons</li>
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          <div className="bg-slate-700/30 rounded-xl p-5 mt-6">
                            <h3 className="text-lg font-medium mb-3 text-slate-200 flex items-center gap-2">
                              <Star className="h-5 w-5 text-amber-400" />
                              Cas d'utilisation recommandés
                            </h3>
                            <ul className="space-y-3">
                              <li className="flex gap-3 text-slate-300">
                                <div className="bg-green-600/20 text-green-400 p-1 rounded h-fit">
                                  <span>✓</span>
                                </div>
                                <div>
                                  <p>Obtenir des informations et des explications dans le domaine d'expertise de l'agent</p>
                                </div>
                              </li>
                              <li className="flex gap-3 text-slate-300">
                                <div className="bg-green-600/20 text-green-400 p-1 rounded h-fit">
                                  <span>✓</span>
                                </div>
                                <div>
                                  <p>Explorer des sujets connexes par le biais d'une conversation interactive</p>
                                </div>
                              </li>
                              <li className="flex gap-3 text-slate-300">
                                <div className="bg-green-600/20 text-green-400 p-1 rounded h-fit">
                                  <span>✓</span>
                                </div>
                                <div>
                                  <p>Obtenir des idées, des suggestions et des conseils dans son domaine</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex justify-center">
                        <Button 
                          asChild 
                          className="bg-violet-600 hover:bg-violet-700 shadow-md hover:shadow-violet-600/20 transition-all text-white"
                          size="lg"
                        >
                          <Link to={`/ai-studio/chat/${agent.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Essayer cet agent maintenant
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="integration">
                    <div className="space-y-6">
                      <Card className="bg-slate-800/40 backdrop-blur-md border-slate-700/50 shadow-lg overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-slate-100">Lien public</CardTitle>
                          <CardDescription className="text-slate-400">
                            Partagez ce lien pour que d'autres personnes puissent accéder à cet agent
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-4">
                            <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between items-center">
                              <code className="text-slate-300 text-sm truncate">
                                {window.location.origin}/ai-studio/agents/{agent.id}
                              </code>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="ml-2 text-slate-400 hover:text-slate-200"
                                onClick={copyAgentLink}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex justify-center">
                              <Button 
                                variant="outline" 
                                className="border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-slate-200"
                                onClick={() => window.open(`${window.location.origin}/ai-studio/chat/${agent.id}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ouvrir dans un nouvel onglet
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <EmbedCodeGenerator 
                        agentId={agent.id} 
                        agentName={agent.name} 
                        isPublic={agent.is_public} 
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto text-center bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-12">
                <h1 className="text-3xl font-bold mb-6 text-slate-100">
                  Agent introuvable
                </h1>
                <p className="mb-8 text-slate-400">
                  Cet agent n'existe pas ou n'est pas public.
                </p>
                <Button asChild className="bg-violet-600 hover:bg-violet-700">
                  <Link to="/ai-studio/marketplace">Explorer le marketplace</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default AIStudioAgentPage;
