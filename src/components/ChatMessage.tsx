
import { useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Check, Copy, ThumbsDown, ThumbsUp, RefreshCw, BookOpenCheck, 
  Globe, BrainCircuit, Code, CodeSquare, Lightbulb, 
  Info, AlertTriangle, ExternalLink, Bookmark, BookmarkCheck,
  ListOrdered, List, Heading1, Heading2, Heading3, Table2,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import 'katex/dist/katex.min.css';
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatMarkdownTables } from "@/utils/formatMarkdownTables";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MathFunctionChart } from "@/components/MathFunctionChart";
import { Message } from "@/types/message";
import { ChatMessageCodePreview } from "./ChatMessageCodePreview";
import { ShareOptions } from "./ShareOptions";
import { toast } from "sonner";

export interface SourceReference {
  id: number | string;
  title: string;
  url: string;
  snippet?: string;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLast = false, onRegenerate, onFeedback, isLoading }: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [showSourcesDialog, setShowSourcesDialog] = useState(false);
  const [showFormatButtons, setShowFormatButtons] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showActionsBar, setShowActionsBar] = useState(false);
  
  // Préparation du contenu avec tableaux bien formatés
  const formattedContent = message.content ? formatMarkdownTables(message.content) : "";

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (contentRef.current) {
      const text = contentRef.current.textContent || "";
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Message copié dans le presse-papiers");
    }
  };

  const handleFeedback = (type: "positive" | "negative") => {
    if (onFeedback && !feedbackGiven) {
      onFeedback(message.id, type);
      setFeedbackGiven(type);
      toast.success(type === "positive" ? "Merci pour votre retour positif" : "Merci pour votre retour négatif");
    }
  };
  
  const countSources = () => {
    return message.sourceReferences?.length || 0;
  };
  
  const hasRealSources = message.sourceReferences?.some(source => !source.title.includes("Résultat de recherche")) || false;

  // Fonction pour rendre les liens des sources plus descriptifs
  const getSourceDisplayTitle = (source: SourceReference): string => {
    if (source.title.includes("Résultat de recherche")) {
      const searchTerm = source.title.match(/pour (.+)$/);
      if (searchTerm && searchTerm[1]) {
        return searchTerm[1];
      }
    }
    return source.title;
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Message retiré des favoris" : "Message ajouté aux favoris");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full flex mb-1 px-1 md:px-3", // Ajout des marges horizontales pour élargir la zone de discussion
        message.role === "user" ? "justify-end" : "justify-start"
      )}
      id={message.id}
      onMouseEnter={() => message.role === "assistant" && setShowActionsBar(true)}
      onMouseLeave={() => message.role === "assistant" && setShowActionsBar(false)}
    >
      {/* Avatar for assistant messages */}
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary mr-2 mt-1">
          <span className="font-semibold text-xs">AI</span>
        </div>
      )}
      
      <div className={cn(
        "backdrop-blur-sm p-3 rounded-2xl max-w-[94%] md:max-w-[88%]", // Augmentation de la largeur maximale du message
        message.role === "user" 
          ? "bg-primary/10 text-foreground rounded-tr-sm ml-6" // User message styling
          : "bg-muted/40 rounded-tl-sm relative group" // AI message styling
      )}>
        {/* Floating action bar for assistant messages */}
        {message.role === "assistant" && (showActionsBar || isBookmarked) && (
          <div className="absolute -top-10 right-2 bg-background/90 backdrop-blur-sm border border-border/30 rounded-full px-2 py-1.5 shadow-md z-10 flex items-center gap-1.5">
            {isLast && onRegenerate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 rounded-full"
                      onClick={() => onRegenerate(message.id)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Régénérer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 rounded-full"
                    onClick={handleCopy}
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCopied ? "Copié" : "Copier"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 rounded-full",
                      isBookmarked ? "text-primary" : ""
                    )}
                    onClick={toggleBookmark}
                  >
                    {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {isLast && message.content && (
              <ShareOptions title="Message LuvviX" content={message.content} />
            )}
            
            {isLast && onFeedback && !feedbackGiven && (
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-green-500"
                        onClick={() => handleFeedback("positive")}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Utile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-500"
                        onClick={() => handleFeedback("negative")}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pas utile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        )}
        
        {/* Feature buttons in a more modern dropdown style */}
        {message.role === "assistant" && showFormatButtons && (
          <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border/10 overflow-x-auto">
            <div className="flex flex-wrap gap-1 justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                      <Heading1 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Titre principal</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                      <Heading2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sous-titre</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Liste à puces</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                      <Table2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tableau</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
        
        {/* Graph visualization if present */}
        {message.hasGraph && message.graphParams && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <MathFunctionChart params={message.graphParams} />
          </div>
        )}
        
        <div ref={contentRef} className="prose prose-sm dark:prose-invert max-w-none break-words">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1" >
                  {props.children}
                  <ExternalLink className="h-3 w-3 inline" />
                </a>
              ),
              h1: ({ node, ...props }) => (
                <h1 {...props} className="text-2xl font-bold mt-6 mb-4 text-gradient" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-xl font-bold mt-5 mb-3" />
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} className="text-lg font-bold mt-4 mb-2" />
              ),
              h4: ({ node, ...props }) => (
                <h4 {...props} className="text-base font-semibold mt-3 mb-2" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc pl-6 my-3 space-y-1.5" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal pl-6 my-3 space-y-1.5" />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="mb-0.5" />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote {...props} className="border-l-4 border-primary/30 pl-4 italic my-3" />
              ),
              code: ({ node, ...props }) => {
                if (!props.className) {
                  return (
                    <code className="bg-muted/80 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                  );
                }
                
                const codeContent = String(props.children).replace(/\n$/, '');
                const language = props.className ? props.className.replace('language-', '') : '';
                const codeBlockId = `code-${message.id}-${language}-${codeContent.length}`;
                
                return (
                  <ChatMessageCodePreview
                    codeContent={codeContent}
                    language={language}
                    codeBlockId={codeBlockId}
                  />
                );
              },
              img: ({ node, ...props }) => (
                <img {...props} className="rounded-lg w-auto max-w-full h-auto object-cover my-3" alt={props.alt || "Image"} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-3 border border-border/40 rounded-lg">
                  <Table {...props} className="w-full" />
                </div>
              ),
              thead: ({ node, ...props }) => <TableHeader {...props} />,
              tbody: ({ node, ...props }) => <TableBody {...props} />,
              tr: ({ node, ...props }) => <TableRow {...props} />,
              th: ({ node, ...props }) => <TableHead {...props} className="bg-muted/50 font-medium py-2 px-4 text-left" />,
              td: ({ node, ...props }) => <TableCell {...props} className="py-2 px-4" />
            }}
          >
            {formattedContent}
          </ReactMarkdown>
          
          {/* Modern source display */}
          {message.role === "assistant" && message.sourceReferences && message.sourceReferences.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/10">
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span>Sources ({message.sourceReferences.length})</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-5 px-1.5 rounded-full hover:bg-muted/60" 
                  onClick={() => setShowSourcesDialog(true)}
                >
                  <span className="text-primary text-xs">Voir</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.sourceReferences.slice(0, 3).map(source => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline py-0.5 px-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <span>{getSourceDisplayTitle(source)}</span>
                    <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                  </a>
                ))}
                {message.sourceReferences.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-5 px-2 rounded-full hover:bg-primary/5"
                    onClick={() => setShowSourcesDialog(true)}
                  >
                    <span className="text-primary text-xs">+{message.sourceReferences.length - 3}</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/10">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            
            {/* Feature badges in a cleaner, more modern style */}
            <div className="flex gap-1">
              {message.role === "assistant" && message.useAdvancedReasoning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="px-1 py-0 h-4 gap-0.5 hover:bg-accent/30 cursor-help">
                        <BrainCircuit className="h-2.5 w-2.5" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Raisonnement avancé</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {message.role === "assistant" && message.useLuvviXThink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="px-1 py-0 h-4 gap-0.5 hover:bg-accent/30 cursor-help">
                        <Lightbulb className="h-2.5 w-2.5" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Réflexion LuvviXThink</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {message.role === "assistant" && message.useWebSearch && countSources() > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge 
                        variant={hasRealSources ? "default" : "outline"}
                        className="px-1 py-0 h-4 gap-0.5 hover:bg-accent/30 cursor-help"
                        onClick={() => setShowSourcesDialog(true)}
                      >
                        <Globe className="h-2.5 w-2.5" />
                        <span className="text-[9px]">{countSources()}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{countSources()} sources trouvées</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {isBookmarked && (
                <Badge className="px-1 py-0 h-4 gap-0.5 bg-primary/20 text-primary cursor-help">
                  <BookmarkCheck className="h-2.5 w-2.5" />
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Avatar for user messages */}
      {message.role === "user" && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary ml-2 mt-1">
          {user?.displayName?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      
      {/* Modern source dialog */}
      <Dialog open={showSourcesDialog} onOpenChange={setShowSourcesDialog}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b border-border/10">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Sources utilisées
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-4">
            <div className="space-y-3">
              {message.sourceReferences?.map((source) => (
                <div key={source.id} className="border border-border/20 rounded-lg p-3 bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 flex items-center justify-center bg-primary/10 rounded-full text-xs text-primary font-medium">
                      {source.id}
                    </span>
                    <h3 className="font-medium text-sm">
                      {getSourceDisplayTitle(source)}
                    </h3>
                  </div>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all mb-1.5 inline-flex items-center gap-1"
                  >
                    {source.url.length > 60 ? `${source.url.substring(0, 60)}...` : source.url}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  {source.snippet && (
                    <p className="text-xs text-muted-foreground mt-1.5 border-t border-border/20 pt-1.5 line-clamp-3">{source.snippet}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
