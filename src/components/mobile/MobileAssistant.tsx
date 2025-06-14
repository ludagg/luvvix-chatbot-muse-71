
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, Plus, MessageCircle, Sparkles, Lightbulb, Calendar, Cloud } from 'lucide-react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MobileAssistantProps {
  onBack: () => void;
}

const MobileAssistant = ({ onBack }: MobileAssistantProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    conversations,
    currentConversation,
    isTyping,
    sendMessage,
    createNewConversation,
    loadConversation,
    deleteConversation,
    getAIRecommendations
  } = useAIAssistant();

  const quickSuggestions = [
    "Comment optimiser ma productivité ?",
    "Quelles sont les tendances technologiques actuelles ?",
    "Aide-moi à planifier ma journée",
    "Explique-moi l'intelligence artificielle",
    "Conseils pour une meilleure organisation",
    "Comment améliorer mes compétences ?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const renderWelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">LuvviX Assistant</h2>
      <p className="text-gray-600 mb-8 max-w-sm">
        Votre assistant IA personnel. Posez-moi n'importe quelle question, je suis là pour vous aider !
      </p>

      <div className="w-full max-w-sm space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Lightbulb className="w-4 h-4 mr-2" />
          Suggestions
        </h3>
        
        {quickSuggestions.slice(0, 3).map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );

  const renderConversation = () => (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {currentConversation?.messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {format(message.timestamp, 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-gray-200 transform transition-transform z-50 ${
      showSidebar ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Conversations</h3>
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
            createNewConversation();
            setShowSidebar(false);
          }}
          className="w-full flex items-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle conversation</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        {conversations.map(conversation => (
          <button
            key={conversation.id}
            onClick={() => {
              loadConversation(conversation);
              setShowSidebar(false);
            }}
            className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
              currentConversation?.id === conversation.id ? 'bg-blue-50' : ''
            }`}
          >
            <h4 className="font-medium text-gray-900 truncate">{conversation.title}</h4>
            <p className="text-sm text-gray-500 mt-1">
              {format(conversation.updated_at, 'dd/MM/yyyy')}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Assistant IA</h1>
        </div>
        
        <button
          onClick={() => setShowSidebar(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <MessageCircle className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      {!currentConversation ? renderWelcomeScreen() : renderConversation()}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {!currentConversation && (
          <div className="flex flex-wrap gap-2 mt-3">
            {quickSuggestions.slice(3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

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
