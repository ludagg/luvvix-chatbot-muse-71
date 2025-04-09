
import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { ConversationSelector } from "./ConversationSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingActions } from "./FloatingActions";
import { useChatMessages } from "@/hooks/useChatMessages";
import { ChatFeatureToggles } from "./ChatFeatureToggles";

export const ChatContainer = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const {
    messages,
    isLoading,
    suggestedQuestions,
    useAdvancedReasoning,
    useLuvviXThink,
    useWebSearch,
    shouldAutoScroll,
    setShouldAutoScroll,
    setUseAdvancedReasoning,
    setUseLuvviXThink,
    setUseWebSearch,
    handleSendMessage,
    handleSendImage,
    handleRegenerate,
    handleFeedback,
    handleSuggestedQuestionClick
  } = useChatMessages({ scrollToBottom });

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    
    const handleScroll = () => {
      if (!chatContainer) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShouldAutoScroll(isNearBottom);
    };
    
    chatContainer?.addEventListener('scroll', handleScroll);
    
    return () => {
      chatContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [setShouldAutoScroll]);

  const toggleAdvancedReasoning = () => {
    setUseAdvancedReasoning(!useAdvancedReasoning);
    if (!useAdvancedReasoning) {
      setUseLuvviXThink(false);
    }
  };
  
  const toggleLuvviXThink = () => {
    setUseLuvviXThink(!useLuvviXThink);
    if (!useLuvviXThink) {
      setUseAdvancedReasoning(true);
    }
  };

  const toggleWebSearch = () => {
    setUseWebSearch(!useWebSearch);
  };

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
                isPro={false}
                useAdvancedReasoning={useAdvancedReasoning}
                useLuvviXThink={useLuvviXThink}
                useWebSearch={useWebSearch}
                onToggleAdvancedReasoning={toggleAdvancedReasoning}
                onToggleLuvviXThink={toggleLuvviXThink}
                onToggleWebSearch={toggleWebSearch}
              />
              
              {useWebSearch && (
                <div className="text-xs text-center mt-2 text-muted-foreground">
                  <p>Pour configurer vos clés API, tapez <code>/key [service] [clé]</code> (ex: "/key serp votre_clé_api")</p>
                  <p>Services supportés: serp, google, bright</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
