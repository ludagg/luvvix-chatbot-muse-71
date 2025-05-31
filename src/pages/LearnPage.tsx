
import LuvviXLearnComplete from "@/components/LuvviXLearnComplete";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const LearnPage = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>LuvviX Learn | Plateforme d'apprentissage en ligne</title>
        <meta name="description" content="Transformez votre carrière avec LuvviX Learn. Formations expertes, parcours structurés et technologies de demain." />
      </Helmet>
      
      <Navbar />
      <div className="pt-20">
        <LuvviXLearnComplete />
      </div>
      <Footer />
    </div>
  );
};

export default LearnPage;
