
import { Message } from "./message";

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendImage?: (file: File) => void;
  isLoading?: boolean;
  isPro?: boolean;
  useAdvancedReasoning: boolean;
  useLuvviXThink: boolean;
  useWebSearch: boolean;
  useSentimentAnalysis?: boolean;
  useContextMemory?: boolean;
  onToggleAdvancedReasoning: () => void;
  onToggleLuvviXThink: () => void;
  onToggleWebSearch: () => void;
  onToggleSentimentAnalysis?: () => void;
  onToggleContextMemory?: () => void;
  onCreateMathGraph?: () => void;
}

export interface EnhancedVoiceControlProps {
  onVoiceStart?: () => void;
  onVoiceEnd?: (transcript: string) => void;
  lastMessage?: Message | null;
  className?: string;
  position?: "floating" | "inline" | "fixed" | "input";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "minimal";
  showTooltip?: boolean;
}

export interface FloatingActionsProps {
  onOpenImageUploader?: () => void;
  onVoiceInput?: (text: string) => void;
  scrollToTop?: () => void;
  scrollToBottom?: () => void;
  showScrollToTop?: boolean;
  lastMessage?: Message | null;
  setUseAdvancedReasoning?: React.Dispatch<React.SetStateAction<boolean>>;
  useAdvancedReasoning?: boolean;
  setUseLuvviXThink?: React.Dispatch<React.SetStateAction<boolean>>;
  useLuvviXThink?: boolean;
  setUseWebSearch?: React.Dispatch<React.SetStateAction<boolean>>;
  useWebSearch?: boolean;
}
