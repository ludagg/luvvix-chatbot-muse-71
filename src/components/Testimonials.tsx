
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "En tant que médecin à l'Hôpital Général de Douala, LuvviX Medic a révolutionné notre façon de gérer les dossiers patients. L'intégration avec l'IA est remarquable.",
    name: "Dr. Anne-Marie Tchoupou",
    role: "Chef de Service",
    company: "Hôpital Général de Douala",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 2,
    content: "L'API LuvviX nous permet de développer des solutions adaptées au marché africain. Le support technique local est un vrai plus pour notre startup.",
    name: "Christian Elongué",
    role: "CTO",
    company: "TechHub Douala",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 3,
    content: "StreamMix a transformé la production de contenu pour notre chaîne de télévision. La qualité du streaming et l'intégration de l'IA sont impressionnantes.",
    name: "Sarah Ngoulla",
    role: "Directrice de Production",
    company: "Canal 2 International",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-rotate testimonials
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
        <h2 className="section-heading">Ce que disent nos clients</h2>
        <p className="section-subheading">
          Découvrez les témoignages de nos partenaires et clients qui utilisent les technologies LuvviX
        </p>

        {/* Testimonials carousel */}
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
                    <p className="text-lg mb-6">{testimonial.content}</p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation buttons */}
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

        {/* Video section */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6">Découvrir LuvviX Technologies</h3>
          <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg shadow-lg overflow-hidden relative">
            {/* This is a placeholder. In a real implementation, you would use an actual video */}
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
              <h4 className="text-2xl font-bold mb-2">LuvviX: Réinventer le futur</h4>
              <p className="text-sm md:text-base opacity-90">Découvrez comment notre écosystème intégré révolutionne les industries de la technologie, de la santé et des médias.</p>
            </div>
            
            {/* Hidden video that would be played */}
            <video
              ref={videoRef}
              className="hidden"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/your-video-source.mp4" type="video/mp4" />
              Votre navigateur ne prend pas en charge la lecture de vidéos.
            </video>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            © 2023 LuvviX Technologies | Tous droits réservés
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
