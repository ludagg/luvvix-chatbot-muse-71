
import { motion } from "framer-motion";
import HeroSlider from "@/components/home/HeroSlider";
import FeaturesCarousel from "@/components/home/FeaturesCarousel";
import InteractiveDemo from "@/components/home/InteractiveDemo";
import StatsSection from "@/components/home/StatsSection";
import CallToAction from "@/components/home/CallToAction";
import Testimonials from "@/components/Testimonials";
import CeoSection from "@/components/CeoSection";
import DeveloperSection from "@/components/DeveloperSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <HeroSlider />
      
      <FeaturesCarousel />
      
      <InteractiveDemo />
      
      <StatsSection />
      
      <Testimonials />
      
      <CeoSection />
      
      <DeveloperSection />
      
      <CallToAction />
      
      <Footer />
    </div>
  );
};

export default Index;
