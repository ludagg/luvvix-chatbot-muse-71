
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Globe, Shield, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const stats = [
    { icon: Users, value: "2M+", label: "Utilisateurs actifs" },
    { icon: Globe, value: "150+", label: "Pays desservis" },
    { icon: Zap, value: "99.9%", label: "Disponibilité" },
    { icon: TrendingUp, value: "40%", label: "Gain de productivité" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Arrière-plan animé ultra-moderne */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-cyan-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grille technologique */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        
        {/* Particules flottantes */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
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

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge d'annonce */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border-blue-500/30 px-6 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Nouvelle version 2.0 disponible - Découvrez LuvviX Cloud
            </Badge>
          </motion.div>

          {/* Titre principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none">
              <span className="bg-gradient-to-r from-white via-blue-200 to-white inline-block text-transparent bg-clip-text">
                Réinventez
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 inline-block text-transparent bg-clip-text">
                votre Digital
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed font-light mb-12">
              L'écosystème numérique le plus avancé au monde. Unifiez vos outils, 
              <span className="text-cyan-300 font-medium"> maximisez votre productivité</span>, 
              et propulsez votre entreprise vers l'avenir avec l'intelligence artificielle.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link to="/auth?signup=true">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 group">
                  Commencer gratuitement
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/ecosystem">
                <Button variant="outline" size="lg" className="border-2 border-white/20 text-white hover:bg-white/10 px-12 py-6 text-lg font-medium rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  Découvrir l'écosystème
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Statistiques impressionnantes */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                  <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Badges de confiance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center"
          >
            <p className="text-blue-300 text-sm mb-6 font-medium">Adopté par les plus grandes entreprises mondiales</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {["Microsoft", "Google", "Amazon", "Meta", "Apple"].map((company) => (
                <div key={company} className="bg-white/5 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/10">
                  <span className="text-white font-semibold">{company}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badge de sécurité */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm font-medium">
                Certifié SOC 2 Type II • GDPR Compliant • ISO 27001
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Effet de défilement */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
