
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormsHeader from "@/components/forms/FormsHeader";
import FormsList from "@/components/forms/FormsList";
import AIFormCreator from "@/components/forms/AIFormCreator";

const FormsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>LuvviX Forms | Créateur de formulaires intelligent</title>
        <meta name="description" content="Créez des formulaires intelligents avec LuvviX Forms. Interface intuitive, analyse automatique et intégration IA." />
      </Helmet>
      
      <Navbar />
      
      {/* Adding more padding to account for the fixed navbar */}
      <div className="pt-24"></div>
      
      <main className="flex-grow">
        <FormsHeader />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <FormsList />
        </div>
      </main>
      
      <AIFormCreator />
      <Footer />
    </div>
  );
};

export default FormsPage;
