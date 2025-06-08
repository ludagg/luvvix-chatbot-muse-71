
import Navbar from "@/components/Navbar";
import ModernHero from "@/components/home/ModernHero";
import ProductShowcase from "@/components/home/ProductShowcase";
import TrustSection from "@/components/home/TrustSection";
import CallToAction from "@/components/home/CallToAction";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <ModernHero />
      <ProductShowcase />
      <TrustSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
