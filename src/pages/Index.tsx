
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ecosystem from "@/components/Ecosystem";
import Authentication from "@/components/Authentication";
import ProductDemos from "@/components/ProductDemos";
import DeveloperSection from "@/components/DeveloperSection";
import LabSection from "@/components/LabSection";
import Careers from "@/components/Careers";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import NewsPreview from "@/components/news/NewsPreview";
import WeatherWidget from "@/components/weather/WeatherWidget";
import FormsPromo from "@/components/forms/FormsPromo";
import CeoSection from "@/components/CeoSection";
import AIStudioPromo from "@/components/ai-studio/AIStudioPromo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Grid } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <Hero />
      
      {/* Zone Écosystème */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Découvrez l'écosystème LuvviX
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Une suite complète d'applications et de services conçus pour transformer votre expérience digitale. Intelligence artificielle, productivité, cloud et bien plus encore.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Link to="/ecosystem" className="inline-flex items-center gap-2">
                  <Grid className="h-5 w-5" />
                  Explorer l'écosystème
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="lg:w-1/2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-3">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">AI Studio</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">Forms</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-3">
                    <Cloud className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">Cloud</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow sm:col-span-3 md:col-span-1">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">Et plus</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <AIStudioPromo />
      <Ecosystem />
      <FormsPromo />
      <NewsPreview />
      <Authentication />
      <ProductDemos />
      <DeveloperSection />
      <LabSection />
      <CeoSection />
      <Careers />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
