
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Globe, Zap, Users, TrendingUp, CheckCircle } from 'lucide-react';

const EnterpriseTrust = () => {
  const achievements = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Leader Gartner 2024",
      description: "Reconnu comme leader dans le Magic Quadrant des plateformes numériques intégrées"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sécurité Enterprise",
      description: "Certifications SOC 2 Type II, ISO 27001, et conformité GDPR complète"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "2M+ Utilisateurs",
      description: "Plus de 2 millions d'utilisateurs actifs dans 150+ pays"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "40% de productivité",
      description: "Augmentation moyenne de la productivité constatée par nos clients"
    }
  ];

  const certifications = [
    "SOC 2 Type II", "ISO 27001", "GDPR", "CCPA", "PCI DSS", "FedRAMP"
  ];

  const clients = [
    { name: "Fortune 500", count: "200+" },
    { name: "Gouvernements", count: "50+" },
    { name: "Universités", count: "1000+" },
    { name: "Startups", count: "10K+" }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mb-6">
            <Globe className="w-4 h-4 mr-2" />
            Confiance mondiale
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            La plateforme de confiance des 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> leaders mondiaux</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Rejoignez les entreprises les plus innovantes qui ont choisi LuvviX 
            pour transformer leur écosystème numérique et accélérer leur croissance.
          </p>
        </motion.div>

        {/* Réalisations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                    {achievement.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Types de clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Nos clients nous font confiance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {clients.map((client, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
                  {client.count}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {client.name}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            Certifications et conformité
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{cert}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-6 py-3">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-semibold">
                99.9% de disponibilité garantie • Support 24/7 • SLA Enterprise
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default EnterpriseTrust;
