
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Copy, Check, RefreshCcw, Share2, ThumbsUp, ThumbsDown, Image as ImageIcon, BrainCircuit, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  useWebSearch?: boolean;
  sourceReferences?: SourceReference[];
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void;
}

// Simple component to render the message content with markdown
const MessageContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Custom rendering for tables to use shadcn/ui Table component
        table: ({ node, ...props }) => (
          <div className="my-4 w-full overflow-auto">
            <Table>{props.children}</Table>
          </div>
        ),
        thead: ({ node, ...props }) => <TableHeader {...props} />,
        tbody: ({ node, ...props }) => <TableBody {...props} />,
        tr: ({ node, ...props }) => <TableRow {...props} />,
        th: ({ node, ...props }) => <TableHead {...props} />,
        td: ({ node, ...props }) => <TableCell {...props} />,
        // Better styling for code blocks
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <pre className="p-4 bg-secondary/50 rounded-md overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className="px-1.5 py-0.5 bg-secondary/50 rounded-sm" {...props}>
              {children}
            </code>
          );
        },
        // Better rendering for math elements using katex
        // Note: ReactMarkdown doesn't have a 'math' component directly,
        // we need to handle math elements differently through the remarkMath & rehypeKatex plugins
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Component to display source references
const SourceReferences = ({ 
  sources, 
  showSources, 
  setShowSources 
}: { 
  sources: SourceReference[], 
  showSources: boolean, 
  setShowSources: React.Dispatch<React.SetStateAction<boolean>> 
}) => {
  if (!sources || sources.length === 0) return null;
  
  return (
    <div className="mt-4 pt-3 border-t border-border/30">
      <div 
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={() => setShowSources(!showSources)}
      >
        <Globe size={12} />
        <span>{showSources ? "Masquer les sources" : "Afficher les sources"} ({sources.length})</span>
      </div>
      
      {showSources && (
        <div className="mt-2 space-y-2">
          {sources.map(source => (
            <div key={source.id} className="p-2 rounded-md bg-background/50 border border-border/30 text-xs">
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                [{source.id}] {source.title}
              </a>
              <p className="text-muted-foreground mt-1">{source.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for action buttons
const ActionButtons = ({ 
  message,
  isLast,
  onRegenerate,
  hasFeedback,
  handleCopy,
  handleShare,
  handleFeedback
}: {
  message: Message,
  isLast?: boolean,
  onRegenerate?: (messageId: string) => void,
  hasFeedback: "positive" | "negative" | null,
  handleCopy: (text: string, id: string) => void,
  handleShare: (text: string) => void,
  handleFeedback: (type: "positive" | "negative") => void
}) => {
  return (
    <div className="flex space-x-1 ml-2">
      {isLast && onRegenerate && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground"
          onClick={() => onRegenerate(message.id)}
          title="Régénérer la réponse"
        >
          <RefreshCcw className="h-3 w-3" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleCopy(message.content, message.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare(message.content)}>
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground",
          hasFeedback === "positive" && "text-green-500 bg-green-100 hover:bg-green-200"
        )}
        onClick={() => handleFeedback("positive")}
        title="Cette réponse est utile"
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground",
          hasFeedback === "negative" && "text-red-500 bg-red-100 hover:bg-red-200"
        )}
        onClick={() => handleFeedback("negative")}
        title="Cette réponse n'est pas utile"
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
};

// Component for special mode badges
const ModeBadges = ({ message }: { message: Message }) => {
  if (!message.useAdvancedReasoning && !message.useWebSearch) return null;
  
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <TooltipProvider>
        {message.useAdvancedReasoning && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                <BrainCircuit size={12} />
                <span>Raisonnement avancé</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Cette réponse utilise une analyse approfondie avec raisonnement détaillé</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {message.useWebSearch && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                <Globe size={12} />
                <span>LuvvixSEARCH</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Cette réponse inclut des résultats de recherche web en temps réel</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export function ChatMessage({ 
  message, 
  isLast = false, 
  onRegenerate, 
  onFeedback 
}: ChatMessageProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasFeedback, setHasFeedback] = useState<"positive" | "negative" | null>(null);
  const [showSources, setShowSources] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast({
        title: "Texte copié !",
        description: "Le contenu du message a été copié dans le presse-papier.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Réponse de LuvviX AI',
        text: text,
      }).then(() => {
        toast({
          title: "Partage réussi",
          description: "La réponse a été partagée avec succès.",
        });
      }).catch((error) => {
        console.error('Erreur lors du partage :', error);
        toast({
          title: "Erreur de partage",
          description: "Impossible de partager ce contenu.",
          variant: "destructive"
        });
      });
    } else {
      handleCopy(text, message.id);
      toast({
        title: "Fonctionnalité limitée",
        description: "Le partage direct n'est pas supporté par votre navigateur. Le texte a été copié à la place.",
      });
    }
  };

  const handleFeedback = (type: "positive" | "negative") => {
    if (onFeedback) {
      onFeedback(message.id, type);
      setHasFeedback(type);
      toast({
        title: type === "positive" ? "Merci pour votre retour positif!" : "Désolé que cette réponse ne soit pas utile",
        description: type === "positive" 
          ? "Nous sommes ravis que cette réponse vous ait aidé." 
          : "Nous utiliserons votre retour pour améliorer nos réponses.",
      });
    }
  };

  const isUser = message.role === "user";
  const hasSources = !isUser && message.sourceReferences && message.sourceReferences.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 md:gap-4",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      <div className="flex-shrink-0 mt-1">
        <Avatar className={cn("border", isUser ? "border-blue-200 bg-blue-100" : "border-purple-200 bg-purple-100")}>
          <AvatarFallback className={isUser ? "text-blue-500" : "text-purple-500"}>
            {isUser ? <User size={18} /> : <Bot size={18} />}
          </AvatarFallback>
          {!isUser && <AvatarImage src="/luvvix-avatar.png" alt="LuvviX AI" />}
        </Avatar>
      </div>

      <div className={cn(
        "flex flex-col space-y-1 max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Mode badges */}
        {!isUser && <ModeBadges message={message} />}
        
        <div className={cn(
          "px-4 py-3 rounded-lg relative",
          isUser ? "bg-blue-500 text-white" : "bg-muted text-foreground"
        )}>
          <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
            <MessageContent content={message.content} />
          </div>

          {/* Sources References */}
          {hasSources && (
            <SourceReferences 
              sources={message.sourceReferences || []} 
              showSources={showSources} 
              setShowSources={setShowSources} 
            />
          )}
        </div>
        
        {/* Action buttons for assistant messages */}
        {!isUser && (
          <ActionButtons 
            message={message}
            isLast={isLast}
            onRegenerate={onRegenerate}
            hasFeedback={hasFeedback}
            handleCopy={handleCopy}
            handleShare={handleShare}
            handleFeedback={handleFeedback}
          />
        )}
      </div>
    </motion.div>
  );
}
