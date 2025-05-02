
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Message } from "@/components/ChatMessage";
import { FileText, Download } from "lucide-react";
import { createPDF } from "@/utils/pdfUtils";
import { toast } from "sonner";

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
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim() && onVoiceInput) {
      onVoiceInput(transcript);
    }
  };

  const handleExportPDF = async () => {
    if (!lastMessage || lastMessage.role !== "assistant" || !document.getElementById(lastMessage.id)) {
      toast.error("Aucun message disponible à exporter");
      return;
    }

    try {
      setIsPdfExporting(true);
      const messageElement = document.getElementById(lastMessage.id);
      
      if (messageElement) {
        // Trouver l'élément de contenu dans le message
        const contentElement = messageElement.querySelector('.prose');
        if (contentElement) {
          await createPDF(
            contentElement as HTMLElement,
            lastMessage.id,
            new Date(lastMessage.timestamp || Date.now())
          );
          toast.success("PDF exporté avec succès");
        } else {
          toast.error("Impossible de trouver le contenu du message");
          console.error("Élément de contenu non trouvé:", messageElement);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setIsPdfExporting(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-24 right-4 md:right-8 z-30 flex flex-col gap-4 items-end">
      {/* Export PDF Button */}
      {lastMessage && lastMessage.role === "assistant" && (
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80 border border-border/50 backdrop-blur-sm shadow-md hover:bg-background/90"
          onClick={handleExportPDF}
          disabled={isPdfExporting}
        >
          {isPdfExporting ? (
            <FileText className="h-5 w-5 animate-pulse" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          <span className="sr-only">Exporter en PDF</span>
        </Button>
      )}
      
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
