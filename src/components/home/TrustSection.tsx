
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Globe, TrendingUp, CheckCircle } from 'lucide-react';

const TrustSection = () => {
  const stats = [
    { icon: Users, value: "10K+", label: "Utilisateurs actifs" },
    { icon: Globe, value: "50+", label: "Pays" },
    { icon: TrendingUp, value: "99.9%", label: "Disponibilité" },
    { icon: Shield, value: "100%", label: "Sécurisé" }
  ];

  const certifications = [
    "GDPR Compliant",
    "SSL/TLS",
    "ISO 27001",
    "SOC 2"
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité et confiance
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Une plateforme de 
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> confiance</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            LuvviX Technologies s'engage à protéger vos données avec les plus hauts standards 
            de sécurité et de confidentialité du marché.
          </p>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Certifications et conformité
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-3 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{cert}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
