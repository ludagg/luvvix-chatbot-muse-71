import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Plus, CheckCircle, ArrowRight, Zap, Shield, ArrowDownUp } from 'lucide-react';

const CloudIntegration = () => {
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  
  const cloudProviders = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: '🔵',
      color: 'from-blue-500 to-blue-600',
      description: 'Connectez votre Google Drive pour une synchronisation complète',
      features: ['15 GB gratuit', 'Synchronisation temps réel', 'Partage avancé']
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive',
      icon: '🔷',
      color: 'from-blue-600 to-blue-700',
      description: 'Intégration complète avec l\'écosystème Microsoft',
      features: ['5 GB gratuit', 'Office 365 intégré', 'Collaboration']
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      color: 'from-blue-500 to-indigo-600',
      description: 'Solution de stockage cloud professionnelle',
      features: ['2 GB gratuit', 'Versioning avancé', 'API complète']
    },
    {
      id: 'icloud',
      name: 'iCloud Drive',
      icon: '☁️',
      color: 'from-gray-500 to-gray-600',
      description: 'Synchronisation parfaite avec l\'écosystème Apple',
      features: ['5 GB gratuit', 'Sync Apple', 'Photos incluses']
    }
  ];

  const handleConnect = (providerId: string) => {
    // Ici on implémentera la vraie connexion OAuth
    setConnectedProviders(prev => [...prev, providerId]);
  };

  const benefits = [
    {
      icon: <ArrowDownUp className="w-6 h-6" />,
      title: 'Synchronisation Intelligente',
      description: 'Synchronisation bidirectionnelle en temps réel avec détection automatique des conflits'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Sécurité Renforcée',
      description: 'Chiffrement end-to-end et authentification OAuth sécurisée pour tous vos services'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Performance Optimale',
      description: 'Mise en cache intelligente et compression pour des transferts ultra-rapides'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Section connexion des services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cloudProviders.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute inset-0 bg-gradient-to-br ${provider.color} opacity-5`} />
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-2">{provider.icon}</div>
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                <CardDescription className="text-sm">
                  {provider.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {provider.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                {connectedProviders.includes(provider.id) ? (
                  <Badge variant="outline" className="w-full justify-center text-green-600 border-green-200">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Connecté
                  </Badge>
                ) : (
                  <Button 
                    onClick={() => handleConnect(provider.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connecter
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Section avantages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-4 text-blue-600 dark:text-blue-400">
              {benefit.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Cloud className="w-5 h-5 mr-2" />
          Commencer avec LuvviX Cloud
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default CloudIntegration;
