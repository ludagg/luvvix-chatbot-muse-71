
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Cloud, Mail, FileText, Languages, Search, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeaturesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const features = [
    {
      icon: Bot,
      title: "LuvviX AI Studio",
      description: "Intelligence artificielle Gemini 1.5 Flash intégrée pour créer des agents conversationnels avancés",
      color: "from-purple-500 to-indigo-500",
      badge: "IA Avancée"
    },
    {
      icon: Cloud,
      title: "LuvviX Cloud",
      description: "Synchronisation temps réel avec Google Drive, Dropbox, OneDrive et stockage sécurisé",
      color: "from-cyan-500 to-blue-500",
      badge: "Temps Réel"
    },
    {
      icon: Mail,
      title: "LuvviX Mail",
      description: "Messagerie intelligente avec IA intégrée et traduction automatique multilingue",
      color: "from-emerald-500 to-teal-500",
      badge: "Nouveau"
    },
    {
      icon: FileText,
      title: "LuvviX Forms",
      description: "Formulaires intelligents avec validation IA et analyses comportementales avancées",
      color: "from-pink-500 to-rose-500",
      badge: "Smart"
    },
    {
      icon: Languages,
      title: "LuvviX Translate",
      description: "Traduction instantanée dans plus de 130 langues avec contexte intelligent",
      color: "from-orange-500 to-amber-500",
      badge: "130+ Langues"
    },
    {
      icon: Search,
      title: "LuvviX Explore",
      description: "Moteur de recherche IA multimodal avec analyse sémantique avancée",
      color: "from-violet-500 to-purple-500",
      badge: "Multimodal"
    }
  ];

  const itemsPerView = 3;
  const maxIndex = Math.max(0, features.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Produits Phares
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Découvrez notre écosystème
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Six applications interconnectées pour révolutionner votre façon de travailler
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: -currentIndex * (100 / itemsPerView) + "%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="min-w-0 flex-shrink-0"
                  style={{ width: `${100 / itemsPerView}%` }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="relative mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                          {feature.badge}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesCarousel;
