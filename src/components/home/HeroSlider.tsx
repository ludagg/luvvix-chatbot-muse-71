
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSlider = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "L'écosystème numérique tout-en-un",
      subtitle: "LuvviX révolutionne votre expérience digitale",
      description: "Découvrez une plateforme unifiée qui combine IA avancée, stockage cloud intelligent et authentification sécurisée pour transformer votre productivité.",
      gradient: "from-purple-600 via-blue-600 to-cyan-500",
      cta: "Commencer gratuitement"
    },
    {
      title: "Intelligence Artificielle Avancée",
      subtitle: "Powered by Gemini 1.5 Flash",
      description: "Créez des agents IA personnalisés, automatisez vos tâches et bénéficiez d'une assistance intelligente intégrée dans tous nos services.",
      gradient: "from-emerald-600 via-teal-600 to-blue-500",
      cta: "Explorer l'IA"
    },
    {
      title: "Cloud Unifié & Sécurisé",
      subtitle: "Tous vos services en un seul endroit",
      description: "Connectez Google Drive, Dropbox, OneDrive et bien plus. Synchronisation temps réel, chiffrement de bout en bout.",
      gradient: "from-orange-500 via-pink-500 to-purple-600",
      cta: "Voir le Cloud"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient}`}
        />
      </AnimatePresence>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-white/90">
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto">
                {slides[currentSlide].description}
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-10 py-4 text-lg"
              >
                {slides[currentSlide].cta}
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={prevSlide} className="text-white hover:bg-white/20">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={nextSlide} className="text-white hover:bg-white/20">
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </section>
  );
};

export default HeroSlider;
