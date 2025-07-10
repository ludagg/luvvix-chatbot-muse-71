
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AdvancedAssistantChat from './AdvancedAssistantChat';

interface MobileAssistantProps {
  onBack: () => void;
}

const MobileAssistant = ({ onBack }: MobileAssistantProps) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header simplifié et moderne */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">LuvviX AI</h1>
            <p className="text-sm text-gray-500">Assistant IA personnel</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-xs text-gray-500">Actif</span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <AdvancedAssistantChat />
      </div>
    </div>
  );
};

export default MobileAssistant;
