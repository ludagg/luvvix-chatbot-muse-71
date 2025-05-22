
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, FileText, Newspaper, Cloud, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Ecosystem: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-4">Notre Écosystème</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez l'ensemble des produits LuvviX conçus pour simplifier votre vie numérique
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 h-full flex flex-col">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">LuvviX AI</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                Plateforme d'intelligence artificielle pour créer, gérer et déployer des agents IA
              </p>
              <Link to="/ai-studio" className="mt-auto">
                <Button className="w-full">
                  Découvrir
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 h-full flex flex-col">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">LuvviX Forms</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                Créez des formulaires intelligents, collectez des données et obtenez des analyses détaillées
              </p>
              <Link to="/forms" className="mt-auto">
                <Button className="w-full">
                  Découvrir
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 h-full flex flex-col">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">LuvviX Cloud</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                Stockage en ligne sécurisé avec partage de fichiers et collaboration en temps réel
              </p>
              <Link to="/cloud" className="mt-auto">
                <Button className="w-full">
                  Découvrir
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            Explorer tous les produits
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;
