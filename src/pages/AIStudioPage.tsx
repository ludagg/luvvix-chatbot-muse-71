
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  Bot,
  Users,
  Cpu,
  Layers,
  ShieldCheck,
  Globe2,
  Code2
} from "lucide-react";

const AIStudioPage = () => {
  useEffect(() => {
    document.title = "LuvviX AI Studio - Créez vos agents IA personnalisés";
  }, []);

  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f1219] to-[#171c28]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-sm font-medium mb-4">
            <Sparkles size={16} className="mr-2" /> Nouveau dans l'écosystème LuvviX
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Créez vos <span className="text-violet-500">agents IA</span> sans une ligne de code
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl">
            LuvviX AI Studio vous permet de concevoir, entraîner et déployer des assistants IA personnalisés pour vos besoins spécifiques, le tout sans connaissances techniques.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              asChild
            >
              <Link to={user ? "/ai-studio/dashboard" : "/auth?return_to=/ai-studio/dashboard"}>
                {user ? "Accéder à mon dashboard" : "Commencer maintenant"}
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
              asChild
            >
              <Link to="/ai-studio/marketplace">
                Explorer le marketplace
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 mt-10 md:mt-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-blue-600 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1677442135726-67eb079ec2d5?q=80&w=900&auto=format&fit=crop" 
                alt="AI Assistant" 
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Une plateforme complète pour vos agents AI
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            De la conception au déploiement, LuvviX AI Studio vous offre tous les outils nécessaires
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Bot,
              title: "Création intuitive",
              description: "Interface simple et intuitive pour concevoir vos agents IA en quelques minutes sans compétences techniques."
            },
            {
              icon: Layers,
              title: "Contextualisation puissante",
              description: "Importez des documents, du texte ou des URLs pour donner à votre agent IA les connaissances dont il a besoin."
            },
            {
              icon: ShieldCheck,
              title: "Sécurité et confidentialité",
              description: "Vos données sensibles sont traitées avec les plus hauts standards de sécurité et de confidentialité."
            },
            {
              icon: Globe2,
              title: "Déploiement instantané",
              description: "Partagez votre agent via un lien public ou intégrez-le facilement sur votre site web."
            },
            {
              icon: Users,
              title: "Marketplace collaboratif",
              description: "Découvrez, partagez et monétisez vos créations dans notre marketplace communautaire."
            },
            {
              icon: Code2,
              title: "Widgets & intégrations",
              description: "Intégrez facilement vos agents IA sur n'importe quel site web avec notre système de widgets."
            },
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-500 mb-5">
                <feature.icon size={24} />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-white/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-violet-900/20 to-blue-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-16 text-center">
          <Cpu className="mx-auto h-16 w-16 text-violet-500 mb-6" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 max-w-3xl mx-auto">
            Prêt à créer votre premier assistant IA intelligent ?
          </h2>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Rejoignez des milliers d'utilisateurs qui transforment leur façon de travailler avec des assistants IA personnalisés.
          </p>
          
          <Button
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white"
            asChild
          >
            <Link to={user ? "/ai-studio/dashboard" : "/auth?return_to=/ai-studio/dashboard"}>
              {user ? "Accéder à mon dashboard" : "Créer mon premier agent IA"}
            </Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AIStudioPage;
