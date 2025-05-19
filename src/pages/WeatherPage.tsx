
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WeatherWidget from "@/components/weather/WeatherWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun } from "lucide-react";

const WeatherPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Ajout d'un espace en haut pour éviter que le contenu soit caché par la barre de navigation */}
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">LuvviX Météo</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-blue-500" />
                Météo actuelle
              </CardTitle>
              <CardDescription>
                Consultez la météo en temps réel pour votre emplacement actuel
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <div className="w-full max-w-sm">
                <WeatherWidget />
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-gray-500">
              Plus de fonctionnalités météo seront bientôt disponibles!
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WeatherPage;
