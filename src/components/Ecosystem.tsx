
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Brain, 
  HeartPulse, 
  Radio, 
  FlaskConical, 
  Cloud,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const ecosystemProducts = [
  {
    name: "LuvviX AI",
    icon: Brain,
    description: "Plateforme d'intelligence artificielle intégrée pour des interactions naturelles et productives.",
    gradient: "from-blue-500/20 to-blue-600/20",
    hover: "hover:from-blue-500/30 hover:to-blue-600/30",
    iconColor: "text-blue-500",
    link: "/ai-studio"
  },
  {
    name: "LuvviX AI Studio",
    icon: Sparkles,
    description: "Créez, personnalisez et publiez vos propres agents IA sans code pour vos besoins spécifiques.",
    gradient: "from-violet-500/20 to-violet-600/20",
    hover: "hover:from-violet-500/30 hover:to-violet-600/30",
    iconColor: "text-violet-500",
    link: "/ai-studio"
  },
  {
    name: "LuvviX Medic",
    icon: HeartPulse,
    description: "Solutions de santé numérique pour professionnels et patients, assistance médicale et diagnostic assisté.",
    gradient: "from-emerald-500/20 to-emerald-600/20",
    hover: "hover:from-emerald-500/30 hover:to-emerald-600/30",
    iconColor: "text-emerald-500",
    link: "#"
  },
  {
    name: "LuvviX StreamMix",
    icon: Radio,
    description: "Écosystème média nouvelle génération pour création, distribution et monétisation de contenu.",
    gradient: "from-orange-500/20 to-orange-600/20",
    hover: "hover:from-orange-500/30 hover:to-orange-600/30",
    iconColor: "text-orange-500",
    link: "#"
  },
  {
    name: "LuvviX Research",
    icon: FlaskConical,
    description: "Centre d'innovation pour les technologies émergentes, intelligence artificielle avancée et médecine.",
    gradient: "from-purple-500/20 to-purple-600/20",
    hover: "hover:from-purple-500/30 hover:to-purple-600/30",
    iconColor: "text-purple-500",
    link: "#"
  },
  {
    name: "LuvviX Cloud",
    icon: Cloud,
    description: "Infrastructure cloud sécurisée et évolutive pour le développement et le déploiement d'applications.",
    gradient: "from-sky-500/20 to-sky-600/20",
    hover: "hover:from-sky-500/30 hover:to-sky-600/30",
    iconColor: "text-sky-500",
    link: "/cloud"
  }
];

const Ecosystem = () => {
  return (
    <section id="ecosystem" className="relative py-32 bg-[#1A1F2C]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Notre Écosystème
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Découvrez nos solutions intégrées conçues pour transformer votre expérience numérique
          </p>
        </div>

        {/* Ecosystem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ecosystemProducts.map((product, index) => (
            <div 
              key={index} 
              className={`rounded-2xl bg-gradient-to-br ${product.gradient} backdrop-blur-sm border border-white/5 p-8 transition-all duration-300 hover:scale-105 ${product.hover}`}
            >
              <div className="flex items-start mb-6">
                <div className={`p-3 rounded-xl bg-white/10 ${product.iconColor}`}>
                  <product.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold ml-4 text-white">{product.name}</h3>
              </div>

              <p className="text-white/70 mb-8 text-lg">
                {product.description}
              </p>

              <Button
                variant="ghost" 
                className="text-white hover:bg-white/10 group"
                asChild
              >
                <Link to={product.link}>
                  Explorer
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* LuvviX ID Card */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-8 text-center backdrop-blur-sm border border-white/10">
            <h3 className="text-2xl font-bold mb-4 text-white">Un ID, tous les services</h3>
            <p className="text-lg text-white/70 mb-6">
              Créez un compte LuvviX ID pour accéder à l'ensemble de notre écosystème
            </p>
            <Button 
              size="lg"
              className="bg-white text-luvvix-purple hover:bg-white/90"
              asChild
            >
              <Link to="/auth">
                Créer votre LuvviX ID
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;
