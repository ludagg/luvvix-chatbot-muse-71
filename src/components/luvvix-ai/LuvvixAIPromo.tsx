
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, MessageCircle, Code, User, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LuvvixAIPromo = () => {
  return (
    <section className="py-16 overflow-hidden bg-gradient-to-b from-violet-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Nouveauté LuvviX</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Découvrez <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Luvvix AI</span>, votre assistant IA personnel
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Une intelligence artificielle avancée pour vous aider dans vos tâches quotidiennes, 
              répondre à vos questions et vous assister dans tous vos projets.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <MessageCircle className="h-4 w-4 text-indigo-500 mr-2" />
                <span className="text-sm">Discussions naturelles</span>
              </div>
              
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <BrainCircuit className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-sm">Raisonnement avancé</span>
              </div>
              
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <Code className="h-4 w-4 text-pink-500 mr-2" />
                <span className="text-sm">Aide au code</span>
              </div>
              
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <User className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm">Personnalisable</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/ai">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                  <Bot className="h-5 w-5 mr-2" /> 
                  Essayer Luvvix AI
                </Button>
              </Link>
              
              <Link to="/ai-studio">
                <Button size="lg" variant="outline">
                  En savoir plus
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 dark:from-violet-500/20 dark:to-indigo-500/20" />
              
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                    <span className="font-medium">Luvvix AI</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm max-w-[80%]">
                      <p>Bonjour ! Je suis Luvvix AI, votre assistant personnel. Comment puis-je vous aider aujourd'hui ?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-indigo-600 text-white rounded-lg p-3 text-sm max-w-[80%]">
                      <p>Peux-tu m'expliquer comment fonctionne LuvviX Ecosystem ?</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm max-w-[80%]">
                      <p>LuvviX Ecosystem est une suite d'applications intégrées qui comprend des outils pour la gestion de fichiers, les actualités personnalisées, un studio IA, des formulaires intelligents et bien plus encore. Toutes ces applications partagent une authentification unique via LuvviX ID.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -z-10 -top-6 -right-6">
              <div className="h-24 w-24 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20" />
            </div>
            
            <div className="absolute -z-10 -bottom-6 -left-6">
              <div className="h-16 w-16 rounded-full bg-purple-500/10 dark:bg-purple-500/20" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LuvvixAIPromo;
