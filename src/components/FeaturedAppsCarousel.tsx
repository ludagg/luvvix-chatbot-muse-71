
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles, Zap, Shield, Users, Brain, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const FeaturedAppsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredApps = [
    {
      id: "ai-studio",
      name: "LuvviX AI Studio",
      tagline: "Créez vos agents IA personnalisés",
      description: "Développez, entraînez et déployez des agents IA intelligents adaptés à vos besoins spécifiques. Notre studio vous offre tous les outils nécessaires pour créer votre propre assistant virtuel.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&h=600",
      color: "from-purple-600 via-violet-600 to-indigo-600",
      icon: Brain,
      features: ["Création d'agents", "Marketplace", "Chat intégré", "Déploiement facile"],
      link: "/ai-studio",
      badge: "Populaire"
    },
    {
      id: "explore",
      name: "LuvviX Explore",
      tagline: "Recherche IA multimodale révolutionnaire",
      description: "Explorez le web comme jamais auparavant avec notre moteur de recherche alimenté par l'IA. Recherchez des textes, images, vidéos et bien plus avec une précision inégalée.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=600",
      color: "from-blue-600 via-cyan-600 to-teal-600",
      icon: Globe,
      features: ["Recherche multimodale", "Assistant IA", "Analyse de fichiers", "Résultats instantanés"],
      link: "/explore",
      badge: "Nouveau"
    },
    {
      id: "center",
      name: "LuvviX Center",
      tagline: "Le réseau social du futur",
      description: "Connectez-vous avec une communauté mondiale dans un environnement sécurisé et intelligent. Partagez, collaborez et découvrez de nouvelles opportunités.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&h=600",
      color: "from-pink-600 via-rose-600 to-red-600",
      icon: Users,
      features: ["Réseau social", "Groupes", "Messagerie", "Mini-jeux"],
      link: "/center",
      badge: "Tendance"
    },
    {
      id: "forms",
      name: "LuvviX Forms",
      tagline: "Formulaires intelligents nouvelle génération",
      description: "Créez des formulaires dynamiques avec l'aide de l'IA. Collectez, analysez et visualisez vos données avec une facilité déconcertante.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=600",
      color: "from-emerald-600 via-green-600 to-teal-600",
      icon: Zap,
      features: ["Création assistée", "Analyse automatique", "Visualisation", "Intégrations"],
      link: "/forms",
      badge: "IA Intégrée"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredApps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredApps.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredApps.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredApps.length) % featuredApps.length);
  };

  const currentApp = featuredApps[currentSlide];
  const IconComponent = currentApp.icon;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Applications Phares LuvviX
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Découvrez nos applications les plus innovantes qui transforment votre expérience numérique
          </p>
        </motion.div>

        <div className="relative max-w-7xl mx-auto">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`relative min-h-[500px] bg-gradient-to-r ${currentApp.color} flex items-center`}
              >
                {/* Background Image with Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${currentApp.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                
                {/* Content */}
                <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 lg:p-16">
                  {/* Left Content */}
                  <div className="text-white space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <IconComponent size={32} />
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {currentApp.badge}
                      </Badge>
                    </div>
                    
                    <h3 className="text-4xl lg:text-5xl font-bold leading-tight">
                      {currentApp.name}
                    </h3>
                    
                    <p className="text-xl lg:text-2xl font-medium text-white/90">
                      {currentApp.tagline}
                    </p>
                    
                    <p className="text-lg text-white/80 leading-relaxed">
                      {currentApp.description}
                    </p>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2">
                      {currentApp.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-white/90">
                          <Sparkles size={16} className="text-yellow-300" />
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <div className="pt-4">
                      <Link to={currentApp.link}>
                        <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-8">
                          Découvrir l'application
                          <ExternalLink size={18} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Right Visual */}
                  <div className="hidden lg:flex justify-center items-center">
                    <div className="relative">
                      <div className="w-80 h-80 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <IconComponent size={120} className="text-white/80" />
                      </div>
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-70 animate-pulse" />
                      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm border border-white/30 text-white transition-all duration-200 hover:scale-110"
          >
            <ArrowLeft size={24} />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm border border-white/30 text-white transition-all duration-200 hover:scale-110"
          >
            <ArrowRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {featuredApps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {featuredApps.map((app, index) => {
            const IconComp = app.icon;
            return (
              <Link key={app.id} to={app.link}>
                <Card className={`p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer ${
                  index === currentSlide ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}>
                  <div className="w-12 h-12 mx-auto mb-3 p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white">
                    <IconComp size={24} />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{app.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{app.tagline}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAppsCarousel;
