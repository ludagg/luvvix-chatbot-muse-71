import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Globe, Check, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Animation variants
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1A1F2C] via-[#2C1F3D] to-[#332145] py-16 pt-24">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {/* Modern abstract shapes */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/10 blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDYwTDYwIDBIMHY2MHoiIGZpbGw9IiMxMTExMTEiIG9wYWNpdHk9Ii4wNSIvPjxwYXRoIGQ9Ik02MCA2MEwwIDBINjB2NjB6IiBmaWxsPSIjMTExMTExIiBvcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-20"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1A1F2C]/80"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-left"
          >
            <motion.div 
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/80 text-sm mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Un écosystème complet pour votre vie numérique
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight"
              variants={fadeIn}
            >
              <span className="block">{t.home.hero.title}</span> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9f75ff] to-[#7debff]">ID</span>
              <span className="block text-3xl md:text-4xl lg:text-5xl mt-2 text-white/90 font-normal">{t.home.hero.subtitle}</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/70 mb-8 max-w-lg"
              variants={fadeIn}
            >
              {t.home.hero.description}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-10"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeIn}>
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-[#9f75ff] to-[#7debff] text-white hover:opacity-90 font-medium px-8 h-12 shadow-lg shadow-purple-500/20"
                >
                  {t.home.hero.getStarted}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    const section = document.getElementById('ecosystem');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-white/30 text-black hover:bg-white/10 font-medium px-8 h-12"
                >
                  {t.home.hero.learnMore}
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Feature highlights */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div 
                variants={fadeIn}
                className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/10"
              >
                <div className="rounded-full bg-purple-500/20 p-2">
                  <Shield size={20} className="text-purple-300" />
                </div>
                <span className="text-white/90">Authentification sécurisée</span>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/10"
              >
                <div className="rounded-full bg-blue-500/20 p-2">
                  <Zap size={20} className="text-blue-300" />
                </div>
                <span className="text-white/90">Connexion instantanée</span>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/10"
              >
                <div className="rounded-full bg-green-500/20 p-2">
                  <Globe size={20} className="text-green-300" />
                </div>
                <span className="text-white/90">Multi-plateforme</span>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/10"
              >
                <div className="rounded-full bg-yellow-500/20 p-2">
                  <Check size={20} className="text-yellow-300" />
                </div>
                <span className="text-white/90">API développeur</span>
              </motion.div>
            </motion.div>

            {/* NOUVELLE SECTION: Promotion LuvviX AI Studio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 p-4 bg-gradient-to-r from-indigo-800/50 to-violet-800/50 rounded-xl border border-indigo-500/30"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Bot size={24} className="text-indigo-300" />
                <h3 className="text-xl font-semibold text-white">LuvviX AI Studio</h3>
                <span className="px-2 py-1 bg-indigo-700/50 rounded-full text-xs text-indigo-200 font-medium">Nouveau</span>
              </div>
              
              <p className="text-white/80 mb-4">
                Créez et gérez vos agents IA personnalisés avec notre studio avancé
              </p>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <Sparkles size={14} className="text-amber-300" />
                  <span className="text-white/90 text-sm">IA avancée</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <Zap size={14} className="text-cyan-300" />
                  <span className="text-white/90 text-sm">Rapide</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <Shield size={14} className="text-green-300" />
                  <span className="text-white/90 text-sm">Sécurisé</span>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate("/ai-studio")}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white w-full"
              >
                Créer mon IA
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Right content - Modern Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9f75ff] to-[#7debff] rounded-2xl blur opacity-30"></div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm bg-white/5">
              <div className="bg-[#1A1F2C]/90 rounded-t-xl p-3 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto flex items-center text-white/80 text-sm">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#9f75ff] to-[#7debff] mr-2"></div>
                  LuvviX ID
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-white/10 to-white/5 p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 mr-3"></div>
                    <div className="space-y-1">
                      <div className="h-2.5 w-24 bg-white/20 rounded-full"></div>
                      <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white/60 text-sm">Email</label>
                    <div className="bg-white/10 h-10 rounded-lg px-3 flex items-center">
                      <div className="w-5 h-5 rounded-full bg-white/20 mr-2"></div>
                      <div className="h-2 w-40 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white/60 text-sm">Mot de passe</label>
                    <div className="bg-white/10 h-10 rounded-lg px-3 flex items-center">
                      <div className="w-5 h-5 rounded-full bg-white/20 mr-2"></div>
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-white/40"></div>
                        <div className="h-2 w-2 rounded-full bg-white/40"></div>
                        <div className="h-2 w-2 rounded-full bg-white/40"></div>
                        <div className="h-2 w-2 rounded-full bg-white/40"></div>
                        <div className="h-2 w-2 rounded-full bg-white/40"></div>
                        <div className="h-2 w-2 rounded-full bg-white/40"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#9f75ff] to-[#7debff] h-10 rounded-lg flex items-center justify-center text-white font-medium">
                    Connexion
                  </div>
                  
                  <div className="pt-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#1A1F2C]/50 text-white/50">ou</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-white/5 border border-white/10 rounded-lg h-10 flex items-center justify-center text-white/80 text-sm">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#4285F4">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg h-10 flex items-center justify-center text-white/80 text-sm">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#000">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="white" />
                        </svg>
                        Facebook
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 pt-2">
                  <div className="h-2 w-3/4 bg-white/10 rounded-full"></div>
                  <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <motion.div
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 8,
                ease: "easeInOut"
              }}
              className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-purple-500/30 to-blue-500/20 rounded-full filter blur-xl"
            ></motion.div>
            
            <motion.div
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 10,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -top-6 -left-6 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full filter blur-xl"
            ></motion.div>
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
          const section = document.getElementById('ecosystem');
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

export default Hero;
