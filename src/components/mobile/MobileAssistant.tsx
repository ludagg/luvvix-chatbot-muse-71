
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ModernChatInterface from './ModernChatInterface';

interface MobileAssistantProps {
  onBack: () => void;
}

const MobileAssistant = ({ onBack }: MobileAssistantProps) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header minimal */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Interface de chat moderne */}
      <div className="flex-1 overflow-hidden">
        <ModernChatInterface />
      </div>
    </div>
  );
};

export default MobileAssistant;
