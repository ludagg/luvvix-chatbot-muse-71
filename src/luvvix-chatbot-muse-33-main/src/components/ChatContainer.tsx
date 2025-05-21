
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/luvvix-chatbot-muse-33-main/src/contexts/AuthContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedQuestions } from './SuggestedQuestions';
import { FloatingActions } from './FloatingActions';
import { ScrollArea } from './ui/scroll-area';
import { nanoid } from 'nanoid';

const INITIAL_GREETING = {
  id: nanoid(),
  role: "assistant",
  content: "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ?! 😊",
  timestamp: new Date(),
};

export function ChatContainer() {
  const { user, currentConversationId, conversations, saveCurrentConversation } = useAuth();
  const [messages, setMessages] = useState<any[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get suggested questions based on conversation context
  const suggestedQuestions = [
    "Comment puis-je améliorer mon site web ?",
    "Explique-moi comment fonctionne l'IA",
    "Quelles sont les dernières technologies ?",
    "Comment rédiger un bon CV ?"
  ];

  // Load messages from current conversation
  useEffect(() => {
    if (currentConversationId) {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (conversation?.messages && conversation.messages.length > 0) {
        setMessages(conversation.messages);
        setShowSuggestions(false);
      } else {
        setMessages([INITIAL_GREETING]);
        setShowSuggestions(true);
      }
    } else {
      setMessages([INITIAL_GREETING]);
      setShowSuggestions(true);
    }
  }, [currentConversationId, conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Show loading state
    setIsLoading(true);
    
    // Add user message
    const userMessage = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveCurrentConversation(newMessages);
    setShowSuggestions(false);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: nanoid(),
        role: "assistant",
        content: getAIResponse(content),
        timestamp: new Date(),
      };
      
      const updatedMessages = [...newMessages, aiResponse];
      setMessages(updatedMessages);
      saveCurrentConversation(updatedMessages);
      setIsLoading(false);
    }, 1000);
  };

  // Simple AI response generator (placeholder)
  const getAIResponse = (userMessage: string) => {
    const responses = [
      "Je comprends votre question. Voici ce que je peux vous dire à ce sujet...",
      "C'est une question intéressante ! Laissez-moi vous expliquer...",
      "Bien sûr, je serais ravi de vous aider avec ça.",
      "Voici quelques informations qui pourraient vous être utiles concernant votre demande.",
      "J'ai analysé votre question et voici ce que je peux vous dire."
    ];
    
    return `${responses[Math.floor(Math.random() * responses.length)]} En réponse à : "${userMessage}"`;
  };

  // Handle clicking on suggested questions
  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages area with scroll */}
      <ScrollArea className="flex-grow p-4">
        <div className="flex flex-col space-y-6 pb-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <ChatMessage 
              message={{ 
                id: "loading", 
                role: "assistant", 
                content: "...", 
                timestamp: new Date(),
                isLoading: true
              }} 
            />
          )}
          
          {/* Show suggested questions if no conversation has happened yet */}
          {showSuggestions && !isLoading && messages.length === 1 && (
            <div className="pt-6">
              <SuggestedQuestions 
                questions={suggestedQuestions} 
                onQuestionClick={handleQuestionClick}
              />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input box */}
      <div className="border-t border-border/40 p-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
      
      {/* Floating actions */}
      <FloatingActions
        scrollToTop={() => {
          scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
