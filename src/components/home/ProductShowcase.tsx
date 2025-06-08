
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Cloud, 
  Mail, 
  FileText, 
  Languages, 
  Network, 
  Code, 
  Search,
  Newspaper,
  CloudSun,
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const ProductShowcase = () => {
  const products = [
    {
      icon: Bot,
      title: "LuvviX AI Studio",
      description: "Créez et déployez vos agents IA personnalisés avec une interface intuitive et des capacités avancées.",
      features: ["Agents conversationnels", "Intégration API", "Formation personnalisée"],
      color: "from-purple-600 to-indigo-600",
      route: "/ai-studio",
      badge: "Populaire"
    },
    {
      icon: Cloud,
      title: "LuvviX Cloud",
      description: "Unifiez tous vos services cloud (Google Drive, Dropbox, OneDrive) en une seule interface sécurisée.",
      features: ["Synchronisation temps réel", "Chiffrement E2E", "Gestion unifiée"],
      color: "from-cyan-600 to-blue-600",
      route: "/cloud",
      badge: "Nouveau"
    },
    {
      icon: Mail,
      title: "LuvviX Mail",
      description: "Interface de messagerie intelligente avec IA intégrée pour organiser et répondre à vos emails.",
      features: ["Multi-comptes", "Réponses IA", "Filtrage intelligent"],
      color: "from-emerald-600 to-teal-600",
      route: "/mail",
      badge: "Bientôt"
    },
    {
      icon: FileText,
      title: "LuvviX Forms",
      description: "Créez des formulaires intelligents avec validation automatique et analyses avancées.",
      features: ["Validation IA", "Analyses en temps réel", "Intégrations"],
      color: "from-pink-600 to-rose-600",
      route: "/forms"
    },
    {
      icon: Languages,
      title: "LuvviX Translate",
      description: "Traduction instantanée multilingue avec reconnaissance vocale et adaptation contextuelle.",
      features: ["130+ langues", "Reconnaissance vocale", "Contexte intelligent"],
      color: "from-orange-600 to-amber-600",
      route: "/translate"
    },
    {
      icon: Search,
      title: "LuvviX Explore",
      description: "Moteur de recherche IA multimodal pour explorer le web avec une intelligence avancée.",
      features: ["Recherche multimodale", "Résultats enrichis", "Analyse sémantique"],
      color: "from-violet-600 to-purple-600",
      route: "/explore"
    }
  ];

  return (
    <section id="products" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Nos Solutions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Un écosystème complet pour votre réussite
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Découvrez notre suite d'applications intégrées, conçues pour transformer votre façon de travailler avec l'intelligence artificielle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-transparent hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700">
                {product.badge && (
                  <div className="absolute -top-3 -right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${product.color}`}>
                      {product.badge}
                    </span>
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${product.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <product.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {product.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {product.description}
                </p>
                
                <ul className="space-y-2 mb-8">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link to={product.route}>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                  >
                    Explorer
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à transformer votre workflow ?
              </h3>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers d'utilisateurs qui ont déjà optimisé leur productivité avec LuvviX.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 font-semibold px-8">
                    Créer un compte gratuit
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8">
                  Voir la démo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcase;
