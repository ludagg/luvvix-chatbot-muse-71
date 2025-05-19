
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, ArrowRight } from "lucide-react";

const FormsPromo = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-800">LuvviX Forms</h2>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">
              Créez des formulaires professionnels en quelques minutes
            </h3>
            <p className="text-gray-600 mb-6">
              Collectez facilement des données avec notre nouveau service de création de formulaires intuitif.
              Personnalisez vos formulaires, partagez-les en un clic, et analysez les réponses en temps réel.
            </p>
            
            <ul className="space-y-3 mb-8">
              {[
                "Interface intuitive de glisser-déposer",
                "Multiples types de questions",
                "Partage facile via lien ou email",
                "Analyse des réponses en temps réel",
                "Collaboration en équipe"
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="bg-purple-600 hover:bg-purple-700 px-6 py-6 text-lg"
              onClick={() => navigate("/forms")}
            >
              Découvrir LuvviX Forms
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-gray-50 border-b p-4">
                <div className="flex items-center gap-2">
                  <div className="bg-red-500 w-3 h-3 rounded-full"></div>
                  <div className="bg-yellow-500 w-3 h-3 rounded-full"></div>
                  <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                  <div className="ml-4 bg-gray-200 w-1/2 h-5 rounded"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-purple-100 p-3 rounded-md flex items-center gap-3 mb-6">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Sondage de satisfaction client</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">1. Comment évalueriez-vous notre service ?</label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button key={num} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-purple-100 transition-colors">
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">2. Avez-vous rencontré des problèmes ?</label>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
                        <span className="text-sm">Oui</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border border-gray-300 rounded-full bg-purple-600"></div>
                        <span className="text-sm">Non</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">3. Commentaires ou suggestions</label>
                    <div className="border border-gray-300 rounded-md h-20 bg-gray-50"></div>
                  </div>
                  
                  <Button className="bg-purple-600">
                    Soumettre
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

export default FormsPromo;
