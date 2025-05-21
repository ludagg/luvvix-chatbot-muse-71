
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  Bot,
  Users,
  Cpu,
  Layers,
  ShieldCheck,
  Globe2,
  Code2,
  BookOpen,
  MessageSquare,
  Laptop,
  Store,
  Building,
  BriefcaseBusiness,
  GraduationCap,
  UserRound,
  CheckCircle2,
  ArrowRight,
  Zap
} from "lucide-react";
import { useRecentBots } from "@/hooks/use-recent-bots";
import { CardHoverEffect } from "@/components/ui/card-hover-effect";
import { HoverGlowCard } from "@/components/ui/hover-glow-card";

const AIStudioPage = () => {
  useEffect(() => {
    document.title = "LuvviX AI Studio - Créez vos agents IA personnalisés";
  }, []);

  const { user } = useAuth();
  const { recentBots, popularBots, isLoading } = useRecentBots();
  const [quickAgentName, setQuickAgentName] = useState("");
  const [quickAgentRole, setQuickAgentRole] = useState("customer-support");
  const [industryFilter, setIndustryFilter] = useState("all");

  const handleQuickCreate = () => {
    if (!user) {
      toast({
        title: "Vous devez être connecté",
        description: "Connectez-vous pour créer un agent IA",
        variant: "destructive"
      });
      return;
    }
    
    if (!quickAgentName) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à votre agent IA",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Agent IA en cours de création",
      description: "Redirection vers l'éditeur...",
    });
    
    // Redirection vers la page de création avec les paramètres préremplis
    setTimeout(() => {
      window.location.href = `/ai-studio/create?name=${encodeURIComponent(quickAgentName)}&template=${quickAgentRole}`;
    }, 1000);
  };

  const useCases = [
    {
      id: "customer-support",
      industry: "business",
      title: "Support Client 24/7",
      description: "Un agent capable de répondre aux questions fréquentes des clients à toute heure.",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "product-expert",
      industry: "retail",
      title: "Expert Produit",
      description: "Transformez vos fiches produits en assistants virtuels capables de conseiller vos clients.",
      icon: Store,
      color: "from-green-500 to-green-600"
    },
    {
      id: "educational",
      industry: "education",
      title: "Assistant Pédagogique",
      description: "Créez un tuteur personnalisé pour aider les apprenants dans leurs études.",
      icon: GraduationCap,
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "corporate",
      industry: "business",
      title: "Onboarding Collaborateurs",
      description: "Facilitez l'intégration de nouveaux employés avec un agent qui répond à toutes leurs questions.",
      icon: Building,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: "personal",
      industry: "personal",
      title: "Assistant Personnel",
      description: "Créez un agent IA pour organiser votre quotidien et vous rappeler vos tâches importantes.",
      icon: UserRound,
      color: "from-amber-500 to-amber-600"
    },
    {
      id: "consultant",
      industry: "business",
      title: "Consultant Virtuel",
      description: "Un expert dans votre domaine pour aider vos clients à prendre les bonnes décisions.",
      icon: BriefcaseBusiness,
      color: "from-red-500 to-red-600"
    }
  ];

  const filteredUseCases = industryFilter === "all" 
    ? useCases 
    : useCases.filter(useCase => useCase.industry === industryFilter);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f1219] via-[#171c28] to-[#1e2436]">
      <Navbar />
      
      {/* Hero Section with Quick Agent Creator - Modern & Futuristic */}
      <section className="container mx-auto px-4 py-24 flex flex-col md:flex-row items-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-luvvix-purple/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-luvvix-teal/10 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full animate-pulse-light"></div>
        </div>
        
        <motion.div 
          className="flex-1 space-y-8 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-luvvix-purple/20 text-luvvix-lightpurple text-sm font-medium mb-4 backdrop-blur-sm border border-luvvix-purple/20">
            <Sparkles size={16} className="mr-2" /> Nouveau dans l'écosystème LuvviX
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            Donnez vie à vos <span className="bg-gradient-to-r from-luvvix-lightpurple to-luvvix-teal bg-clip-text text-transparent">agents IA</span> sans code
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
            LuvviX AI Studio vous permet de concevoir, entraîner et déployer des assistants IA personnalisés pour vos besoins spécifiques, le tout sans connaissances techniques.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-luvvix-purple to-luvvix-darkpurple hover:opacity-90 shadow-lg shadow-luvvix-purple/20 font-medium text-base px-6"
              asChild
            >
              <Link to={user ? "/ai-studio/dashboard" : "/auth?return_to=/ai-studio/dashboard"}>
                {user ? "Accéder à mon dashboard" : "Commencer maintenant"} <ArrowRight className="ml-1 w-5 h-5"/>
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm font-medium text-base px-6"
              asChild
            >
              <Link to="/ai-studio/marketplace">
                Explorer le marketplace <Zap className="ml-1 w-5 h-5"/>
              </Link>
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex-1 mt-12 md:mt-0 z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Création rapide d'agent IA</h2>
                <p className="text-white/70 text-sm">Créez votre premier agent en quelques secondes</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-white/90 text-sm mb-2 font-medium">Nom de votre agent</label>
                  <Input 
                    placeholder="ex: Assistant Support Client" 
                    className="bg-white/10 border-white/30 focus:border-luvvix-lightpurple/70 text-white placeholder:text-white/40 h-12"
                    value={quickAgentName}
                    onChange={(e) => setQuickAgentName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-white/90 text-sm mb-2 font-medium">Type d'agent</label>
                  <Select 
                    value={quickAgentRole} 
                    onValueChange={setQuickAgentRole}
                  >
                    <SelectTrigger className="bg-white/10 border-white/30 focus:border-luvvix-lightpurple/70 text-white h-12">
                      <SelectValue placeholder="Sélectionnez un type d'agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#202740] border-white/10 text-white">
                      <SelectItem value="customer-support">Support Client</SelectItem>
                      <SelectItem value="product-expert">Expert Produit</SelectItem>
                      <SelectItem value="educational">Assistant Pédagogique</SelectItem>
                      <SelectItem value="corporate">Onboarding Collaborateurs</SelectItem>
                      <SelectItem value="personal">Assistant Personnel</SelectItem>
                      <SelectItem value="consultant">Consultant Virtuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-luvvix-lightpurple to-luvvix-purple hover:opacity-90 shadow-lg font-medium text-base"
                  onClick={handleQuickCreate}
                >
                  Créer mon agent IA
                </Button>
                
                <div className="text-center text-white/50 text-xs">
                  Votre agent sera pré-configuré selon le type choisi
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Recent Bots Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Agents IA récents
          </motion.h2>
          
          <Link 
            to="/ai-studio/marketplace" 
            className="text-luvvix-lightpurple hover:text-luvvix-teal transition-colors flex items-center gap-1 font-medium"
          >
            Voir tous <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#1e2436] to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-x-auto scrollbar-thin pb-4 -mx-4 px-4">
            <div className="flex gap-6 min-w-max">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-[280px] h-[320px] bg-white/5 animate-pulse rounded-xl"
                  />
                ))
              ) : recentBots && recentBots.length > 0 ? (
                recentBots.map((bot) => (
                  <HoverGlowCard
                    key={bot.id}
                    className="w-[280px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="h-36 bg-gradient-to-br from-luvvix-purple/30 to-luvvix-darkpurple/30 relative">
                      {bot.avatar_url ? (
                        <img 
                          src={bot.avatar_url} 
                          alt={bot.name} 
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Bot className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">{bot.name}</h3>
                      <p className="text-sm text-white/70 mb-4 line-clamp-3">
                        {bot.description || bot.objective || "Un assistant IA prêt à vous aider"}
                      </p>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-luvvix-purple/80 flex items-center justify-center text-xs text-white font-medium">
                            {bot.user_name ? bot.user_name.substring(0, 1).toUpperCase() : "U"}
                          </div>
                          <span className="text-xs text-white/60 ml-2">
                            {bot.user_name || "Utilisateur"}
                          </span>
                        </div>
                        
                        <Link to={`/ai-studio/agents/${bot.id}`}>
                          <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">
                            Tester
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </HoverGlowCard>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-10">
                  <p className="text-white/50">Aucun agent récent trouvé</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#1e2436] to-transparent z-10 pointer-events-none" />
        </div>
      </section>

      {/* Popular Bots Section */}
      <section className="container mx-auto px-4 py-16 pt-4">
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Agents IA populaires
          </motion.h2>
          
          <Link 
            to="/ai-studio/marketplace?sort=popular" 
            className="text-luvvix-lightpurple hover:text-luvvix-teal transition-colors flex items-center gap-1 font-medium"
          >
            Voir tous <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#1e2436] to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-x-auto scrollbar-thin pb-4 -mx-4 px-4">
            <div className="flex gap-6 min-w-max">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-[280px] h-[320px] bg-white/5 animate-pulse rounded-xl"
                  />
                ))
              ) : popularBots && popularBots.length > 0 ? (
                popularBots.map((bot) => (
                  <HoverGlowCard
                    key={bot.id}
                    className="w-[280px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="h-36 bg-gradient-to-br from-luvvix-teal/30 to-luvvix-purple/30 relative">
                      {bot.avatar_url ? (
                        <img 
                          src={bot.avatar_url} 
                          alt={bot.name} 
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Bot className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-luvvix-teal text-white border-0">
                        Populaire
                      </Badge>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">{bot.name}</h3>
                      <p className="text-sm text-white/70 mb-4 line-clamp-3">
                        {bot.description || bot.objective || "Un assistant IA prêt à vous aider"}
                      </p>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-luvvix-teal/80 flex items-center justify-center text-xs text-white font-medium">
                            {bot.user_name ? bot.user_name.substring(0, 1).toUpperCase() : "U"}
                          </div>
                          <span className="text-xs text-white/60 ml-2">
                            {bot.user_name || "Utilisateur"}
                          </span>
                        </div>
                        
                        <Link to={`/ai-studio/agents/${bot.id}`}>
                          <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">
                            Tester
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </HoverGlowCard>
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-10">
                  <p className="text-white/50">Aucun agent populaire trouvé</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#1e2436] to-transparent z-10 pointer-events-none" />
        </div>
      </section>
      
      {/* Use Cases Section - Modern & Futuristic */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4 inline-block relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="relative z-10">
              Des cas d'utilisation pour tous les besoins
              <motion.span 
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-luvvix-teal to-luvvix-purple rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-white/70 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Découvrez comment les agents IA peuvent transformer votre activité ou votre quotidien
          </motion.p>
          
          <motion.div 
            className="flex justify-center mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Tabs defaultValue="all" value={industryFilter} onValueChange={setIndustryFilter} className="w-full max-w-md">
              <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10 p-1">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-luvvix-purple data-[state=active]:text-white"
                >
                  Tous
                </TabsTrigger>
                <TabsTrigger 
                  value="business" 
                  className="data-[state=active]:bg-luvvix-purple data-[state=active]:text-white"
                >
                  Entreprise
                </TabsTrigger>
                <TabsTrigger 
                  value="retail" 
                  className="data-[state=active]:bg-luvvix-purple data-[state=active]:text-white"
                >
                  Retail
                </TabsTrigger>
                <TabsTrigger 
                  value="education" 
                  className="data-[state=active]:bg-luvvix-purple data-[state=active]:text-white"
                >
                  Éducation
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUseCases.map((useCase, index) => (
            <motion.div
              key={useCase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group"
            >
              <div 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-luvvix-purple/50 transition-all duration-500 shadow-lg hover:shadow-luvvix-purple/10 h-full flex flex-col"
              >
                <div className={`h-3 w-full bg-gradient-to-r ${useCase.color}`}></div>
                <div className="p-6 flex-1">
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${useCase.color} flex items-center justify-center text-white mb-5 transform transition-transform duration-500 group-hover:scale-110`}>
                    <useCase.icon size={28} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">{useCase.title}</h3>
                  <p className="text-white/70 mb-6">{useCase.description}</p>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10 mt-auto"
                    asChild
                  >
                    <Link to={user ? `/ai-studio/create?template=${useCase.id}` : "/auth?return_to=/ai-studio/create"}>
                      Créer cet agent
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Interactive Demo Section - Modern & Futuristic */}
      <section className="container mx-auto px-4 py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-0 md:flex shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-luvvix-teal/10 text-luvvix-teal text-sm font-medium mb-6">
                <Laptop size={16} className="mr-2" /> Essayez par vous-même
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">Voyez comment un agent LuvviX transforme l'expérience client</h2>
              
              <p className="text-white/70 mb-6">
                Explorez notre démo interactive pour comprendre comment un agent IA personnalisé peut répondre aux questions de vos clients, 24/7 et sans délai.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Intégration facile sur votre site",
                  "Personnalisation complète des réponses",
                  "Apprentissage continu à partir des interactions",
                  "Réduction des coûts de support client"
                ].map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-luvvix-teal mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Button 
                className="w-full md:w-auto bg-gradient-to-r from-luvvix-teal to-luvvix-purple hover:opacity-90 shadow-md"
                asChild
              >
                <Link to="/ai-studio/marketplace">
                  Explorer des exemples
                </Link>
              </Button>
            </div>
            
            <div className="md:w-1/2 relative overflow-hidden rounded-b-xl md:rounded-l-none md:rounded-r-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-luvvix-teal/20 to-luvvix-purple/20 z-0"></div>
              <div className="relative z-10 h-full flex items-center justify-center p-6">
                <motion.img 
                  src="https://images.unsplash.com/photo-1581092446327-9b52bd1480d5?q=80&w=900&auto=format&fit=crop" 
                  alt="Agent IA en action" 
                  className="rounded-lg shadow-2xl border border-white/10 max-w-full max-h-full object-cover"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section with CardHoverEffect - Modern & Futuristic */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Une plateforme complète pour vos agents AI
          </motion.h2>
          <motion.p 
            className="text-xl text-white/70 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            De la conception au déploiement, LuvviX AI Studio vous offre tous les outils nécessaires
          </motion.p>
        </div>
        
        <CardHoverEffect 
          items={[
            {
              icon: <Bot className="w-6 h-6" />,
              title: "Création intuitive",
              description: "Interface simple et intuitive pour concevoir vos agents IA en quelques minutes sans compétences techniques."
            },
            {
              icon: <Layers className="w-6 h-6" />,
              title: "Contextualisation puissante",
              description: "Importez des documents, du texte ou des URLs pour donner à votre agent IA les connaissances dont il a besoin."
            },
            {
              icon: <ShieldCheck className="w-6 h-6" />,
              title: "Sécurité et confidentialité",
              description: "Vos données sensibles sont traitées avec les plus hauts standards de sécurité et de confidentialité."
            },
            {
              icon: <Globe2 className="w-6 h-6" />,
              title: "Déploiement instantané",
              description: "Partagez votre agent via un lien public ou intégrez-le facilement sur votre site web."
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: "Marketplace collaboratif",
              description: "Découvrez, partagez et monétisez vos créations dans notre marketplace communautaire."
            },
            {
              icon: <Code2 className="w-6 h-6" />,
              title: "Widgets & intégrations",
              description: "Intégrez facilement vos agents IA sur n'importe quel site web avec notre système de widgets."
            },
          ]}
        />
      </section>
      
      {/* CTA Section - Modern & Futuristic */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          className="relative bg-gradient-to-br from-luvvix-darkpurple/70 to-[#101220]/90 backdrop-blur-lg border border-luvvix-purple/20 rounded-2xl p-8 md:p-16 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-luvvix-purple/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-luvvix-teal/20 rounded-full blur-3xl"></div>
          </div>
          
          <motion.div 
            className="relative z-10"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Cpu className="mx-auto h-16 w-16 text-luvvix-lightpurple mb-6" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 max-w-3xl mx-auto">
              Prêt à créer votre premier assistant IA intelligent ?
            </h2>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Rejoignez des milliers d'utilisateurs qui transforment leur façon de travailler avec des assistants IA personnalisés.
            </p>
            
            <Button
              size="lg"
              className="bg-gradient-to-r from-luvvix-lightpurple to-luvvix-purple hover:opacity-90 text-white shadow-lg shadow-luvvix-purple/20 font-medium text-base px-8 py-6 h-auto"
              asChild
            >
              <Link to={user ? "/ai-studio/dashboard" : "/auth?return_to=/ai-studio/dashboard"}>
                {user ? "Accéder à mon dashboard" : "Créer mon premier agent IA"}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AIStudioPage;
