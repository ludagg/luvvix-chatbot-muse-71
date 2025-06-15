
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ModernAIChat from '../ai/ModernAIChat';

interface MobileAssistantProps {
  onBack: () => void;
}

const MobileAssistant = ({ onBack }: MobileAssistantProps) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">LuvviX Assistant IA</h1>
            <p className="text-xs opacity-90">Assistant personnel intelligent</p>
          </div>
        </div>
      </div>

      {/* Modern AI Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ModernAIChat />
      </div>
    </div>
  );
};

export default MobileAssistant;
