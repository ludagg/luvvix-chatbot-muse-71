
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  CheckCircle2
} from "lucide-react";

const AIStudioPage = () => {
  useEffect(() => {
    document.title = "LuvviX AI Studio - Créez vos agents IA personnalisés";
  }, []);

  const { user } = useAuth();
  const { toast } = useToast();
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f1219] to-[#171c28]">
      <Navbar />
      
      {/* Hero Section with Quick Agent Creator */}
      <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-sm font-medium mb-4">
            <Sparkles size={16} className="mr-2" /> Nouveau dans l'écosystème LuvviX
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Créez vos <span className="text-violet-500">agents IA</span> sans une ligne de code
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl">
            LuvviX AI Studio vous permet de concevoir, entraîner et déployer des assistants IA personnalisés pour vos besoins spécifiques, le tout sans connaissances techniques.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              asChild
            >
              <Link to={user ? "/ai-studio/dashboard" : "/auth?return_to=/ai-studio/dashboard"}>
                {user ? "Accéder à mon dashboard" : "Commencer maintenant"}
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
              asChild
            >
              <Link to="/ai-studio/marketplace">
                Explorer le marketplace
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 mt-12 md:mt-0">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Création rapide d'agent IA</h2>
                <p className="text-white/60 text-sm">Créez votre premier agent en quelques secondes</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-1">Nom de votre agent</label>
                  <Input 
                    placeholder="ex: Assistant Support Client" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    value={quickAgentName}
                    onChange={(e) => setQuickAgentName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-1">Type d'agent</label>
                  <Select 
                    value={quickAgentRole} 
                    onValueChange={setQuickAgentRole}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Sélectionnez un type d'agent" />
                    </SelectTrigger>
                    <SelectContent>
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
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90"
                  onClick={handleQuickCreate}
                >
                  Créer mon agent IA
                </Button>
                
                <div className="text-center text-white/40 text-xs">
                  Votre agent sera pré-configuré selon le type choisi
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Des cas d'utilisation pour tous les besoins
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Découvrez comment les agents IA peuvent transformer votre activité ou votre quotidien
          </p>
          
          <div className="flex justify-center mt-8">
            <Tabs defaultValue="all" value={industryFilter} onValueChange={setIndustryFilter} className="w-full max-w-md">
              <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10">
                <TabsTrigger value="all" className="data-[state=active]:bg-violet-600">
                  Tous
                </TabsTrigger>
                <TabsTrigger value="business" className="data-[state=active]:bg-violet-600">
                  Entreprise
                </TabsTrigger>
                <TabsTrigger value="retail" className="data-[state=active]:bg-violet-600">
                  Retail
                </TabsTrigger>
                <TabsTrigger value="education" className="data-[state=active]:bg-violet-600">
                  Éducation
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUseCases.map((useCase) => (
            <div 
              key={useCase.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${useCase.color}`}></div>
              <div className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${useCase.color} flex items-center justify-center text-white mb-4`}>
                  <useCase.icon size={24} />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
                <p className="text-white/70 mb-6">{useCase.description}</p>
                
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to={user ? `/ai-studio/create?template=${useCase.id}` : "/auth?return_to=/ai-studio/create"}>
                    Créer cet agent
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Interactive Demo Section */}
      <section className="container mx-auto px-4 py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-0 md:flex">
            <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
                <Laptop size={16} className="mr-2" /> Essayez par vous-même
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">Voyez comment un agent LuvviX transforme l'expérience client</h2>
              
              <p className="text-white/70 mb-6">
                Explorez notre démo interactive pour comprendre comment un agent IA personnalisé peut répondre aux questions de vos clients, 24/7 et sans délai.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Intégration facile sur votre site",
                  "Personnalisation complète des réponses",
                  "Apprentissage continu à partir des interactions",
                  "Réduction des coûts de support client"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90" asChild>
                <Link to="/ai-studio/marketplace">
                  Explorer des exemples
                </Link>
              </Button>
            </div>
            
            <div className="md:w-1/2 relative overflow-hidden rounded-xl md:rounded-l-none md:rounded-r-2xl mt-6 md:mt-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
              <div className="relative z-10 h-full flex items-center justify-center p-6">
                <img 
                  src="https://images.unsplash.com/photo-1581092446327-9b52bd1480d5?q=80&w=900&auto=format&fit=crop" 
                  alt="Agent IA en action" 
                  className="rounded-lg shadow-2xl border border-white/10 max-w-full max-h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Une plateforme complète pour vos agents AI
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            De la conception au déploiement, LuvviX AI Studio vous offre tous les outils nécessaires
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Bot,
              title: "Création intuitive",
              description: "Interface simple et intuitive pour concevoir vos agents IA en quelques minutes sans compétences techniques."
            },
            {
              icon: Layers,
              title: "Contextualisation puissante",
              description: "Importez des documents, du texte ou des URLs pour donner à votre agent IA les connaissances dont il a besoin."
            },
            {
              icon: ShieldCheck,
              title: "Sécurité et confidentialité",
              description: "Vos données sensibles sont traitées avec les plus hauts standards de sécurité et de confidentialité."
            },
            {
              icon: Globe2,
              title: "Déploiement instantané",
              description: "Partagez votre agent via un lien public ou intégrez-le facilement sur votre site web."
            },
            {
              icon: Users,
              title: "Marketplace collaboratif",
              description: "Découvrez, partagez et monétisez vos créations dans notre marketplace communautaire."
            },
            {
              icon: Code2,
              title: "Widgets & intégrations",
              description: "Intégrez facilement vos agents IA sur n'importe quel site web avec notre système de widgets."
            },
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors group hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
            >
              <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-500 mb-5 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                <feature.icon size={24} />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-white/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-violet-900/20 to-blue-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-16 text-center">
          <Cpu className="mx-auto h-16 w-16 text-violet-500 mb-6" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 max-w-3xl mx-auto">
            Prêt à créer votre premier assistant IA intelligent ?
          </h2>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Rejoignez des milliers d'utilisateurs qui transforment leur façon de travailler avec des assistants IA personnalisés.
          </p>
          
          <Button
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white"
            asChild
          >
            <Link to={user ? "/ai-studio/dashboard" : "/auth?return_to=/ai-studio/dashboard"}>
              {user ? "Accéder à mon dashboard" : "Créer mon premier agent IA"}
            </Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AIStudioPage;
