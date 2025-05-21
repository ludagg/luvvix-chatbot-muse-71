
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HoverGlowCard } from "@/components/ui/hover-glow-card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Brain,
  HeartPulse,
  Radio,
  Cloud,
  FileText,
  BarChart,
  Shield,
  User,
  Bot,
  Calendar,
  Zap,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Check,
  Star,
  Clock,
  Newspaper,
  MessageSquare
} from "lucide-react";

// Types
interface AppCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  category: string;
  isNew?: boolean;
  isPremium?: boolean;
  isPopular?: boolean;
  isComing?: boolean;
  color: string;
  features?: string[];
}

const EcosystemPage = () => {
  const { user } = useAuth();
  const [recentApps, setRecentApps] = useState<AppItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // App categories
  const categories: AppCategory[] = [
    { id: "all", name: "Tous", description: "L'ensemble de l'écosystème LuvviX", icon: <Sparkles className="h-5 w-5" /> },
    { id: "ai", name: "Intelligence Artificielle", description: "Outils propulsés par l'IA", icon: <Brain className="h-5 w-5" /> },
    { id: "productivity", name: "Productivité", description: "Applications pour le travail", icon: <Zap className="h-5 w-5" /> },
    { id: "communication", name: "Communication", description: "Services de messagerie et media", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "health", name: "Santé", description: "Applications médicales", icon: <HeartPulse className="h-5 w-5" /> },
    { id: "data", name: "Données", description: "Analyse et stockage", icon: <BarChart className="h-5 w-5" /> },
  ];
  
  // App list
  const apps: AppItem[] = [
    {
      id: "ai-studio",
      name: "LuvviX AI Studio",
      description: "Créez et déployez vos propres agents IA intelligents",
      icon: <Bot className="h-8 w-8" />,
      route: "/ai-studio",
      category: "ai",
      isNew: true,
      isPopular: true,
      color: "from-violet-500 to-indigo-500",
      features: [
        "Création d'agents IA sans code",
        "Support pour les sites web JavaScript",
        "Intégration dans vos propres sites"
      ]
    },
    {
      id: "medic",
      name: "LuvviX Medic",
      description: "Solutions innovantes pour la santé numérique",
      icon: <HeartPulse className="h-8 w-8" />,
      route: "/medic",
      category: "health",
      color: "from-emerald-500 to-teal-500",
      features: [
        "Suivi médical personnalisé",
        "Rendez-vous avec des spécialistes",
        "Accès à votre dossier médical"
      ]
    },
    {
      id: "streammix",
      name: "LuvviX StreamMix",
      description: "Plateforme de streaming audio et vidéo",
      icon: <Radio className="h-8 w-8" />,
      route: "/streammix",
      category: "communication",
      isPremium: true,
      color: "from-orange-500 to-red-500",
      features: [
        "Montage vidéo assisté par IA",
        "Diffusion en direct",
        "Collaboration en temps réel"
      ]
    },
    {
      id: "cloud",
      name: "LuvviX Cloud",
      description: "Stockage sécurisé et synchronisation de vos fichiers",
      icon: <Cloud className="h-8 w-8" />,
      route: "/cloud",
      category: "data",
      isPopular: true,
      color: "from-blue-500 to-sky-500",
      features: [
        "Stockage sécurisé avec chiffrement",
        "Partage de fichiers facilité",
        "Synchronisation multi-appareils"
      ]
    },
    {
      id: "forms",
      name: "LuvviX Forms",
      description: "Création et gestion de formulaires intelligents",
      icon: <FileText className="h-8 w-8" />,
      route: "/forms",
      category: "productivity",
      color: "from-pink-500 to-rose-500",
      features: [
        "Formulaires personnalisables",
        "Analyse des réponses en temps réel",
        "Intégration avec d'autres services LuvviX"
      ]
    },
    {
      id: "analytics",
      name: "LuvviX Analytics",
      description: "Analyse de données avec visualisations avancées",
      icon: <BarChart className="h-8 w-8" />,
      route: "/analytics",
      category: "data",
      isComing: true,
      color: "from-indigo-500 to-purple-500",
      features: [
        "Tableaux de bord personnalisables",
        "Rapports automatisés",
        "Intégration avec Google Analytics"
      ]
    },
    {
      id: "id",
      name: "LuvviX ID",
      description: "Votre identité numérique sécurisée",
      icon: <User className="h-8 w-8" />,
      route: "/auth",
      category: "productivity",
      color: "from-gray-700 to-gray-900",
      features: [
        "Authentification sécurisée",
        "Connexion à tout l'écosystème LuvviX",
        "Protection par double facteur"
      ]
    },
    {
      id: "news",
      name: "LuvviX News",
      description: "Actualités personnalisées et alertes",
      icon: <Newspaper className="h-8 w-8" />,
      route: "/news",
      category: "communication",
      isNew: true,
      color: "from-yellow-500 to-amber-500",
      features: [
        "Actualités personnalisées par IA",
        "Alertes en temps réel",
        "Résumés intelligents des articles"
      ]
    },
    {
      id: "calendar",
      name: "LuvviX Calendar",
      description: "Gestion avancée de votre calendrier",
      icon: <Calendar className="h-8 w-8" />,
      route: "/calendar",
      category: "productivity",
      isComing: true,
      color: "from-cyan-500 to-blue-500",
      features: [
        "Synchronisation multi-plateformes",
        "Organisation d'événements collaboratifs",
        "Rappels intelligents"
      ]
    },
  ];
  
  useEffect(() => {
    // Simulate getting recent apps from database or localStorage
    if (user) {
      setRecentApps([
        apps.find(app => app.id === "ai-studio")!,
        apps.find(app => app.id === "cloud")!,
        apps.find(app => app.id === "forms")!
      ]);
    }
  }, [user]);
  
  // Filter apps by category
  const filteredApps = activeCategory === "all" 
    ? apps 
    : apps.filter(app => app.category === activeCategory);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-indigo-900 to-purple-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Écosystème LuvviX
              </motion.h1>
              <motion.p 
                className="text-xl mb-8 text-indigo-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Une suite complète d'applications innovantes pour améliorer votre vie numérique
              </motion.p>
              {!user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <Link to="/auth?signup=true">
                    <Button size="lg" className="bg-white text-indigo-900 hover:bg-gray-100">
                      Créer votre compte LuvviX ID
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="mt-4 text-sm text-indigo-200">
                    Accédez à toutes nos applications avec un seul identifiant sécurisé
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </section>
        
        {/* Recent Apps Section - Only for logged in users */}
        {user && recentApps.length > 0 && (
          <section className="py-12 bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-900">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-purple-600" />
                Applications récentes
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentApps.map((app) => (
                  <Link to={app.route} key={app.id}>
                    <HoverGlowCard className="h-full">
                      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full flex flex-col border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <div className={`p-3 rounded-full bg-gradient-to-br ${app.color} mr-4`}>
                            {app.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{app.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Utilisé récemment</p>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">{app.description}</p>
                        <Button variant="outline" className="mt-auto w-full justify-between">
                          Continuer <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </HoverGlowCard>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Main Categories Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Explorez nos applications par catégorie
            </h2>
            
            <Tabs 
              defaultValue="all" 
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full mb-10"
            >
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-1">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      {category.icon}
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-2">
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-medium flex items-center justify-center gap-2">
                      {category.icon}
                      {category.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">{category.description}</p>
                  </div>
                  
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredApps.map((app) => (
                      <motion.div key={app.id} variants={itemVariants}>
                        <Card className="h-full overflow-hidden border-2 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
                          <div className={`h-2 bg-gradient-to-r ${app.color}`}></div>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className={`p-3 rounded-lg bg-gradient-to-br ${app.color} text-white`}>
                                {app.icon}
                              </div>
                              <div className="flex gap-1">
                                {app.isNew && (
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                    NOUVEAU
                                  </span>
                                )}
                                {app.isPopular && (
                                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium flex items-center">
                                    <Star className="h-3 w-3 mr-1" /> POPULAIRE
                                  </span>
                                )}
                                {app.isPremium && (
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                                    PREMIUM
                                  </span>
                                )}
                                {app.isComing && (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                                    BIENTÔT
                                  </span>
                                )}
                              </div>
                            </div>
                            <CardTitle className="mt-4">{app.name}</CardTitle>
                            <CardDescription>{app.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {app.features?.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                          <CardFooter>
                            {app.isComing ? (
                              <Button disabled className="w-full">
                                Bientôt disponible
                              </Button>
                            ) : (
                              <Link to={app.route} className="w-full">
                                <Button className={`w-full bg-gradient-to-r ${app.color} hover:opacity-90 text-white`}>
                                  {app.isPremium ? "Essai gratuit" : "Accéder"}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
        
        {/* Contact Section */}
        <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Contactez l'équipe LuvviX</h3>
                  <p className="mb-6">
                    Vous avez des questions ou des suggestions ? Notre équipe est disponible pour vous aider.
                  </p>
                  <div className="space-y-4">
                    <a href="https://wa.me/237691128422" target="_blank" rel="noopener noreferrer" 
                      className="flex items-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <div className="bg-green-500 p-2 rounded-full mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M17.6 6.8a7.8 7.8 0 0 0-5.5-2.3 8 8 0 0 0-8 8c0 1.5.3 3 1 4.1l-1 4.4 4.4-1c1.2.6 2.5.9 3.9.9a8 8 0 0 0 8-8 7.9 7.9 0 0 0-2.8-6.1z"></path>
                          <path d="M12.5 15.5a2.8 2.8 0 0 1-4-4"></path>
                          <path d="M15 12.2a2.5 2.5 0 0 0-.6-1.7 2.7 2.7 0 0 0-1.7-.7 2.7 2.7 0 0 0-2.2 1.5"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sm opacity-80">+237 691 128 422</p>
                      </div>
                    </a>
                    
                    <a href="mailto:contact@luvvix.com" 
                      className="flex items-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <div className="bg-blue-500 p-2 rounded-full mr-4">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm opacity-80">contact@luvvix.com</p>
                      </div>
                    </a>
                  </div>
                </div>
                
                <div className="md:w-1/2 p-8">
                  <h3 className="text-2xl font-bold mb-4">Fonctionnalités à venir</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Découvrez nos prochaines innovations et contribuez à leur développement.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex">
                      <div className="mr-4 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                        <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">LuvviX AI Assistant personnel</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Un assistant IA entièrement personnalisé à vos besoins
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">LuvviX Secure</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Protection avancée de vos données avec chiffrement de bout en bout
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-4 bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">LuvviX Connect</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Intégration entre toutes vos applications préférées
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default EcosystemPage;
