
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Globe, Sparkles, Bot, Cloud } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const ModernHero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background avec dégradé moderne */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      {/* Particules animées */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-6">
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              L'écosystème numérique tout-en-un
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white leading-tight">
              <span className="block">Bienvenue sur</span> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                LuvviX
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              La plateforme qui révolutionne votre expérience numérique avec des outils IA avancés, 
              un stockage cloud intelligent et une authentification unifiée.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeIn}>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-2xl shadow-purple-500/25 border-0"
              >
                Commencer maintenant
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const section = document.getElementById('products');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg backdrop-blur-sm"
              >
                Découvrir nos produits
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Features highlights */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div 
              variants={fadeIn}
              className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 mb-4">
                <Bot size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">IA Avancée</h3>
              <p className="text-white/70 text-center">Agents IA personnalisés pour automatiser vos tâches</p>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 mb-4">
                <Cloud size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cloud Unifié</h3>
              <p className="text-white/70 text-center">Connectez tous vos services cloud en un seul endroit</p>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-4 mb-4">
                <Shield size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sécurité Maximale</h3>
              <p className="text-white/70 text-center">Authentification biométrique et chiffrement avancé</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce cursor-pointer"
        onClick={() => {
          const section = document.getElementById('products');
          section?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          ></motion.div>
        </div>
        <span className="text-white/50 text-xs mt-2">Découvrir</span>
      </motion.div>
    </section>
  );
};

export default ModernHero;
