
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Inbox, Send, Archive, Search, Star, Paperclip, Users, ArrowRight } from 'lucide-react';

const MailPromo = () => {
  const emailProviders = [
    { name: 'Gmail', icon: '📧', color: 'text-red-500' },
    { name: 'Outlook', icon: '📨', color: 'text-blue-500' },
    { name: 'Yahoo Mail', icon: '💌', color: 'text-purple-500' },
    { name: 'Proton Mail', icon: '🔒', color: 'text-green-500' }
  ];

  const features = [
    {
      icon: <Inbox className="w-6 h-6" />,
      title: 'Interface Unifiée',
      description: 'Tous vos comptes email dans une seule interface moderne et intuitive'
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Recherche IA',
      description: 'Trouvez n\'importe quel email instantanément avec notre recherche intelligente'
    },
    {
      icon: <Paperclip className="w-6 h-6" />,
      title: 'Intégration Cloud',
      description: 'Joignez et sauvegardez des fichiers directement depuis LuvviX Cloud'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Collaboration',
      description: 'Partagez facilement vos emails avec LuvviX Forms et votre équipe'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Aperçu de l'interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <Card className="overflow-hidden max-w-4xl mx-auto shadow-2xl">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6" />
                <span className="font-semibold">LuvviX Mail</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  3 comptes connectés
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700">
            {/* Sidebar */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300">
                  <div className="flex items-center">
                    <Inbox className="w-4 h-4 mr-2" />
                    <span className="text-sm">Boîte de réception</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">42</Badge>
                </div>
                <div className="flex items-center p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <Send className="w-4 h-4 mr-2" />
                  <span className="text-sm">Envoyés</span>
                </div>
                <div className="flex items-center p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <Star className="w-4 h-4 mr-2" />
                  <span className="text-sm">Favoris</span>
                </div>
                <div className="flex items-center p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <Archive className="w-4 h-4 mr-2" />
                  <span className="text-sm">Archives</span>
                </div>
              </div>
            </div>
            
            {/* Liste des emails */}
            <div className="col-span-3 p-4">
              <div className="space-y-3">
                {[
                  { from: 'Marie Dubois', subject: 'Rapport mensuel disponible', time: '14:30', unread: true },
                  { from: 'Team LuvviX', subject: 'Nouvelles fonctionnalités Cloud', time: '12:15', unread: true },
                  { from: 'Jean Martin', subject: 'Réunion équipe demain', time: 'Hier', unread: false }
                ].map((email, index) => (
                  <div key={index} className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${email.unread ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${email.unread ? 'bg-blue-500' : 'bg-transparent'}`} />
                        <span className={`font-medium ${email.unread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {email.from}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{email.time}</span>
                    </div>
                    <p className={`text-sm mt-1 ${email.unread ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                      {email.subject}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Providers supportés */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h3 className="text-xl font-semibold mb-6">Compatible avec tous vos services email</h3>
        <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
          {emailProviders.map((provider, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="text-2xl">{provider.icon}</span>
              <span className={`font-medium ${provider.color}`}>{provider.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Fonctionnalités */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-4 text-purple-600 dark:text-purple-400">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
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
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          <Mail className="w-5 h-5 mr-2" />
          Essayer LuvviX Mail
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default MailPromo;
