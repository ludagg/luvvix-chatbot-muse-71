
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

const Index = () => {
  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <WeatherWidget />
      </div>
      <Navbar />
      <Hero />
      <Ecosystem />
      <FormsPromo />
      <NewsPreview />
      <Authentication />
      <ProductDemos />
      <DeveloperSection />
      <LabSection />
      <Careers />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
