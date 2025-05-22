
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIIntegration from "@/components/ai-studio/AIIntegration";
import { useAuth } from "@/hooks/useAuth";

const AIPage = () => {
  // Mise à jour du titre de la page
  useEffect(() => {
    document.title = "LuvviX AI - Intelligence Artificielle";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">LuvviX AI</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Accédez à notre plateforme d'intelligence artificielle avec votre compte LuvviX ID
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <AIIntegration redirectUrl="https://ai.luvvix.it.com/auth/callback" />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AIPage;
