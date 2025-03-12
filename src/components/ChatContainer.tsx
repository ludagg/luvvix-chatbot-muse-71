
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { nanoid } from "nanoid";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Bonjour! Je suis LuvviX, votre assistant IA. Comment puis-je vous aider aujourd'hui?",
    timestamp: new Date(),
  },
];

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response (will be replaced with real API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: getSimulatedResponse(content),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="space-y-6">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isLast={index === messages.length - 1}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </motion.div>
      
      <div className="mt-auto border-t border-border/50 bg-background/80 backdrop-blur-md px-4 py-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

// Simulated responses - will be replaced with actual AI
function getSimulatedResponse(input: string): string {
  const responses = [
    "Je comprends ce que vous voulez dire. Pouvez-vous me donner plus de détails?",
    "C'est une question intéressante. Laissez-moi réfléchir...",
    "Je suis là pour vous aider avec cela.",
    "Voici ce que je peux vous dire à ce sujet...",
    "J'apprécie votre question. Voici ma réponse.",
    "D'après mon analyse, voici ce que je peux vous dire.",
    "Je suis heureux de pouvoir vous aider avec cela.",
    "C'est un sujet fascinant. Voici ce que je sais.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
