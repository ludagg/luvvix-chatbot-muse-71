
import { useState, useEffect } from "react";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { ConversationSelector } from "./ConversationSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingActions } from "./FloatingActions";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Bonjour ! Je suis **LuvviX AI**, un assistant IA amical et intelligent développé par **LuvviX Technologies**. Comment puis-je vous aider aujourd'hui ?! 😊",
    timestamp: new Date(),
  },
];

export const ChatContainer = () => {
  const { 
    user, 
    conversations, 
    currentConversationId, 
    createNewConversation,
    setCurrentConversation,
    isPro = false,
  } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Initialiser les messages
  const [initialMessages, setInitialMessages] = useState<Message[]>(INITIAL_MESSAGES);
  
  // Utiliser le hook useChat pour gérer la logique du chat
  const {
    messages,
    isLoading,
    suggestedQuestions,
    useAdvancedReasoning,
    useLuvviXThink,
    useWebSearch,
    messagesEndRef,
    shouldAutoScroll,
    chatContainerRef,
    handleSendMessage,
    handleSendImage,
    handleRegenerate,
    handleFeedback,
    handleSuggestedQuestionClick,
    toggleAdvancedReasoning,
    toggleLuvviXThink,
    toggleWebSearch,
    scrollToTop,
    setMessages
  } = useChat(initialMessages);

  useEffect(() => {
    if (user && currentConversationId) {
      const currentConv = conversations.find(c => c.id === currentConversationId);
      if (currentConv) {
        setInitialMessages(currentConv.messages as Message[]);
        setMessages(currentConv.messages as Message[]);
      } else {
        setInitialMessages(INITIAL_MESSAGES);
        setMessages(INITIAL_MESSAGES);
      }
    } else if (!user) {
      setInitialMessages(INITIAL_MESSAGES);
      setMessages(INITIAL_MESSAGES);
    }
  }, [currentConversationId, conversations, user, setMessages]);

  return (
    <div className="flex flex-col h-full">      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 pb-28"
      >
        <div className="space-y-4 md:space-y-6 mb-2">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1 && message.role === "assistant"}
              onRegenerate={handleRegenerate}
              onFeedback={handleFeedback}
            />
          ))}
          
          {messages.length > 0 && suggestedQuestions.length > 0 && (
            <div className="mt-4">
              <SuggestedQuestions 
                questions={suggestedQuestions} 
                onQuestionClick={handleSuggestedQuestionClick} 
              />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <FloatingActions scrollToTop={scrollToTop} />

      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto w-full px-2 md:px-4">
          <div className="bg-gradient-to-t from-background via-background to-background/80 pt-6 pb-4 border-t border-primary/10 backdrop-blur-sm">
            <div className="px-3 md:px-6">
              <ChatInput 
                onSendMessage={handleSendMessage}
                onSendImage={handleSendImage} 
                isLoading={isLoading}
                isPro={isPro}
                useAdvancedReasoning={useAdvancedReasoning}
                useLuvviXThink={useLuvviXThink}
                useWebSearch={useWebSearch}
                onToggleAdvancedReasoning={toggleAdvancedReasoning}
                onToggleLuvviXThink={toggleLuvviXThink}
                onToggleWebSearch={toggleWebSearch}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
