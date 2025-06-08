
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import Ecosystem from "@/components/Ecosystem";
import ProductDemos from "@/components/ProductDemos";
import Testimonials from "@/components/Testimonials";
import CeoSection from "@/components/CeoSection";
import DeveloperSection from "@/components/DeveloperSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <Hero />
      
      <Ecosystem />
      
      <ProductDemos />
      
      <Testimonials />
      
      <CeoSection />
      
      <DeveloperSection />
      
      <Footer />
    </div>
  );
};

export default Index;
