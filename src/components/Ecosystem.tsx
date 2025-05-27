
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
  ChevronRight,
  ExternalLink,
  Languages,
  Network,
  Code,
  Cpu
} from "lucide-react";

interface EcosystemCardProps {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  external?: boolean;
  color: string;
}

const Ecosystem = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="ecosystem" className="py-16 pt-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">Notre Écosystème</h2>
        <p className="section-subheading">
          Explorez notre suite d'outils et de services conçus pour répondre à tous vos besoins numériques
        </p>

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
              title: "LuvviX Neural Nexus",
              description: "Assistant IA quantique révolutionnaire pour l'optimisation des flux de travail et prédiction comportementale.",
              icon: <Cpu size={48} />,
              link: "/neural-nexus",
              color: "bg-gradient-to-br from-indigo-500 to-purple-500",
            },
            {
              id: 3,
              title: "LuvviX Code Studio",
              description: "Studio de développement IA avec génération intelligente, analyse avancée et optimisation de code.",
              icon: <Code size={48} />,
              link: "/code-studio",
              color: "bg-gradient-to-br from-green-500 to-blue-500",
            },
            {
              id: 4,
              title: "LuvviX Translate",
              description: "Traduction instantanée alimentée par Gemini AI avec reconnaissance vocale et traduction en temps réel.",
              icon: <Languages size={48} />,
              link: "/translate",
              color: "bg-gradient-to-br from-blue-500 to-purple-500",
            },
            {
              id: 5,
              title: "LuvviX MindMap",
              description: "Créez des cartes mentales intelligentes avec l'IA pour organiser vos idées et stimuler votre créativité.",
              icon: <Network size={48} />,
              link: "/mindmap",
              color: "bg-gradient-to-br from-indigo-500 to-purple-500",
            },
            {
              id: 6,
              title: "LuvviX Medic",
              description: "Solutions de santé innovantes pour une meilleure gestion de votre bien-être.",
              icon: <HeartPulse size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-green-500 to-teal-500",
            },
            {
              id: 7,
              title: "LuvviX StreamMix",
              description: "Plateforme de streaming audio et vidéo pour une expérience multimédia immersive.",
              icon: <Radio size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-orange-500 to-red-500",
            },
            {
              id: 8,
              title: "LuvviX Cloud",
              description: "Stockage en nuage sécurisé et accessible pour tous vos fichiers importants.",
              icon: <Cloud size={48} />,
              link: "/cloud",
              color: "bg-gradient-to-br from-yellow-500 to-amber-500",
            },
            {
              id: 9,
              title: "LuvviX Forms",
              description: "Créez des formulaires personnalisés et collectez des données en toute simplicité.",
              icon: <FileText size={48} />,
              link: "/forms",
              color: "bg-gradient-to-br from-pink-500 to-rose-500",
            },
            {
              id: 10,
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
                  {card.external ? <ExternalLink className="ml-1 w-4 h-4" /> : <ChevronRight className="ml-1 w-4 h-4" />}
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
