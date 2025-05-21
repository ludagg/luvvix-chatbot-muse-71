// Nous ne modifions que le début du composant pour ajouter le padding top
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  HeartPulse, 
  Radio, 
  Cloud, 
  FileText, 
  BarChart, 
  Shield, 
  Zap,
  ChevronRight
} from "lucide-react";

interface EcosystemCardProps {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

const Ecosystem = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="ecosystem" className="py-16 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Écosystème LuvviX</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez notre suite complète d'applications et de services conçus pour transformer votre expérience digitale
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/ecosystem" className="inline-flex items-center gap-2">
                Découvrir l'écosystème
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delayChildren: 0.2, staggerChildren: 0.1 }}
        >
          {[
            {
              id: 1,
              title: "LuvviX AI",
              description: "Intelligence artificielle pour automatiser et optimiser vos tâches quotidiennes.",
              icon: <Brain size={48} />,
              link: "/ai-studio",
              color: "bg-gradient-to-br from-purple-500 to-blue-500",
            },
            {
              id: 2,
              title: "LuvviX Medic",
              description: "Solutions de santé innovantes pour une meilleure gestion de votre bien-être.",
              icon: <HeartPulse size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-green-500 to-teal-500",
            },
            {
              id: 3,
              title: "LuvviX StreamMix",
              description: "Plateforme de streaming audio et vidéo pour une expérience multimédia immersive.",
              icon: <Radio size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-orange-500 to-red-500",
            },
            {
              id: 4,
              title: "LuvviX Cloud",
              description: "Stockage en nuage sécurisé et accessible pour tous vos fichiers importants.",
              icon: <Cloud size={48} />,
              link: "/cloud",
              color: "bg-gradient-to-br from-yellow-500 to-amber-500",
            },
            {
              id: 5,
              title: "LuvviX Forms",
              description: "Créez des formulaires personnalisés et collectez des données en toute simplicité.",
              icon: <FileText size={48} />,
              link: "/forms",
              color: "bg-gradient-to-br from-pink-500 to-rose-500",
            },
            {
              id: 6,
              title: "LuvviX Analytics",
              description: "Outils d'analyse de données pour prendre des décisions éclairées et optimiser vos performances.",
              icon: <BarChart size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-indigo-500 to-purple-500",
            },
          ].map((card: EcosystemCardProps) => (
            <motion.div
              key={card.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ backgroundColor: hoveredCard === card.id ? '#f9f9f9' : 'inherit' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className={`p-6 ${card.color} text-white flex items-center justify-center h-32`}>
                {card.icon}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{card.description}</p>
                <Link to={card.link} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                  En savoir plus
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Rejoignez notre écosystème et découvrez comment LuvviX peut transformer votre vie numérique.
          </p>
          <Link to="/auth?signup=true">
            <Button className="bg-luvvix-purple hover:bg-luvvix-darkpurple text-white">
              Créer un compte et commencer
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;
