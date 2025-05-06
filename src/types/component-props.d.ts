
import { Dispatch, ReactNode, SetStateAction } from "react";
import { Message } from "./message";

export interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
  isLoading: boolean;
  onCreateMathGraph?: () => void;
  useAdvancedReasoning: boolean;
  onToggleAdvancedReasoning: () => void;
  useLuvviXThink: boolean;
  onToggleLuvviXThink: () => void;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
}

export interface FloatingActionsProps {
  onOpenImageUploader?: () => void;
  onVoiceInput?: (text: string) => void;
  scrollToTop?: () => void;
  scrollToBottom?: () => void;
  showScrollToTop?: boolean;
  lastMessage?: Message | null;
  setUseAdvancedReasoning?: Dispatch<SetStateAction<boolean>>;
  useAdvancedReasoning?: boolean;
  setUseLuvviXThink?: Dispatch<SetStateAction<boolean>>;
  useLuvviXThink?: boolean;
  setUseWebSearch?: Dispatch<SetStateAction<boolean>>;
  useWebSearch?: boolean;
}

export interface VoiceChatProps {
  onVoiceStart?: () => void;
  onVoiceEnd?: (transcript: string) => void;
  onSpeaking?: (isListening: boolean) => void;
  lastMessage?: Message | null;
  className?: string;
}

export interface VoiceControlProps {
  isActive: boolean;
  onToggle: () => void;
  position?: "floating" | "inline" | "fixed";
  className?: string;
  size?: "sm" | "md" | "lg";
  onVoiceInput?: (text: string) => void;
  lastMessage?: Message | null;
}

export interface CodePreviewProps {
  code: string;
  language: string;
  showPreview?: boolean;
}
