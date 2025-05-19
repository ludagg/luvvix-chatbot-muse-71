
import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Plus, 
  Store, 
  Settings, 
  Users, 
  BookUser, 
  Star, 
  Heart,
  User
} from "lucide-react";

const AIStudioPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
      }
      
      setLoading(false);
    };
    
    getUser();
  }, []);

  // Si chargement en cours, afficher un écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-purple-600">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Si pas d'utilisateur connecté, rediriger vers la page d'authentification
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">LuvviX AI Studio</h1>
                <p className="text-gray-600 mt-1">
                  Créez et gérez vos assistants IA personnalisés
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link to="/ai-studio/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un agent
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/ai-studio/dashboard">
                <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                  <div className="p-3 rounded-full bg-blue-100 w-fit mb-4">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Mes agents</h2>
                  <p className="text-gray-600 flex-grow">
                    Consultez, modifiez et suivez les performances de vos agents IA.
                  </p>
                </div>
              </Link>
              
              <Link to="/ai-studio/marketplace">
                <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                  <div className="p-3 rounded-full bg-green-100 w-fit mb-4">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Marketplace</h2>
                  <p className="text-gray-600 flex-grow">
                    Découvrez des agents IA créés par d'autres utilisateurs.
                  </p>
                </div>
              </Link>
              
              <Link to="/ai-studio/favorites">
                <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                  <div className="p-3 rounded-full bg-yellow-100 w-fit mb-4">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Favoris et Abonnements</h2>
                  <p className="text-gray-600 flex-grow">
                    Retrouvez vos agents favoris et les créateurs que vous suivez.
                  </p>
                </div>
              </Link>
              
              <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <div className="p-3 rounded-full bg-pink-100 w-fit mb-4">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Version Pro</h2>
                <p className="text-gray-600 flex-grow">
                  Débloquez des fonctionnalités avancées et plus de capacités.
                </p>
                <Button variant="outline" className="mt-3 w-full">
                  Bientôt disponible
                </Button>
              </div>
              
              <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <div className="p-3 rounded-full bg-purple-100 w-fit mb-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Mon Profil</h2>
                <p className="text-gray-600 flex-grow">
                  Gérez votre profil de créateur et vos informations personnelles.
                </p>
                <Button variant="outline" className="mt-3 w-full">
                  Bientôt disponible
                </Button>
              </div>
              
              <Link to="/ai-studio/admin?token=luvvix-id-admin-secret-token">
                <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                  <div className="p-3 rounded-full bg-gray-100 w-fit mb-4">
                    <Settings className="h-6 w-6 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Administration</h2>
                  <p className="text-gray-600 flex-grow">
                    Options d'administration pour gérer la plateforme AI Studio.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioPage;
