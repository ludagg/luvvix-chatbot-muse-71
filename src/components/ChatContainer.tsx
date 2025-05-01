import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ImagePlus, ArrowUp } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { cn } from "@/lib/utils";
import { useCompletion } from "ai/react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";
import { FloatingActions } from "@/components/FloatingActions";

interface ChatContainerProps {
  isVoiceModeActive?: boolean;
}

export const ChatContainer = ({ isVoiceModeActive = false }: ChatContainerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const {
    completion,
    input: prompt,
    setInput: setPrompt,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useCompletion({
    api: "/api/completion",
    onFinish: (completion) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: completion,
        },
      ]);
    },
  });

  useEffect(() => {
    setPrompt(input);
  }, [input, setPrompt]);

  const handleVoiceInput = (text: string) => {
    setInput(text);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom();
    }
  }, [messages, isUserScrolling]);

  const handleImageUpload = (imageUrl: string) => {
    if (imageUrl) {
      setInput((prevInput) => prevInput + `\n![Image](${imageUrl})`);
      toast({
        title: "Image ajoutée",
        description: "L'URL de l'image a été ajoutée à votre message.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors du chargement de l'image.",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: prompt,
      },
    ]);

    handleSubmit(e);
    setInput("");
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    // If the user scrolls up, disable auto-scroll to bottom
    if (element.scrollTop + element.clientHeight < element.scrollHeight - 50) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}
        {isLoading && (
          <ChatMessage
            message={{ role: "assistant", content: completion }}
            isLoading
          />
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-primary/10">
        <FloatingActions
          scrollToTop={scrollToTop}
          onVoiceInput={handleVoiceInput}
          lastMessage={messages.length > 0 ? messages[messages.length - 1] : null}
          isVoiceModeActive={isVoiceModeActive}
        />
        <form onSubmit={handleFormSubmit} className="relative">
          <Input
            type="text"
            placeholder="Écrivez votre message ici..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleInputChange(e);
            }}
            className="rounded-full py-2 pr-20 bg-secondary/80 backdrop-blur-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className={cn(
              "absolute right-1.5 bottom-1.5 rounded-full px-4",
              isLoading ? "cursor-not-allowed opacity-75" : ""
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      <ImageUploader
        isOpen={isImageUploaderOpen}
        onClose={() => setIsImageUploaderOpen(false)}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
};
