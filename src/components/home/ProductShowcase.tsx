
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Mail, FileText, Bot, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductShowcase = () => {
  const products = [
    {
      icon: Cloud,
      name: 'LuvviX Cloud',
      description: 'Unifiez tous vos services cloud en une seule interface moderne et sécurisée',
      features: ['Google Drive', 'Dropbox', 'OneDrive', 'Synchronisation'],
      href: '/cloud',
      gradient: 'from-blue-500 to-cyan-500',
      status: 'Nouveau'
    },
    {
      icon: Mail,
      name: 'LuvviX Mail',
      description: 'Interface email moderne qui centralise tous vos comptes de messagerie',
      features: ['Gmail', 'Outlook', 'Interface unifiée', 'Recherche IA'],
      href: '/mail',
      gradient: 'from-purple-500 to-pink-500',
      status: 'Bientôt'
    },
    {
      icon: FileText,
      name: 'LuvviX Forms',
      description: 'Créez des formulaires intelligents avec analytics avancés',
      features: ['Création IA', 'Analytics', 'Intégrations', 'Réponses temps réel'],
      href: '/forms',
      gradient: 'from-green-500 to-emerald-500',
      status: 'Disponible'
    },
    {
      icon: Bot,
      name: 'AI Studio',
      description: 'Créez et déployez vos agents IA personnalisés sans programmation',
      features: ['Chat IA', 'Intégration web', 'API complète', 'Formation custom'],
      href: '/ai-studio',
      gradient: 'from-violet-500 to-purple-500',
      status: 'Beta'
    }
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Suite d'applications
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Tout ce dont vous avez besoin,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> en un seul endroit</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Découvrez notre écosystème d'applications conçues pour simplifier et améliorer votre productivité numérique
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <CardContent className="p-8 relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${product.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <product.icon className="w-8 h-8" />
                    </div>
                    <Badge variant={product.status === 'Disponible' ? 'default' : 'secondary'} className="text-xs">
                      {product.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed flex-grow">
                    {product.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Link to={product.href} className="mt-auto">
                    <Button className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Découvrir
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <Link to="/ecosystem">
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-medium">
              Voir tous nos produits
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcase;
