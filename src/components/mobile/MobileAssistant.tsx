
import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Plus } from 'lucide-react';
import { luvvixAIAssistant } from '@/services/luvvix-ai-assistant';
import { useAuth } from '@/hooks/useAuth';
import AssistantChat from './AssistantChat';

interface MobileAssistantProps {
  onBack: () => void;
}

const MobileAssistant = ({ onBack }: MobileAssistantProps) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user } = useAuth();

  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-gray-200 transform transition-transform z-50 ${
      showSidebar ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Assistant IA</h3>
        <button
          onClick={() => setShowSidebar(false)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4">
        <button
          onClick={() => {
            luvvixAIAssistant.clearConversationHistory(user?.id || '');
            setShowSidebar(false);
            window.location.reload();
          }}
          className="w-full flex items-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle conversation</span>
        </button>
      </div>
    </div>
  );

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
        
        <button
          onClick={() => setShowSidebar(true)}
          className="p-2 hover:bg-white/20 rounded-full"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Chat Content */}
      <AssistantChat />

      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default MobileAssistant;
