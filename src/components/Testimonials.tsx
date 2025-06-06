
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "En tant que PDG de LuvviX Technologies, je suis fier de voir comment notre écosystème transforme la vie numérique des Camerounais. Notre vision d'une Afrique connectée et innovante devient réalité chaque jour.",
    name: "Ludovic Aggaï N.",
    role: "PDG & Fondateur",
    company: "LuvviX Technologies",
    image: null
  },
  {
    id: 2,
    content: "LuvviX Learn a complètement transformé ma façon d'apprendre. Les cours d'IA sont excellents et l'assistant virtuel m'aide vraiment à progresser. Je recommande vivement cette plateforme !",
    name: "Barbara T.",
    role: "Utilisatrice",
    company: "Étudiante en Informatique - Université de Douala",
    image: null
  },
  {
    id: 3,
    content: "En tant qu'ingénieur logiciel, j'utilise quotidiennement les APIs LuvviX dans mes projets. La documentation est claire et le support technique répond rapidement. Un écosystème vraiment professionnel.",
    name: "Fabrice Fotso",
    role: "Ingénieur Logiciel",
    company: "Senior Developer - MTN Cameroun",
    image: null
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePrevious = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="container-padding bg-gradient-to-b from-luvvix-lightgray to-white">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">Témoignages de notre communauté</h2>
        <p className="section-subheading">
          Découvrez ce que disent les utilisateurs, partenaires et leaders de LuvviX Technologies au Cameroun
        </p>

        <div className="mt-12 mb-24 max-w-4xl mx-auto">
          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-opacity duration-500 ${
                  activeIndex === index ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <div className="bg-white rounded-xl shadow-lg p-8 relative">
                  <svg className="h-12 w-12 text-luvvix-purple/20 absolute top-6 left-6" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <div className="pl-6">
                    <p className="text-lg mb-6 leading-relaxed">{testimonial.content}</p>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-luvvix-purple to-luvvix-darkpurple flex items-center justify-center text-white font-bold text-lg mr-4">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-luvvix-purple">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">
                          {testimonial.role}
                        </p>
                        <p className="text-xs text-gray-500">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-6 space-x-2">
              <Button variant="outline" size="icon" onClick={handlePrevious} className="rounded-full">
                <ChevronLeft size={18} />
              </Button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      activeIndex === index ? 'bg-luvvix-purple' : 'bg-gray-300'
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6">LuvviX Technologies : L'Innovation Camerounaise</h3>
          <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-luvvix-purple to-luvvix-darkpurple opacity-90"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                onClick={toggleVideo}
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm border-white/50 hover:bg-white/30"
              >
                <Play size={24} className="text-white" />
              </Button>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h4 className="text-2xl font-bold mb-2">🇨🇲 Made in Cameroon, Pensé pour l'Afrique</h4>
              <p className="text-sm md:text-base opacity-90">
                Découvrez comment LuvviX Technologies révolutionne le paysage technologique camerounais 
                avec des solutions innovantes adaptées aux réalités locales.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">🏥 Santé Digitale</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">🎓 Éducation IA</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">🌾 AgriTech</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">💰 FinTech</span>
              </div>
            </div>
            
            <video
              ref={videoRef}
              className="hidden"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/luvvix-cameroon-presentation.mp4" type="video/mp4" />
              Votre navigateur ne prend pas en charge la lecture de vidéos.
            </video>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            © 2024 LuvviX Technologies Cameroun | Tous droits réservés | Siège social : Douala, Cameroun
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
