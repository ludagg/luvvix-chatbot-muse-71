
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Users } from "lucide-react";

const TrustSection = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: "Sécurité Enterprise",
      description: "Chiffrement de bout en bout et conformité aux standards internationaux (SOC 2, GDPR)"
    },
    {
      icon: Lock,
      title: "Authentification Biométrique",
      description: "Connexion sécurisée avec empreinte digitale, reconnaissance faciale et clés de sécurité"
    },
    {
      icon: Eye,
      title: "Transparence Totale",
      description: "Contrôlez vos données, exportez-les à tout moment et supprimez votre compte en un clic"
    },
    {
      icon: Users,
      title: "Support 24/7",
      description: "Équipe d'experts disponible en permanence pour vous accompagner"
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité & Confiance
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Votre sécurité, notre priorité
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Nous prenons la protection de vos données très au sérieux. Découvrez pourquoi des milliers d'utilisateurs nous font confiance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start space-x-4 p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Certifié par les leaders de l'industrie
          </p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="font-semibold text-gray-700 dark:text-gray-300">SOC 2 Type II</span>
            </div>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="font-semibold text-gray-700 dark:text-gray-300">GDPR</span>
            </div>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="font-semibold text-gray-700 dark:text-gray-300">ISO 27001</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
