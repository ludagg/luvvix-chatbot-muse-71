
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Message } from "@/components/ChatMessage";

interface FloatingActionsProps {
  onOpenImageUploader?: () => void;
  onVoiceInput?: (text: string) => void;
  scrollToTop?: () => void;
  lastMessage?: Message | null;
}

export const FloatingActions = ({ 
  onOpenImageUploader, 
  onVoiceInput, 
  scrollToTop, 
  lastMessage 
}: FloatingActionsProps) => {
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);

  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim() && onVoiceInput) {
      onVoiceInput(transcript);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-24 right-4 md:right-8 z-30 flex flex-col gap-4 items-end">
      {/* Voice Assistant */}
      <VoiceAssistant 
        onVoiceInput={handleVoiceInput}
        onToggleVoiceMode={setIsVoiceModeActive}
        isVoiceModeActive={isVoiceModeActive}
        lastMessage={lastMessage}
      />
    </div>
  );
};
