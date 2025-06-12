
import React, { useState } from 'react';
import { ChevronRight, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Sécurisé",
      subtitle: "Vos données protégées",
      description: "LuvviX ID sécurise toutes vos informations avec un chiffrement de niveau bancaire. Votre vie privée est notre priorité absolue.",
      illustration: (
        <div className="w-64 h-64 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl shadow-2xl transform rotate-3"></div>
          <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
      ),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Analytics",
      subtitle: "Données intelligentes",
      description: "Obtenez des insights précieux sur votre utilisation et optimisez votre productivité avec nos analyses avancées alimentées par l'IA.",
      illustration: (
        <div className="w-64 h-64 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl shadow-2xl transform -rotate-3"></div>
          <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-green-400 rounded-full"></div>
          <div className="absolute bottom-8 left-4 w-6 h-6 bg-blue-400 rounded-full"></div>
        </div>
      ),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Investissements",
      subtitle: "Croissance intelligente",
      description: "Maximisez votre potentiel avec notre écosystème intégré qui transforme chaque interaction en opportunité de croissance personnelle et professionnelle.",
      illustration: (
        <div className="w-64 h-64 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl shadow-2xl transform rotate-1"></div>
          <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
          </div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
            <span className="text-2xl">💎</span>
          </div>
        </div>
      ),
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white z-50 flex flex-col">
      {/* Header minimaliste */}
      <div className="flex items-center justify-between p-6 pt-12">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index <= currentStep ? 'w-8 bg-blue-500' : 'w-4 bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={handleSkip}
          className="text-gray-400 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          Ignorer
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Illustration */}
        <div className="mb-8">
          {steps[currentStep].illustration}
        </div>

        {/* Titre principal */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {steps[currentStep].title}
        </h1>

        {/* Sous-titre */}
        <h2 className="text-xl font-semibold text-gray-600 mb-6">
          {steps[currentStep].subtitle}
        </h2>

        {/* Description */}
        <p className="text-gray-500 leading-relaxed text-base mb-12 max-w-sm px-4">
          {steps[currentStep].description}
        </p>
      </div>

      {/* Footer avec bouton d'action */}
      <div className="p-6 pb-12">
        <button
          onClick={handleNext}
          className="w-full bg-blue-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all hover:bg-blue-600"
        >
          <span className="text-lg">
            {currentStep === steps.length - 1 ? 'Commencer' : 'Suivant'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Indicateurs de navigation */}
        <div className="flex justify-center mt-6 space-x-2">
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
  );
};

export default OnboardingFlow;
