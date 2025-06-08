
import { motion } from "framer-motion";
import ModernHero from "@/components/home/ModernHero";
import ProductShowcase from "@/components/home/ProductShowcase";
import TrustSection from "@/components/home/TrustSection";
import CallToAction from "@/components/home/CallToAction";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <ModernHero />
      
      <ProductShowcase />
      
      <StatsSection />
      
      <TrustSection />
      
      <TestimonialsSection />
      
      <CallToAction />
      
      <Footer />
    </div>
  );
};

export default Index;
