
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowRight } from "lucide-react";

const researchProjects = [
  {
    id: 1,
    year: "2025",
    title: "Neural Mesh Rendering",
    description: "Technologie permettant de générer des modèles 3D photoréalistes à partir de simples descriptions textuelles.",
    status: "En développement"
  },
  {
    id: 2,
    year: "2024",
    title: "LuvviX Synapse",
    description: "Architecture neuromorphique pour l'optimisation des calculs d'IA avec une efficacité énergétique multipliée par 100.",
    status: "Alpha"
  },
  {
    id: 3,
    year: "2024",
    title: "Bio-interface Quantique",
    description: "Interface homme-machine utilisant des capteurs quantiques pour détecter les signaux neuronaux avec précision.",
    status: "Recherche"
  },
  {
    id: 4,
    year: "2023",
    title: "LuvviX Reality Engine",
    description: "Écosystème de réalité mixte avec suivi oculaire précis et rendu holographique sans périphérique.",
    status: "Beta"
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
          <h2 className="text-3xl md:text-4xl font-bold">LuvviX Lab</h2>
        </div>

        <p className="section-subheading">
          Explorez les technologies futures et les projets de recherche qui façonnent l'avenir
        </p>

        {/* Timeline */}
        <div className="mt-16 relative">
          {/* Vertical line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-luvvix-purple/30"></div>
          
          <div className="space-y-24">
            {researchProjects.map((project, index) => (
              <div key={project.id} className={`relative ${index % 2 === 0 ? 'md:ml-auto' : ''}`}>
                {/* Connector */}
                <div className="absolute top-6 left-0 md:left-auto md:right-auto md:-translate-x-1/2 md:left-1/2 w-6 h-6 rounded-full bg-luvvix-purple z-10 shadow-lg shadow-luvvix-purple/30"></div>
                
                {/* Content */}
                <div className={`ml-10 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-6 relative">
                    <div className="absolute top-6 left-0 transform -translate-x-full md:hidden w-8 h-1 bg-luvvix-purple/50"></div>
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-luvvix-purple/10 text-luvvix-purple rounded-full mb-3">
                      {project.year}
                    </span>
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
              <h3 className="text-2xl font-bold mb-4">Notre vision pour l'avenir</h3>
              <p className="text-gray-600 mb-6">
                Chez LuvviX Lab, nous croyons que la technologie doit augmenter le potentiel humain, 
                pas le remplacer. Nos équipes de chercheurs et ingénieurs travaillent sur des projets 
                révolutionnaires qui redéfiniront notre relation avec la technologie.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Interface cerveau-machine avec précision neuronale</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Médecine personnalisée basée sur l'IA et l'édition génomique</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-luvvix-purple/20 flex items-center justify-center text-luvvix-purple mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Réalité augmentée ambiante sans dispositif</span>
                </li>
              </ul>
              <Button className="bg-luvvix-purple hover:bg-luvvix-darkpurple">
                Découvrir nos projets de recherche
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-luvvix-purple to-luvvix-darkpurple p-8 md:p-12 text-white flex items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Rejoignez le programme Beta</h3>
                <p className="mb-6">
                  Testez nos technologies expérimentales avant leur lancement public et 
                  contribuez à façonner l'avenir de l'innovation technologique.
                </p>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-luvvix-purple">
                  Postuler au programme Beta
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
