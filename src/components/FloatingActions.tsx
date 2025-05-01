
import { useState } from "react";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Message } from "@/components/ChatMessage";

interface FloatingActionsProps {
  onOpenImageUploader?: () => void;
  onVoiceInput?: (text: string) => void;
  scrollToTop?: () => void;
  lastMessage?: Message | null;
  isVoiceModeActive?: boolean;
}

export const FloatingActions = ({ 
  onOpenImageUploader, 
  onVoiceInput, 
  scrollToTop, 
  lastMessage,
  isVoiceModeActive = false
}: FloatingActionsProps) => {
  const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);

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
        onToggleVoiceMode={setIsVoiceAssistantActive}
        isVoiceModeActive={isVoiceModeActive || isVoiceAssistantActive}
        lastMessage={lastMessage}
      />
    </div>
  );
};
