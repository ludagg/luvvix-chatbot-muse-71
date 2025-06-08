
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Play, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ModernHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge d'annonce */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 px-6 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Nouvelle plateforme digitale révolutionnaire
            </Badge>
          </motion.div>

          {/* Titre principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="text-gray-900 dark:text-white">
                Transformez votre
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                écosystème digital
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              LuvviX Technologies révolutionne votre expérience numérique avec une suite d'applications 
              intégrées, intelligentes et sécurisées pour particuliers et entreprises.
            </p>
          </motion.div>

          {/* Points clés */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 mb-12 text-sm text-gray-600 dark:text-gray-400"
          >
            {[
              "Interface unifiée",
              "Sécurité enterprise",
              "100% cloud"
            ].map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                {feature}
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <Link to="/auth?signup=true">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Commencer gratuitement
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="px-10 py-6 text-lg font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
              <Play className="mr-3 w-5 h-5" />
              Voir la démo
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-gray-500 text-sm mb-6">Rejoignez des milliers d'utilisateurs qui nous font confiance</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Startup</div>
              <div className="text-2xl font-bold text-gray-400">Enterprise</div>
              <div className="text-2xl font-bold text-gray-400">Education</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ModernHero;
