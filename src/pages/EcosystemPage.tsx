import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { HoverGlowCard } from "@/components/ui/hover-glow-card";
import { motion } from "framer-motion";
import { Bot, FileText, Newspaper, Cloud, Sparkles, AppWindow, ArrowRight, Globe, Palette, ShieldCheck, Zap, MessageSquare, Lightbulb, Briefcase, Headphones, PenTool, BarChart, Layers, Smartphone } from "lucide-react";
import LuvvixAIPromo from "@/components/luvvix-ai/LuvvixAIPromo";

const EcosystemPage = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // App categories
  const appCategories = [
    {
      name: "IA & Chatbots",
      description: "Assistants intelligents et outils de traitement de langage naturel",
      apps: [
        {
          id: "luvvix-ai",
          name: "Luvvix AI",
          description: "Assistant IA personnel avec capacités de raisonnement avancées",
          icon: <Bot className="h-6 w-6" />,
          color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
          url: "/ai",
          featured: true
        },
        {
          id: "ai-studio",
          name: "AI Studio",
          description: "Créez et personnalisez vos propres agents IA",
          icon: <Lightbulb className="h-6 w-6" />,
          color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
          url: "/ai-studio",
          featured: true
        },
        {
          id: "ai-chat",
          name: "AI Chat",
          description: "Discutez avec des modèles d'IA spécialisés",
          icon: <MessageSquare className="h-6 w-6" />,
          color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
          url: "/ai-chat",
          featured: false
        }
      ]
    },
    {
      name: "Productivité",
      description: "Outils pour améliorer votre efficacité quotidienne",
      apps: [
        {
          id: "forms",
          name: "Forms",
          description: "Créez et partagez des formulaires intelligents",
          icon: <FileText className="h-6 w-6" />,
          color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
          url: "/forms",
          featured: true
        },
        {
          id: "cloud",
          name: "Cloud",
          description: "Stockage et partage de fichiers sécurisé",
          icon: <Cloud className="h-6 w-6" />,
          color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
          url: "/cloud",
          featured: true
        },
        {
          id: "calendar",
          name: "Calendar",
          description: "Planifiez et organisez vos événements",
          icon: <Layers className="h-6 w-6" />,
          color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
          url: "/calendar",
          featured: false
        }
      ]
    },
    {
      name: "Information",
      description: "Restez informé avec des contenus personnalisés",
      apps: [
        {
          id: "news",
          name: "News",
          description: "Actualités personnalisées avec IA",
          icon: <Newspaper className="h-6 w-6" />,
          color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
          url: "/news",
          featured: true
        },
        {
          id: "weather",
          name: "Weather",
          description: "Prévisions météo précises et localisées",
          icon: <Globe className="h-6 w-6" />,
          color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
          url: "/weather",
          featured: false
        }
      ]
    },
    {
      name: "Divertissement",
      description: "Applications pour vos moments de détente",
      apps: [
        {
          id: "streaming",
          name: "Streaming",
          description: "Plateforme de streaming vidéo et audio",
          icon: <Headphones className="h-6 w-6" />,
          color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
          url: "/streaming",
          featured: false
        },
        {
          id: "games",
          name: "Games",
          description: "Jeux en ligne avec IA adaptative",
          icon: <Zap className="h-6 w-6" />,
          color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
          url: "/games",
          featured: false
        }
      ]
    },
    {
      name: "Professionnel",
      description: "Solutions pour les entreprises et professionnels",
      apps: [
        {
          id: "analytics",
          name: "Analytics",
          description: "Analyses de données et tableaux de bord",
          icon: <BarChart className="h-6 w-6" />,
          color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
          url: "/analytics",
          featured: false
        },
        {
          id: "design",
          name: "Design Studio",
          description: "Création graphique assistée par IA",
          icon: <Palette className="h-6 w-6" />,
          color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
          url: "/design",
          featured: false
        },
        {
          id: "business",
          name: "Business Suite",
          description: "Outils de gestion d'entreprise",
          icon: <Briefcase className="h-6 w-6" />,
          color: "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400",
          url: "/business",
          featured: false
        }
      ]
    },
    {
      name: "Sécurité",
      description: "Protection de vos données et de votre vie privée",
      apps: [
        {
          id: "id",
          name: "LuvviX ID",
          description: "Authentification sécurisée et gestion d'identité",
          icon: <ShieldCheck className="h-6 w-6" />,
          color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
          url: "/id",
          featured: true
        },
        {
          id: "vault",
          name: "Vault",
          description: "Gestionnaire de mots de passe et coffre-fort numérique",
          icon: <ShieldCheck className="h-6 w-6" />,
          color: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
          url: "/vault",
          featured: false
        }
      ]
    },
    {
      name: "Mobile",
      description: "Applications mobiles de l'écosystème LuvviX",
      apps: [
        {
          id: "mobile-app",
          name: "LuvviX Mobile",
          description: "Application mobile tout-en-un",
          icon: <Smartphone className="h-6 w-6" />,
          color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
          url: "/mobile",
          featured: false
        }
      ]
    }
  ];

  // Filter apps by category or show featured apps if no category is selected
  const filteredApps = activeCategory
    ? appCategories.find(cat => cat.name === activeCategory)?.apps || []
    : appCategories.flatMap(cat => cat.apps.filter(app => app.featured));

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                L'Écosystème <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">LuvviX</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Découvrez notre suite complète d'applications intelligentes et interconnectées pour simplifier votre vie numérique.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Explorer les applications
                </Button>
                <Button size="lg" variant="outline">
                  En savoir plus
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Add Luvvix AI Promo */}
        <LuvvixAIPromo />
        
        {/* App Categories */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Nos Applications</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Une suite complète d'applications conçues pour travailler ensemble et améliorer votre productivité.
              </p>
            </motion.div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="rounded-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                En vedette
              </Button>
              
              {appCategories.map((category) => (
                <Button
                  key={category.name}
                  variant={activeCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.name)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
            
            {/* App Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredApps.map((app) => (
                <Link to={app.url} key={app.id}>
                  <HoverGlowCard className="h-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex flex-col h-full">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${app.color} mb-4`}>
                        {app.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{app.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">{app.description}</p>
                      <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                        Découvrir
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </HoverGlowCard>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Integration Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">Une expérience unifiée</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Toutes nos applications sont conçues pour fonctionner ensemble de manière transparente, 
                  avec une authentification unique et un partage de données sécurisé.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Authentification unique avec LuvviX ID</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Interface utilisateur cohérente</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Partage de données sécurisé entre applications</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 mt-0.5">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Intelligence artificielle intégrée dans chaque application</span>
                  </li>
                </ul>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Créer un compte
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden shadow-xl">
                  <img 
                    src="/images/ecosystem-integration.png" 
                    alt="LuvviX Ecosystem Integration" 
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=LuvviX+Ecosystem";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 pointer-events-none" />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -z-10 -top-6 -right-6">
                  <div className="h-24 w-24 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20" />
                </div>
                <div className="absolute -z-10 -bottom-6 -left-6">
                  <div className="h-16 w-16 rounded-full bg-purple-500/10 dark:bg-purple-500/20" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Prêt à découvrir l'écosystème LuvviX ?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Rejoignez des milliers d'utilisateurs qui simplifient leur vie numérique avec nos applications intelligentes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary">
                Créer un compte gratuit
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Voir les tarifs
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default EcosystemPage;
