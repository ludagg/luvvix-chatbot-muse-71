
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowRight, Briefcase, Building, MapPin } from "lucide-react";

const jobs = [
  {
    id: 1,
    title: "Ingénieur IA Senior",
    department: "LuvviX AI",
    location: "Remote Worldwide",
    type: "CDI",
    remote: true
  },
  {
    id: 2,
    title: "Développeur Mobile Flutter",
    department: "LuvviX Mobile",
    location: "Remote - Europe/Afrique",
    type: "CDI",
    remote: true
  },
  {
    id: 3,
    title: "Data Scientist",
    department: "LuvviX Analytics",
    location: "Remote Worldwide",
    type: "CDI",
    remote: true
  },
  {
    id: 4,
    title: "Responsable Produit",
    department: "LuvviX Learn",
    location: "Remote - Francophone",
    type: "CDI",
    remote: true
  },
  {
    id: 5,
    title: "Spécialiste DevOps",
    department: "LuvviX Infrastructure",
    location: "Remote Global",
    type: "Freelance",
    remote: true
  },
  {
    id: 6,
    title: "UX/UI Designer",
    department: "LuvviX Design",
    location: "Remote Europe",
    type: "Stage",
    remote: true
  }
];

const Careers = () => {
  return (
    <section id="careers" className="container-padding bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">Carrières LuvviX</h2>
        <p className="section-subheading">
          Rejoignez l'équipe qui révolutionne la technologie mondiale. 
          Construisons ensemble l'avenir numérique de demain.
        </p>

        <Tabs defaultValue="careers" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-12">
            <TabsTrigger value="careers">
              <Briefcase size={16} className="mr-2" />
              Opportunités
            </TabsTrigger>
            <TabsTrigger value="culture">
              <Building size={16} className="mr-2" />
              Culture d'entreprise
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="careers" className="border-none outline-none">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Rechercher une opportunité..." 
                    className="pl-10 py-6"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="space-y-5">
                    {jobs.map((job) => (
                      <div key={job.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
                        <div className="mb-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-luvvix-purple/10 text-luvvix-purple">
                            {job.department}
                          </span>
                          {job.remote && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">
                              Remote
                            </span>
                          )}
                          {job.type === 'Stage' && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                              Stage
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <MapPin size={14} className="mr-1" />
                          <span>{job.location}</span>
                          <span className="mx-2">•</span>
                          <span>{job.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Button variant="ghost" className="text-luvvix-purple hover:bg-luvvix-purple/10">
                            Voir les détails
                            <ArrowRight size={16} className="ml-2" />
                          </Button>
                          <Button>Postuler</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 h-fit">
                  <h3 className="text-xl font-bold mb-4">Pourquoi LuvviX ?</h3>
                  <ul className="space-y-4 mb-6">
                    <li className="flex">
                      <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Pionnier de l'innovation technologique mondiale</span>
                    </li>
                    <li className="flex">
                      <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Salaires compétitifs et avantages globaux</span>
                    </li>
                    <li className="flex">
                      <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Formation continue et certifications internationales</span>
                    </li>
                    <li className="flex">
                      <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Impact réel sur le développement numérique mondial</span>
                    </li>
                  </ul>
                  <div className="bg-luvvix-purple rounded-lg p-4 text-white">
                    <h4 className="font-medium mb-2">Programme de Stage</h4>
                    <p className="text-sm mb-3">
                      Programme de stage de 6 mois pour étudiants internationaux avec 
                      possibilité d'embauche et mentorat par nos experts.
                    </p>
                    <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-luvvix-purple">
                      Candidature Stage
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="culture" className="border-none outline-none">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-6">Notre Culture chez LuvviX</h3>
              <p className="text-gray-600 mb-8">
                Chez LuvviX, nous croyons au potentiel infini du talent mondial. 
                Notre culture d'entreprise valorise l'innovation, la collaboration et l'impact social.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border rounded-lg p-6">
                  <h4 className="font-bold mb-3 text-luvvix-purple">🌍 Vision Mondiale</h4>
                  <p className="text-sm text-gray-600">
                    Nous développons des solutions qui répondent aux besoins 
                    du marché mondial avec une approche locale.
                  </p>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h4 className="font-bold mb-3 text-luvvix-purple">🚀 Innovation Continue</h4>
                  <p className="text-sm text-gray-600">
                    20% du temps de travail dédié à l'innovation personnelle et 
                    aux projets de recherche et développement.
                  </p>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h4 className="font-bold mb-3 text-luvvix-purple">🤝 Équipe Diverse</h4>
                  <p className="text-sm text-gray-600">
                    Équipe multiculturelle avec talents de toutes les régions 
                    du monde travaillant en parfaite harmonie.
                  </p>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h4 className="font-bold mb-3 text-luvvix-purple">📚 Formation Continue</h4>
                  <p className="text-sm text-gray-600">
                    Budget formation personnalisé pour 
                    certifications et conférences internationales.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-luvvix-purple to-luvvix-darkpurple rounded-lg p-6 text-white">
                <h4 className="font-bold text-lg mb-4">Rejoignez la Révolution Tech Mondiale</h4>
                <p className="mb-4">
                  Vous êtes passionné(e) par la technologie et vous voulez faire la différence ? 
                  Envoyez-nous votre CV et parlons de votre avenir chez LuvviX.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-luvvix-purple">
                    📧 careers@luvvix.com
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-luvvix-purple">
                    🌐 Remote Friendly
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Careers;
