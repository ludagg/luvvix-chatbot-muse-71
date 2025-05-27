
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ecosystem from "@/components/Ecosystem";
import Authentication from "@/components/Authentication";
import ProductDemos from "@/components/ProductDemos";
import DeveloperSection from "@/components/DeveloperSection";
import LabSection from "@/components/LabSection";
import Careers from "@/components/Careers";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import NewsPreview from "@/components/news/NewsPreview";
import WeatherWidget from "@/components/weather/WeatherWidget";
import FormsPromo from "@/components/forms/FormsPromo";
import CeoSection from "@/components/CeoSection";
import AIStudioPromo from "@/components/ai-studio/AIStudioPromo";
import LuvvixIdPromo from "@/components/LuvvixIdPromo";
import { Bot, FileText, Newspaper, Cloud, Sparkles, AppWindow, ArrowRight, Languages, Network, Code, CloudSun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HoverGlowCard } from "@/components/ui/hover-glow-card";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

        <Hero />
        
        {/* Section pour diriger vers l'écosystème */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold mb-4">Découvrez l'Écosystème LuvviX</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Une suite complète d'applications innovantes pour améliorer votre expérience numérique
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-violet-100 dark:bg-violet-900/30 rounded-full mb-4">
                    <Bot className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Studio</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Créez vos propres agents IA pour automatiser vos tâches.</p>
                  <Link to="/ai-studio">
                    <Button variant="outline" size="sm">Découvrir</Button>
                  </Link>
                </div>
              </HoverGlowCard>
              
              <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    <Languages className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Translate</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Traduction IA instantanée avec reconnaissance vocale.</p>
                  <Link to="/translate">
                    <Button variant="outline" size="sm">Découvrir</Button>
                  </Link>
                </div>
              </HoverGlowCard>
              
              <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                    <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">MindMap</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Cartes mentales intelligentes pour organiser vos idées.</p>
                  <Link to="/mindmap">
                    <Button variant="outline" size="sm">Découvrir</Button>
                  </Link>
                </div>
              </HoverGlowCard>
              
              <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <Code className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Code Studio</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Génération et optimisation de code avec IA.</p>
                  <Link to="/code-studio">
                    <Button variant="outline" size="sm">Découvrir</Button>
                  </Link>
                </div>
              </HoverGlowCard>
              
              <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Forms</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Créez, partagez et analysez des formulaires intelligents.</p>
                  <Link to="/forms">
                    <Button variant="outline" size="sm">Découvrir</Button>
                  </Link>
                </div>
              </HoverGlowCard>
              
              <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-sky-100 dark:bg-sky-900/30 rounded-full mb-4">
                    <Cloud className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Cloud</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Stockez et partagez vos fichiers en toute sécurité.</p>
                  <Link to="/cloud">
                    <Button variant="outline" size="sm">Découvrir</Button>
                  </Link>
                </div>
              </HoverGlowCard>
              
              <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                    <Newspaper className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    <Sparkles className="w-4 h-4 absolute top-3 right-3 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">News</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Restez informé avec des actualités personnalisées.</p>
                  <Link to="/news">
                    <Button variant="outline" size="sm">Découvrir</Button>
                  </Link>
                </div>
              </HoverGlowCard>
              
              <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 rounded-full mb-4">
                    <CloudSun className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Weather</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Prévisions météo intelligentes et alertes.</p>
                  <Link to="/weather">
                    <Button variant="outline" size="sm">Découvrir</Button>
                  </Link>
                </div>
              </HoverGlowCard>
            </div>
            
            <div className="text-center mt-10">
              <Link to="/ecosystem">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  <AppWindow className="w-5 h-5 mr-2" /> 
                  Explorer l'écosystème complet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        <LuvvixIdPromo />
        <AIStudioPromo />
        <Ecosystem />
        <FormsPromo />
        <NewsPreview />
        <Authentication />
        <ProductDemos />
        <DeveloperSection />
        <LabSection />
        <CeoSection />
        <Careers />
        <Testimonials />
      
      
      <Footer />
    </div>
  );
};

export default Index;
