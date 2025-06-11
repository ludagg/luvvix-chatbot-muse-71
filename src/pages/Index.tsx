import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedAppsCarousel from "@/components/FeaturedAppsCarousel";
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
import PromotionalSections from "@/components/home/PromotionalSections";
import MobileHomePage from "@/components/mobile/MobileHomePage";
import { useMobileApp } from "@/hooks/use-mobile-app";
import { Bot, FileText, Newspaper, Cloud, Sparkles, AppWindow, ArrowRight, Languages, Network, Code, CloudSun, Search, Mail, Brain, Zap, TrendingUp, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HoverGlowCard } from "@/components/ui/hover-glow-card";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const { t } = useLanguage();
  const { isMobileApp } = useMobileApp();
  
  // Si c'est une app mobile, afficher la page d'accueil simplifiée
  if (isMobileApp) {
    return <MobileHomePage />;
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Revolutionary Dashboard Promo - New Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Brain className="w-12 h-12 text-yellow-300" />
              <Sparkles className="w-8 h-8 text-yellow-300" />
              <Zap className="w-10 h-10 text-yellow-300" />
            </div>
            
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
              Révolutionnaire : LuvviX Neural Dashboard
            </h2>
            
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              L'IA qui apprend de vous, prédit vos besoins et automatise votre vie digitale. 
              <br />
              Expérience révolutionnaire qui change tout.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Brain className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
                <h3 className="font-bold mb-2">IA Prédictive</h3>
                <p className="text-sm opacity-80">Anticipe vos besoins avant que vous ne les ressentiez</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Workflow className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Automatisation Totale</h3>
                <p className="text-sm opacity-80">Workflows intelligents qui s'adaptent à votre style</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <TrendingUp className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Analyse du Futur</h3>
                <p className="text-sm opacity-80">Tendances et insights pour optimiser votre productivité</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link to="/revolutionary">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-6 h-6 mr-3" />
                  Découvrir l'Expérience Révolutionnaire
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              
              <p className="text-sm opacity-75">
                🚀 Bêta exclusive • Accès anticipé à la révolution LuvviX
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-300 rounded-full opacity-20 animate-ping"></div>
      </section>
      
      {/* Sections promotionnelles */}
      <PromotionalSections />
      
      {/* Carousel des applications phares */}
      <FeaturedAppsCarousel />
      
      {/* Section pour diriger vers l'écosystème complet */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold mb-4">Plus d'Applications LuvviX</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explorez toute notre suite d'applications innovantes
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">LuvviX Mail</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Messagerie professionnelle avec IA intégrée.</p>
                <Link to="/mail">
                  <Button variant="outline" size="sm">{t.common.view}</Button>
                </Link>
              </div>
            </HoverGlowCard>
            
            <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                  <Languages className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.app.translate}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Traduction IA instantanée avec reconnaissance vocale.</p>
                <Link to="/translate">
                  <Button variant="outline" size="sm">{t.common.view}</Button>
                </Link>
              </div>
            </HoverGlowCard>
            
            <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                  <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.app.mindmap}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Cartes mentales intelligentes pour organiser vos idées.</p>
                <Link to="/mindmap">
                  <Button variant="outline" size="sm">{t.common.view}</Button>
                </Link>
              </div>
            </HoverGlowCard>
            
            <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <Code className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.app.codeStudio}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Génération et optimisation de code avec IA.</p>
                <Link to="/code-studio">
                  <Button variant="outline" size="sm">{t.common.view}</Button>
                </Link>
              </div>
            </HoverGlowCard>
            
            <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-sky-100 dark:bg-sky-900/30 rounded-full mb-4">
                  <Cloud className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.app.cloud}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Connectez vos services cloud et gérez vos fichiers avec l'IA.</p>
                <Link to="/cloud">
                  <Button variant="outline" size="sm">{t.common.view}</Button>
                </Link>
              </div>
            </HoverGlowCard>
            
            <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                  <Newspaper className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  <Sparkles className="w-4 h-4 absolute top-3 right-3 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.app.news}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Restez informé avec des actualités personnalisées.</p>
                <Link to="/news">
                  <Button variant="outline" size="sm">{t.common.view}</Button>
                </Link>
              </div>
            </HoverGlowCard>
            
            <HoverGlowCard className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 rounded-full mb-4">
                  <CloudSun className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.app.weather}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Prévisions météo intelligentes et alertes.</p>
                <Link to="/weather">
                  <Button variant="outline" size="sm">{t.common.view}</Button>
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

</edits_to_apply>
