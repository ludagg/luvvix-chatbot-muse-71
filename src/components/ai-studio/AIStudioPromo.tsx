
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Zap, Brain, Users } from "lucide-react";

const AIStudioPromo = () => {
  return (
    <section id="ai-studio" className="py-20 bg-gradient-to-b from-violet-900/20 to-slate-900/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium">
              <Sparkles size={16} className="mr-2" /> Nouvelle fonctionnalité phare
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Créez vos <span className="text-violet-400">assistants IA</span> personnalisés
            </h2>
            
            <p className="text-lg text-white/70">
              LuvviX AI Studio révolutionne la création d'agents IA. Sans code, personnalisez des assistants 
              intelligents pour tous vos besoins, du service client à l'analyse de données.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-violet-500/20 rounded-lg text-violet-400">
                  <Brain size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-white">IA contextuelle</h3>
                  <p className="text-sm text-white/60">Alimentez vos agents avec vos données personnelles</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-violet-500/20 rounded-lg text-violet-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-white">Intégration facile</h3>
                  <p className="text-sm text-white/60">Un simple code pour l'ajouter à votre site</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-violet-500/20 rounded-lg text-violet-400">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-white">Marketplace d'IA</h3>
                  <p className="text-sm text-white/60">Découvrez et partagez des agents créés par la communauté</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-violet-500/20 rounded-lg text-violet-400">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-white">Personnalité unique</h3>
                  <p className="text-sm text-white/60">Définissez le comportement et le style de votre assistant</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-violet-600 hover:bg-violet-700 text-white"
                asChild
              >
                <Link to="/ai-studio">
                  Explorer AI Studio
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5"
                asChild
              >
                <Link to="/ai-studio/marketplace">
                  Voir le marketplace
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-blue-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative border border-white/10 rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm shadow-xl">
                <div className="p-4 bg-slate-900/80 border-b border-white/10 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-600/30 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="font-medium text-white">Assistant Finance LuvviX</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 text-white/80 text-sm">
                    Bonjour ! Je suis votre assistant financier personnalisé. Comment puis-je vous aider aujourd'hui ?
                  </div>
                  <div className="bg-violet-600/20 p-4 rounded-lg border border-violet-500/30 text-white/90 text-sm ml-8">
                    Pouvez-vous m'expliquer les avantages du PEA par rapport à l'assurance-vie ?
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 text-white/80 text-sm">
                    Le PEA (Plan d'Épargne en Actions) et l'assurance-vie sont deux placements fiscalement avantageux mais avec des différences importantes :<br/><br/>
                    <strong>Pour le PEA :</strong><br/>
                    - Fiscalité avantageuse après 5 ans (exonération d'impôt sur le revenu)<br/>
                    - Limité aux actions européennes<br/>
                    - Plafond de versement de 150 000€<br/><br/>
                    <strong>Pour l'assurance-vie :</strong><br/>
                    - Fiscalité progressive selon la durée de détention<br/>
                    - Grande diversité de supports d'investissement<br/>
                    - Pas de plafond de versement<br/>
                    - Avantages successoraux
                  </div>
                </div>
                <div className="p-4 border-t border-white/10 bg-slate-900/80 flex gap-2">
                  <div className="flex-1 bg-slate-700/30 rounded-md border border-white/10 p-2 text-white/50 text-sm">
                    Posez votre question...
                  </div>
                  <Button size="sm" className="bg-violet-600 text-white hover:bg-violet-700">
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIStudioPromo;
