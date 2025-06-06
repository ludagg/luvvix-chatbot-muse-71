
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowRight, Cpu, Brain, Smartphone, Cloud } from "lucide-react";

const researchProjects = [
  {
    id: 1,
    year: "2025",
    title: "LuvviX Vision AI Cameroun",
    description: "Système de reconnaissance d'images adapté au contexte camerounais : reconnaissance de plantes médicinales locales, identification de produits agricoles et analyse de documents administratifs en français.",
    status: "En développement",
    impact: "Agriculture et Santé"
  },
  {
    id: 2,
    year: "2024",
    title: "Assistant IA Langues Locales",
    description: "Intelligence artificielle multilingue supportant le français, l'anglais, et les principales langues camerounaises (Bamiléké, Bassa, Duala). Intégration avec reconnaissance vocale adaptée aux accents locaux.",
    status: "Alpha",
    impact: "Éducation et Inclusion"
  },
  {
    id: 3,
    year: "2024",
    title: "Blockchain Santé Cameroun",
    description: "Système de gestion sécurisée des dossiers médicaux sur blockchain, interopérable entre hôpitaux camerounais avec support des cartes d'identité nationales.",
    status: "Recherche",
    impact: "Santé Publique"
  },
  {
    id: 4,
    year: "2024",
    title: "FinTech Mobile Money",
    description: "API unifiée pour l'intégration des solutions de paiement mobile (Orange Money, MTN MoMo) avec fonctionnalités avancées de micro-crédit et épargne collaborative.",
    status: "Beta",
    impact: "Inclusion Financière"
  },
  {
    id: 5,
    year: "2023",
    title: "AgriTech IoT Platform",
    description: "Plateforme IoT pour agriculture intelligente : capteurs de sol, prédiction météo, conseils personnalisés pour cultures camerounaises (cacao, café, banane plantain).",
    status: "Production",
    impact: "Agriculture Durable"
  }
];

const LabSection = () => {
  return (
    <section id="lab" className="container-padding bg-luvvix-lightgray">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-luvvix-purple/20 p-3 rounded-full mr-3">
            <FlaskConical size={24} className="text-luvvix-purple" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">LuvviX Lab Cameroun</h2>
        </div>

        <p className="section-subheading">
          Notre laboratoire de recherche et développement au cœur de l'Afrique. 
          Nous développons les technologies de demain adaptées aux réalités camerounaises.
        </p>

        {/* Innovation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Brain size={24} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-luvvix-purple mb-2">15+</h3>
            <p className="text-gray-600">Projets R&D Actifs</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Cpu size={24} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-luvvix-purple mb-2">8</h3>
            <p className="text-gray-600">Brevets Déposés</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Smartphone size={24} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-luvvix-purple mb-2">12</h3>
            <p className="text-gray-600">Chercheurs Ph.D</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Cloud size={24} className="text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-luvvix-purple mb-2">3M</h3>
            <p className="text-gray-600">FCFA Investis R&D</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-16 relative">
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-luvvix-purple/30"></div>
          
          <div className="space-y-24">
            {researchProjects.map((project, index) => (
              <div key={project.id} className={`relative ${index % 2 === 0 ? 'md:ml-auto' : ''}`}>
                <div className="absolute top-6 left-0 md:left-auto md:right-auto md:-translate-x-1/2 md:left-1/2 w-6 h-6 rounded-full bg-luvvix-purple z-10 shadow-lg shadow-luvvix-purple/30"></div>
                
                <div className={`ml-10 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-6 relative">
                    <div className="absolute top-6 left-0 transform -translate-x-full md:hidden w-8 h-1 bg-luvvix-purple/50"></div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-luvvix-purple/10 text-luvvix-purple rounded-full">
                        {project.year}
                      </span>
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {project.impact}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {project.status}
                      </span>
                      <Button variant="ghost" size="sm" className="text-luvvix-purple hover:bg-luvvix-purple/10">
                        En savoir plus
                        <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Vision section */}
        <div className="mt-24 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-4">Innovation Made in Cameroon</h3>
              <p className="text-gray-600 mb-6">
                Le LuvviX Lab Cameroun est le premier centre de recherche technologique privé du pays. 
                Nos équipes développent des solutions qui transforment la vie quotidienne des Camerounais 
                tout en rayonnant sur l'ensemble du continent africain.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>IA multilingue avec support des langues camerounaises</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Solutions AgriTech pour le cacao et café camerounais</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Blockchain pour la sécurisation des données médicales</span>
                </li>
              </ul>
              <Button className="bg-luvvix-purple hover:bg-luvvix-darkpurple">
                Découvrir nos innovations
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-luvvix-purple to-luvvix-darkpurple p-8 md:p-12 text-white flex items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Programme Innovation Étudiants</h3>
                <p className="mb-6">
                  Étudiants camerounais en informatique ? Rejoignez notre programme 
                  d'innovation et travaillez sur des projets révolutionnaires tout en 
                  poursuivant vos études.
                </p>
                <div className="space-y-2 mb-6">
                  <p className="text-sm">✅ Bourse de recherche : 150,000 FCFA/mois</p>
                  <p className="text-sm">✅ Mentorat par nos experts</p>
                  <p className="text-sm">✅ Accès aux technologies de pointe</p>
                  <p className="text-sm">✅ Possibilité d'embauche post-diplôme</p>
                </div>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-luvvix-purple">
                  Candidater au programme
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LabSection;
