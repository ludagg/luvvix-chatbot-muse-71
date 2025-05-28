
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";
import { HoverGlowCard } from "@/components/ui/hover-glow-card";

const Ecosystem = () => {
  const applications = [
    {
      name: "Center",
      description: "Réseau social central de l'écosystème LuvviX avec messagerie, groupes et mini-jeux",
      status: "Actif",
      category: "Social",
      features: ["Timeline IA", "Messagerie temps réel", "Groupes", "Mini-jeux", "Profils vérifiés"],
      color: "from-purple-500 to-pink-500",
      link: "/center",
      icon: "🌐"
    },
    {
      name: "LuvviX Learn", 
      description: "Plateforme d'apprentissage IA avec cours personnalisés et certifications",
      status: "Actif",
      category: "Éducation", 
      features: ["Cours IA personnalisés", "Certifications", "Suivi de progression", "Communauté d'apprenants"],
      color: "from-blue-500 to-cyan-500",
      link: "/learn",
      icon: "🎓"
    },
    {
      name: "AI Studio",
      description: "Créateur d'agents IA personnalisés pour automatiser vos tâches",
      status: "Actif",
      category: "IA",
      features: ["Création d'agents", "Marketplace", "Chat intégré", "Personnalisation avancée"],
      color: "from-green-500 to-emerald-500",
      link: "/ai-studio",
      icon: "🤖"
    },
    {
      name: "LuvviX Analytics",
      description: "Tableau de bord d'analyse de données avec insights IA et rapports automatisés",
      status: "Actif", 
      category: "Business",
      features: ["Dashboards temps réel", "Insights IA", "Rapports automatisés", "Analyse prédictive"],
      color: "from-orange-500 to-red-500",
      link: "/analytics",
      icon: "📊"
    },
    {
      name: "LuvviX Crawler",
      description: "Extracteur de contenu web avec analyse IA et détection de frameworks",
      status: "Actif",
      category: "Outils",
      features: ["Extraction de contenu", "Analyse IA", "Support JavaScript", "Détection frameworks"],
      color: "from-indigo-500 to-purple-500",
      link: "/crawler",
      icon: "🕷️"
    },
    {
      name: "LuvviX Docs",
      description: "Générateur de documentation intelligent avec IA pour vos projets",
      status: "Actif",
      category: "Outils",
      features: ["Génération IA", "Templates", "Export multi-format", "Collaboration"],
      color: "from-teal-500 to-blue-500",
      link: "/docs-generator",
      icon: "📚"
    },
    {
      name: "Code Studio",
      description: "IDE web collaboratif avec assistance IA pour développement",
      status: "Actif",
      category: "Développement",
      features: ["IDE collaboratif", "Assistance IA", "Support multi-langages", "Débogage intelligent"],
      color: "from-gray-600 to-gray-800",
      link: "/code-studio",
      icon: "💻"
    },
    {
      name: "LuvviX Cloud",
      description: "Stockage cloud sécurisé avec chiffrement et synchronisation multi-appareils",
      status: "Actif",
      category: "Stockage",
      features: ["Stockage sécurisé", "Synchronisation", "Partage", "Chiffrement"],
      color: "from-sky-500 to-blue-600",
      link: "/cloud",
      icon: "☁️"
    },
    {
      name: "LuvviX Forms",
      description: "Créateur de formulaires intelligents avec analyse automatique des réponses",
      status: "Actif",
      category: "Productivité",
      features: ["Création de formulaires", "Analyse IA", "Réponses temps réel", "Intégrations"],
      color: "from-violet-500 to-purple-600",
      link: "/forms",
      icon: "📝"
    },
    {
      name: "LuvviX News",
      description: "Agrégateur d'actualités personnalisé avec résumés IA",
      status: "Actif",
      category: "Information",
      features: ["Actualités personnalisées", "Résumés IA", "Sources multiples", "Notifications"],
      color: "from-red-500 to-pink-500",
      link: "/news",
      icon: "📰"
    },
    {
      name: "MindMap",
      description: "Créateur de cartes mentales collaboratives avec suggestions IA",
      status: "Actif",
      category: "Productivité",
      features: ["Cartes mentales", "Collaboration", "Suggestions IA", "Export multiple"],
      color: "from-yellow-500 to-orange-500",
      link: "/mindmap",
      icon: "🧠"
    },
    {
      name: "LuvviX Translate",
      description: "Service de traduction avancé avec IA conversationnelle",
      status: "Actif",
      category: "Outils",
      features: ["Traduction IA", "Multi-langues", "Contexte intelligent", "API"],
      color: "from-green-400 to-blue-500",
      link: "/translate",
      icon: "🌍"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Écosystème LuvviX
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Une suite complète d'applications interconnectées pour révolutionner votre expérience numérique
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {applications.map((app, index) => (
            <HoverGlowCard key={index} className="group cursor-pointer" glowColor="rgba(59, 130, 246, 0.3)">
              <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${app.color} flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                    {app.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-center mb-2">
                    {app.name}
                  </CardTitle>
                  <div className="flex justify-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {app.category}
                    </Badge>
                    <Badge 
                      variant={app.status === "Actif" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">
                    {app.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {app.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      asChild 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <a href={app.link}>
                        <Play className="w-4 h-4 mr-2" />
                        Utiliser
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </HoverGlowCard>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Connecté par LuvviX ID</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Toutes ces applications sont interconnectées grâce à votre identité LuvviX ID unique. 
              Une seule connexion pour accéder à tout l'écosystème.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <a href="/auth">
                Créer mon compte LuvviX ID
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;
