
import { Card, CardContent } from "@/components/ui/card";

const CeoSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img 
                    src="/lovable-uploads/fd07dac5-71e4-4fa9-9eb5-c532f4e55916.png" 
                    alt="Ludovic Aggaï N. - PDG de LuvviX" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-8 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-2">Ludovic Aggaï N.</h2>
                  <p className="text-gray-500 mb-4">PDG de LuvviX Technologies</p>
                  <blockquote className="italic text-lg border-l-4 border-purple-500 pl-4 mb-6">
                    "Notre mission chez LuvviX est d'innover constamment pour créer des solutions technologiques qui transforment les expériences numériques et améliorent la vie quotidienne. Nous sommes déterminés à repousser les limites de ce qui est possible."
                  </blockquote>
                  <p className="text-sm text-gray-600">
                    Visionnaire et entrepreneur, Ludovic Aggaï dirige LuvviX dans sa mission de révolutionner l'écosystème numérique avec des solutions innovantes et accessibles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CeoSection;
