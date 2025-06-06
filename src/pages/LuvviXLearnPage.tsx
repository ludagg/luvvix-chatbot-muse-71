
import LuvviXLearnNew from "@/components/LuvviXLearnNew";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const LuvviXLearnPage = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>LuvviX Learn | Plateforme d'apprentissage professionnelle</title>
        <meta name="description" content="Développez vos compétences avec LuvviX Learn. Cours de marketing digital, administration, business et IA générative avec certificats reconnus." />
      </Helmet>
      
      <Navbar />
      <div className="pt-20">
        <LuvviXLearnNew />
      </div>
      <Footer />
    </div>
  );
};

export default LuvviXLearnPage;
