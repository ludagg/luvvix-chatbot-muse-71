
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ImageUploader";
import { FloatingActions } from "@/components/FloatingActions";
import { nanoid } from "nanoid";

// Define the Message type to match what ChatMessage expects
import { Message } from "@/components/ChatMessage";

interface ChatContainerProps {
  isVoiceModeActive?: boolean;
}

export const ChatContainer = ({ isVoiceModeActive = false }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completion, setCompletion] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Simple implementation to replace useCompletion from ai/react
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API call delay (in a real app, this would be an actual API call)
    setTimeout(() => {
      // Mock response from AI
      const botResponse = `This is a simulated response to: "${input}"`;
      
      // Create assistant message
      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: botResponse,
        timestamp: new Date(),
      };
      
      setCompletion(botResponse);
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
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

  // Fix the ImageUploader onImageUpload prop type mismatch
  // Convert the File to a URL string when the image is uploaded
  const handleImageUpload = (file: File) => {
    // Create an object URL for the file
    const imageUrl = URL.createObjectURL(file);
    
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

  const handleVoiceInput = (text: string) => {
    setInput(text);
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
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}
        {isLoading && (
          <ChatMessage
            message={{
              id: "loading",
              role: "assistant",
              content: completion,
              timestamp: new Date(),
            }}
            isLoading={true}
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
        <form onSubmit={handleSubmit} className="relative">
          <Input
            type="text"
            placeholder="Écrivez votre message ici..."
            value={input}
            onChange={handleInputChange}
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
