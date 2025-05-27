
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  CloudSun
} from "lucide-react";

interface EcosystemCardProps {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  external?: boolean;
  color: string;
  available?: boolean;
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
              title: "LuvviX AI Studio",
              description: "Créez et déployez vos propres agents IA intelligents sans code.",
              icon: <Brain size={48} />,
              link: "/ai-studio",
              color: "bg-gradient-to-br from-purple-500 to-blue-500",
              available: true,
            },
            {
              id: 2,
              title: "LuvviX Translate",
              description: "Traduction instantanée alimentée par Gemini AI avec reconnaissance vocale.",
              icon: <Languages size={48} />,
              link: "/translate",
              color: "bg-gradient-to-br from-blue-500 to-purple-500",
              available: true,
            },
            {
              id: 3,
              title: "LuvviX MindMap",
              description: "Créez des cartes mentales intelligentes avec l'IA pour organiser vos idées.",
              icon: <Network size={48} />,
              link: "/mindmap",
              color: "bg-gradient-to-br from-indigo-500 to-purple-500",
              available: true,
            },
            {
              id: 4,
              title: "LuvviX Code Studio",
              description: "Génération et optimisation de code intelligente avec Gemini AI.",
              icon: <Code size={48} />,
              link: "/code-studio",
              color: "bg-gradient-to-br from-green-500 to-emerald-500",
              available: true,
            },
            {
              id: 5,
              title: "LuvviX Forms",
              description: "Créez des formulaires personnalisés et collectez des données facilement.",
              icon: <FileText size={48} />,
              link: "/forms",
              color: "bg-gradient-to-br from-pink-500 to-rose-500",
              available: true,
            },
            {
              id: 6,
              title: "LuvviX Cloud",
              description: "Stockage en nuage sécurisé et accessible pour tous vos fichiers.",
              icon: <Cloud size={48} />,
              link: "/cloud",
              color: "bg-gradient-to-br from-sky-500 to-blue-500",
              available: true,
            },
            {
              id: 7,
              title: "LuvviX News",
              description: "Actualités personnalisées et alertes en temps réel.",
              icon: <BarChart size={48} />,
              link: "/news",
              color: "bg-gradient-to-br from-amber-500 to-yellow-500",
              available: true,
            },
            {
              id: 8,
              title: "LuvviX Weather",
              description: "Prévisions météorologiques intelligentes et alertes personnalisées.",
              icon: <CloudSun size={48} />,
              link: "/weather",
              color: "bg-gradient-to-br from-cyan-500 to-blue-500",
              available: true,
            },
            {
              id: 9,
              title: "LuvviX StreamMix",
              description: "Plateforme de streaming audio et vidéo pour une expérience immersive.",
              icon: <Radio size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-orange-500 to-red-500",
              available: false,
            },
            {
              id: 10,
              title: "LuvviX Medic",
              description: "Solutions de santé innovantes pour une meilleure gestion de votre bien-être.",
              icon: <HeartPulse size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-green-500 to-teal-500",
              available: false,
            },
            {
              id: 11,
              title: "LuvviX Analytics",
              description: "Outils d'analyse de données pour prendre des décisions éclairées.",
              icon: <BarChart size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-violet-500 to-purple-500",
              available: false,
            },
            {
              id: 12,
              title: "LuvviX Security",
              description: "Protection avancée et sécurisation de vos données personnelles.",
              icon: <Shield size={48} />,
              link: "/#",
              color: "bg-gradient-to-br from-red-500 to-pink-500",
              available: false,
            },
          ].map((card: EcosystemCardProps) => (
            <motion.div
              key={card.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105",
                !card.available && "opacity-60"
              )}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ backgroundColor: hoveredCard === card.id ? '#f9f9f9' : 'inherit' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className={`p-6 ${card.color} text-white flex items-center justify-center h-32 relative`}>
                {card.icon}
                {!card.available && (
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-xs font-medium">Bientôt</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{card.description}</p>
                {card.available ? (
                  <Link to={card.link} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    Découvrir
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Link>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 flex items-center">
                    Bientôt disponible
                    <Zap className="ml-1 w-4 h-4" />
                  </span>
                )}
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
