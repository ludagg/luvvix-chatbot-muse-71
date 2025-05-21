
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  FileText, 
  Users, 
  Database, 
  BarChart3, 
  PanelRight, 
  MessageSquare, 
  Cloud, 
  Settings, 
  Rocket,
  Sparkles,
  BookOpen,
  Heart,
  FolderKanban
} from 'lucide-react';

const EcosystemPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Écosystème LuvviX";
  }, []);

  const productCategories = [
    {
      id: "ai",
      name: "Intelligence Artificielle",
      description: "Assistants IA et modèles de langage",
      products: [
        {
          id: "ai-studio",
          name: "LuvviX AI Studio",
          description: "Créez et déployez vos propres agents d'IA personnalisés",
          icon: <Bot className="h-6 w-6 text-violet-500" />,
          url: "/ai-studio",
          badge: "Nouveau",
          badgeColor: "bg-green-500"
        },
        {
          id: "ai-chat",
          name: "LuvviX Chat",
          description: "Discutez avec notre assistant IA multimodal",
          icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
          url: "/ai-chat",
          soon: false
        },
        {
          id: "ai-api",
          name: "LuvviX AI API",
          description: "Intégrez nos modèles d'IA dans vos applications",
          icon: <PanelRight className="h-6 w-6 text-purple-500" />,
          url: "/ai-api",
          soon: true
        }
      ]
    },
    {
      id: "productivity",
      name: "Productivité",
      description: "Outils pour améliorer votre efficacité",
      products: [
        {
          id: "forms",
          name: "LuvviX Forms",
          description: "Créez et gérez des formulaires intelligents",
          icon: <FileText className="h-6 w-6 text-emerald-500" />,
          url: "/forms",
          badge: "Populaire",
          badgeColor: "bg-blue-500"
        },
        {
          id: "cloud",
          name: "LuvviX Cloud",
          description: "Stockez et partagez vos documents en toute sécurité",
          icon: <Cloud className="h-6 w-6 text-sky-500" />,
          url: "/cloud",
          soon: false
        },
        {
          id: "projects",
          name: "LuvviX Projects",
          description: "Gestion de projet et suivi des tâches",
          icon: <FolderKanban className="h-6 w-6 text-amber-500" />,
          url: "/projects",
          soon: true
        }
      ]
    },
    {
      id: "data",
      name: "Données & Analytique",
      description: "Stockage et analyse de données",
      products: [
        {
          id: "analytics",
          name: "LuvviX Analytics",
          description: "Visualisez et analysez les données de vos applications",
          icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
          url: "/analytics",
          soon: true
        },
        {
          id: "database",
          name: "LuvviX Database",
          description: "Base de données cloud haute performance",
          icon: <Database className="h-6 w-6 text-red-500" />,
          url: "/database",
          soon: true
        }
      ]
    },
    {
      id: "community",
      name: "Communauté",
      description: "Connectez-vous avec d'autres utilisateurs",
      products: [
        {
          id: "documentation",
          name: "Documentation",
          description: "Guides détaillés et références pour tous nos produits",
          icon: <BookOpen className="h-6 w-6 text-teal-500" />,
          url: "/docs",
          soon: false
        },
        {
          id: "community",
          name: "Communauté",
          description: "Rejoignez la communauté LuvviX",
          icon: <Users className="h-6 w-6 text-orange-500" />,
          url: "/community",
          soon: true
        }
      ]
    }
  ];

  const recentApps = [
    {
      id: "ai-studio",
      name: "AI Studio",
      lastUsed: "Il y a 2 heures",
      icon: <Bot className="h-6 w-6 text-violet-500" />,
      url: "/ai-studio",
    },
    {
      id: "forms",
      name: "Forms",
      lastUsed: "Hier",
      icon: <FileText className="h-6 w-6 text-emerald-500" />,
      url: "/forms",
    },
    {
      id: "cloud",
      name: "Cloud",
      lastUsed: "Il y a 3 jours",
      icon: <Cloud className="h-6 w-6 text-sky-500" />,
      url: "/cloud",
    }
  ];

  const upcomingFeatures = [
    {
      name: "LuvviX Projects",
      description: "Gestion de projet collaborative avec intégration IA",
      date: "Septembre 2025",
      icon: <FolderKanban className="h-6 w-6 text-amber-500" />
    },
    {
      name: "AI Studio Pro",
      description: "Fonctionnalités avancées pour la création d'agents IA",
      date: "Octobre 2025",
      icon: <Sparkles className="h-6 w-6 text-purple-500" />
    },
    {
      name: "LuvviX Analytics",
      description: "Visualisation avancée des données et insights",
      date: "Novembre 2025",
      icon: <BarChart3 className="h-6 w-6 text-blue-500" />
    }
  ];

  const renderCardList = (list) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((item, index) => (
          <Card key={index} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                  {item.icon}
                </div>
                {item.badge && (
                  <Badge className={item.badgeColor || "bg-green-500"}>
                    {item.badge}
                  </Badge>
                )}
                {item.soon && (
                  <Badge variant="outline" className="border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400">
                    Bientôt
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-2">{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant={item.soon ? "outline" : "default"} 
                onClick={() => item.soon ? null : navigate(item.url)}
                disabled={item.soon}
                className="w-full"
              >
                {item.soon ? "Bientôt disponible" : item.url ? "Ouvrir" : "En savoir plus"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-500 mb-3">
              Écosystème LuvviX
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Découvrez notre suite complète d'applications et de services conçus pour transformer votre expérience digitale
            </p>
          </div>
          
          {user && (
            <Card className="mb-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Bienvenue, {user.email}</CardTitle>
                <CardDescription>
                  Voici vos applications récentes et recommandées
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {recentApps.map((app) => (
                    <Button
                      key={app.id}
                      variant="outline"
                      className="h-auto py-4 flex items-center justify-start gap-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => navigate(app.url)}
                    >
                      <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                        {app.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{app.name}</div>
                        <div className="text-xs text-slate-500">{app.lastUsed}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
                    <Settings className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/ai-studio')}>
                    <Bot className="h-4 w-4" />
                    AI Studio
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/forms')}>
                    <FileText className="h-4 w-4" />
                    Forms
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/cloud')}>
                    <Cloud className="h-4 w-4" />
                    Cloud
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-3">
              <Tabs defaultValue="ai">
                <div className="mb-6">
                  <TabsList className="w-full max-w-3xl mx-auto bg-slate-100 dark:bg-slate-800 p-1">
                    {productCategories.map((category) => (
                      <TabsTrigger 
                        key={category.id}
                        value={category.id}
                        className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {productCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="space-y-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{category.name}</h2>
                      <p className="text-slate-600 dark:text-slate-400">{category.description}</p>
                    </div>
                    {renderCardList(category.products)}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            
            <div className="space-y-8">
              <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <div className="p-2 w-fit rounded-md bg-slate-100 dark:bg-slate-800">
                    <Rocket className="h-5 w-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">Fonctionnalités à venir</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 h-fit">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{feature.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                        <Badge variant="outline" className="mt-1.5 text-xs">
                          {feature.date}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/roadmap')}>
                    Voir la roadmap
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
                <CardHeader>
                  <div className="p-2 w-fit rounded-md bg-violet-100 dark:bg-violet-900/30">
                    <Heart className="h-5 w-5 text-violet-500" />
                  </div>
                  <CardTitle className="text-xl">Nous contacter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Une question ou une suggestion ? Notre équipe est à votre disposition pour vous aider.
                  </p>
                  <Button variant="default" className="w-full" onClick={() => navigate('/contact')}>
                    Contacter l'équipe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EcosystemPage;
