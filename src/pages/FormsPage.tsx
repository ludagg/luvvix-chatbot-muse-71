
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormsList from "@/components/forms/FormsList";
import FormsHeader from "@/components/forms/FormsHeader";

const FormsPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "LuvviX Forms - Créez et partagez facilement des formulaires";
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Ajout d'un div spacer pour compenser la hauteur de la navbar fixed */}
      <div className="pt-20"></div> 
      <FormsHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <FormsList />
      </main>
      <Footer />
    </div>
  );
};

export default FormsPage;
