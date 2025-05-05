import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, RefreshCw, ThumbsUp, ThumbsDown, 
  Globe, BrainCircuit, Sparkles, Link, ExternalLink
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';
import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { VisualizationConfig } from "./MathVisualization";

export interface SourceReference {
  id: number;
  title: string;
  url: string;
  snippet: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  useAdvancedReasoning?: boolean;
  useLuvviXThink?: boolean;
  useWebSearch?: boolean;
  sourceReferences?: SourceReference[];
  visualization?: VisualizationConfig;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: "positive" | "negative") => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, onRegenerate, onFeedback }) => {
  const [showSources, setShowSources] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopyClick = () => {
    if (message.role === "user") {
      navigator.clipboard.writeText(message.content);
      setIsCopied(true);
    }
  };

  const toggleSources = () => {
    setShowSources(!showSources);
  };

  const renderers = {
    link: ({ href, children }: { href: string; children: React.ReactNode }) => {
      if (href?.startsWith("http")) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {children}
          </a>
        );
      }
      return <a href={href}>{children}</a>;
    },
  };

  return (
    <div ref={messageRef} className={`flex flex-col gap-2 text-sm`}>
      <div className="flex items-start">
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.role === "assistant" ? "/luvix-ai-logo.png" : "/user-avatar.png"} />
          <AvatarFallback>{message.role === "assistant" ? "LA" : "U"}</AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{message.role === "assistant" ? "LuvviX AI" : "Vous"}</span>
            <Badge variant="secondary">
              {formatDistanceToNowStrict(message.timestamp, {
                addSuffix: true,
                locale: fr,
              })}
            </Badge>
            {message.useAdvancedReasoning && (
              <Badge variant="outline" className="ml-1">
                <BrainCircuit className="w-3.5 h-3.5 mr-1" />
                Raisonnement Avancé
              </Badge>
            )}
            {message.useLuvviXThink && (
              <Badge variant="outline" className="ml-1">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                LuvviXThink
              </Badge>
            )}
            {message.useWebSearch && (
              <Badge variant="outline" className="ml-1">
                <Globe className="w-3.5 h-3.5 mr-1" />
                Recherche Web
              </Badge>
            )}
          </div>
          <div className="mt-1 rounded-md prose prose-sm w-full max-w-none">
            <ReactMarkdown
              components={renderers}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          {message.sourceReferences && message.sourceReferences.length > 0 && (
            <div className="mt-2">
              <Button variant="link" size="sm" onClick={toggleSources}>
                <Link className="w-4 h-4 mr-1.5" />
                {showSources ? "Masquer les sources" : `Afficher les sources (${message.sourceReferences.length})`}
              </Button>
              {showSources && (
                <ul className="mt-2 space-y-1">
                  {message.sourceReferences.map((source) => (
                    <li key={source.id} className="text-xs">
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                        <ExternalLink className="w-3 h-3" />
                        {source.title}
                      </a>
                      <p className="text-muted-foreground">{source.snippet.substring(0, 150)}...</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      {message.role === "user" ? (
        <Button variant="ghost" size="icon" onClick={handleCopyClick} disabled={isCopied}>
          {isCopied ? "Copié !" : <MessageSquare className="w-4 h-4" />}
        </Button>
      ) : (
        isLast && (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => onRegenerate?.(message.id)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Régénérer
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onFeedback?.(message.id, "positive")}>
              <ThumbsUp className="w-4 h-4 mr-2" />
              Satisfait
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onFeedback?.(message.id, "negative")}>
              <ThumbsDown className="w-4 h-4 mr-2" />
              Insatisfait
            </Button>
          </div>
        )
      )}
    </div>
  );
};
