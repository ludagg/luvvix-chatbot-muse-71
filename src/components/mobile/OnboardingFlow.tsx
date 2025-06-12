
import React, { useState } from 'react';
import { ChevronRight, Sparkles, Shield, Zap } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-16 h-16 text-blue-500" />,
      title: "Bienvenue dans l'avenir",
      description: "LuvviX OS révolutionne votre expérience mobile en unifiant tous vos besoins numériques dans un écosystème intelligent et intuitif.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="w-16 h-16 text-purple-500" />,
      title: "Intelligence artificielle intégrée",
      description: "Bénéficiez d'un assistant IA avancé, de services automatisés et d'une personnalisation qui s'adapte à vos habitudes.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-16 h-16 text-green-500" />,
      title: "Sécurité et simplicité",
      description: "Vos données sont protégées avec LuvviX ID, votre clé d'accès unique à l'ensemble de l'écosystème. Simple, sûr, révolutionnaire.",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header avec indicateur de progression */}
      <div className="flex items-center justify-between p-6">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-1 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={handleSkip}
          className="text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
        >
          Ignorer
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${steps[currentStep].gradient} flex items-center justify-center mb-8 shadow-xl`}>
          {steps[currentStep].icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
          {steps[currentStep].title}
        </h2>

        <p className="text-gray-600 leading-relaxed text-lg mb-12 max-w-sm">
          {steps[currentStep].description}
        </p>

        {/* Aperçu de l'interface */}
        <div className="w-full max-w-xs h-40 bg-gray-50 rounded-2xl border border-gray-200 mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer avec bouton d'action */}
      <div className="p-6">
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-transform"
        >
          <span>{currentStep === steps.length - 1 ? 'Commencer' : 'Continuer'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStep ? 'bg-blue-500 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
