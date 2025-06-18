
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AdvancedAssistantChat from './AdvancedAssistantChat';

interface MobileAssistantProps {
  onBack: () => void;
}

const MobileAssistant = ({ onBack }: MobileAssistantProps) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header Moderne */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">LuvviX Assistant IA</h1>
            <p className="text-sm opacity-90">Version Avancée • LaTeX • Graphiques • Raisonnement</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs">Actif</span>
        </div>
      </div>

      {/* Chat Avancé */}
      <div className="flex-1 overflow-hidden">
        <AdvancedAssistantChat />
      </div>
    </div>
  );
};

export default MobileAssistant;
