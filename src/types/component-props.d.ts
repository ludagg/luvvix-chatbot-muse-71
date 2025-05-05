
import { Message } from "./message";
import { Dispatch, SetStateAction } from "react";
import { File } from "@/types/file";

// Extend ChatInput props
declare module "@/components/ChatInput" {
  export interface ChatInputProps {
    onSendMessage: (content: string) => Promise<void>;
    onSendImage: (file: File) => Promise<void>;
    isLoading: boolean;
    onCreateMathGraph?: () => void;
    useAdvancedReasoning?: boolean;
    useLuvviXThink?: boolean;
    useWebSearch?: boolean;
    useSentimentAnalysis?: boolean;
    useContextMemory?: boolean;
    onToggleAdvancedReasoning?: () => void;
    onToggleLuvviXThink?: () => void;
    onToggleWebSearch?: () => void;
    onToggleSentimentAnalysis?: () => void;
    onToggleContextMemory?: () => void;
    isPro?: boolean;
  }
}

// Extend FloatingActions props
declare module "@/components/FloatingActions" {
  export interface FloatingActionsProps {
    scrollToTop: () => void;
    scrollToBottom: () => void;
    showScrollToTop: boolean;
    setUseAdvancedReasoning: Dispatch<SetStateAction<boolean>>;
    useAdvancedReasoning: boolean;
    setUseLuvviXThink: Dispatch<SetStateAction<boolean>>;
    useLuvviXThink: boolean;
    setUseWebSearch: Dispatch<SetStateAction<boolean>>;
    useWebSearch: boolean;
    onOpenImageUploader?: () => void;
    onVoiceInput?: (text: string) => void;
    lastMessage?: Message | null;
  }
}

// Extend ConversationSelector props
declare module "@/components/ConversationSelector" {
  export interface ConversationSelectorProps {
    onSelect?: () => void;
    closeMenu?: () => void;
  }
}

// Extend MathFunctionCreator props
declare module "@/components/MathFunctionCreator" {
  export interface MathFunctionCreatorProps {
    onSubmit: (graphMessage: Message) => void;
  }
}

// Extend ChatMessage props
declare module "@/components/ChatMessage" {
  export interface ChatMessageProps {
    message: Message;
    onRegenerate?: (messageId: string) => void;
    isLoading?: boolean;
  }
  
  export interface SourceReference {
    id: number | string;
    title: string;
    url: string;
    snippet?: string;
  }
}
