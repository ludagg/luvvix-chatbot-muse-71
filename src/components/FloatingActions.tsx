
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Message } from "@/types/message";
import { FileText, Download, FileBadge } from "lucide-react";
import { createPDF, createWordDoc } from "@/utils/pdfUtils";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | null>(null);

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
      setIsExporting("pdf");
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
      setIsExporting(null);
    }
  };

  const handleExportWord = async () => {
    if (!lastMessage || lastMessage.role !== "assistant" || !document.getElementById(lastMessage.id)) {
      toast.error("Aucun message disponible à exporter");
      return;
    }

    try {
      setIsExporting("word");
      const messageElement = document.getElementById(lastMessage.id);
      
      if (messageElement) {
        // Trouver l'élément de contenu dans le message
        const contentElement = messageElement.querySelector('.prose');
        if (contentElement) {
          await createWordDoc(
            contentElement as HTMLElement,
            lastMessage.id,
            new Date(lastMessage.timestamp || Date.now())
          );
          toast.success("Document Word exporté avec succès");
        } else {
          toast.error("Impossible de trouver le contenu du message");
          console.error("Élément de contenu non trouvé:", messageElement);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'export Word:", error);
      toast.error("Erreur lors de l'export Word");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-24 right-4 md:right-8 z-30 flex flex-col gap-4 items-end">
      {/* Export Document Button */}
      {lastMessage && lastMessage.role === "assistant" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 border border-border/50 backdrop-blur-sm shadow-md hover:bg-background/90"
              disabled={isExporting !== null}
            >
              {isExporting === "pdf" ? (
                <FileText className="h-5 w-5 animate-pulse" />
              ) : isExporting === "word" ? (
                <FileBadge className="h-5 w-5 animate-pulse" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <span className="sr-only">Exporter le document</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Exporter en PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportWord} className="cursor-pointer flex items-center gap-2">
              <FileBadge className="h-4 w-4" />
              <span>Exporter en Word</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
