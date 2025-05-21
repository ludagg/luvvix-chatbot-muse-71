
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowRight, Briefcase, Building, MapPin } from "lucide-react";

const jobs = [
  {
    id: 1,
    title: "Ingénieur IA Senior",
    department: "LuvviX AI",
    location: "Douala, Cameroun",
    type: "CDI",
    remote: true
  },
  {
    id: 2,
    title: "Développeur Frontend React",
    department: "LuvviX StreamMix",
    location: "Douala, Cameroun",
    type: "CDI",
    remote: true
  },
  {
    id: 3,
    title: "Data Scientist",
    department: "LuvviX Medic",
    location: "Douala, Cameroun",
    type: "CDI",
    remote: false
  },
  {
    id: 4,
    title: "Responsable Produit",
    department: "LuvviX Cloud",
    location: "Douala, Cameroun",
    type: "CDI",
    remote: true
  },
  {
    id: 5,
    title: "UX/UI Designer",
    department: "LuvviX StreamMix",
    location: "Remote",
    type: "CDI",
    remote: true
  }
];

const Careers = () => {
  return (
    <section id="careers" className="container-padding bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">Carrières & Partenariats</h2>
        <p className="section-subheading">
          Rejoignez notre équipe ou collaborez avec nous pour construire les technologies de demain
        </p>

        <Tabs defaultValue="careers" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-12">
            <TabsTrigger value="careers">
              <Briefcase size={16} className="mr-2" />
              Carrières
            </TabsTrigger>
            <TabsTrigger value="partners">
              <Building size={16} className="mr-2" />
              Partenariats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="careers" className="border-none outline-none">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Rechercher une offre d'emploi..." 
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
                  <h3 className="text-xl font-bold mb-4">Pourquoi nous rejoindre?</h3>
                  <ul className="space-y-4 mb-6">
                    <li className="flex">
                      <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Travaillez sur des projets innovants qui façonnent l'avenir de la technologie</span>
                    </li>
                    <li className="flex">
                      <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Culture flexible avec options de travail à distance</span>
                    </li>
                    <li className="flex">
                      <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Avantages compétitifs et opportunités de développement professionnel</span>
                    </li>
                    <li className="flex">
                      <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Environnement international et diversifié</span>
                    </li>
                  </ul>
                  <div className="bg-luvvix-purple rounded-lg p-4 text-white">
                    <h4 className="font-medium mb-2">Vous ne trouvez pas ce que vous cherchez?</h4>
                    <p className="text-sm mb-3">
                      Envoyez-nous une candidature spontanée et nous vous contacterons dès qu'un poste correspondant à votre profil sera disponible.
                    </p>
                    <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-luvvix-purple">
                      Candidature spontanée
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="partners" className="border-none outline-none">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-6">Devenez partenaire LuvviX</h3>
              <p className="text-gray-600 mb-8">
                Rejoignez notre réseau de partenaires et accédez à des technologies exclusives pour développer 
                votre entreprise. Nous offrons différents types de partenariats adaptés à vos besoins.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="border rounded-lg p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-luvvix-purple/10 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-luvvix-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold mb-2">Partenaire Business</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Intégrez nos solutions à votre offre et développez de nouvelles opportunités commerciales.
                  </p>
                  <Button variant="outline" className="w-full">En savoir plus</Button>
                </div>
                
                <div className="border rounded-lg p-6 text-center border-luvvix-purple shadow-md">
                  <div className="w-16 h-16 mx-auto bg-luvvix-purple/10 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-luvvix-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="font-bold mb-2">Partenaire Technologique</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Collaborez sur des projets de R&D et accédez en avant-première à nos technologies.
                  </p>
                  <Button className="w-full bg-luvvix-purple hover:bg-luvvix-darkpurple">En savoir plus</Button>
                </div>
                
                <div className="border rounded-lg p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-luvvix-purple/10 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-luvvix-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                  </div>
                  <h4 className="font-bold mb-2">Partenaire Éducation</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Programmes spéciaux pour universités et institutions éducatives.
                  </p>
                  <Button variant="outline" className="w-full">En savoir plus</Button>
                </div>
              </div>
              
              <form className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-lg mb-4">Contactez-nous</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <Input id="name" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Entreprise
                    </label>
                    <Input id="company" placeholder="Nom de votre entreprise" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email professionnel
                    </label>
                    <Input id="email" type="email" placeholder="votre@email.com" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <Input id="phone" placeholder="+33 6 12 34 56 78" />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Votre message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Décrivez votre projet ou vos besoins..."
                  ></textarea>
                </div>
                <Button className="w-full bg-luvvix-purple hover:bg-luvvix-darkpurple">
                  Envoyer votre demande
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Careers;
