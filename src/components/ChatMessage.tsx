
import { useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Check, Copy, ThumbsDown, ThumbsUp, RefreshCw, BookOpenCheck, 
  Globe, BrainCircuit, Code, CodeSquare, Lightbulb, 
  Info, AlertTriangle, ExternalLink,
  ListOrdered, List, Heading1, Heading2, Heading3
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
import { formatMarkdownTables } from "@/utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface SourceReference {
  id: number | string;
  title: string;
  url: string;
  snippet?: string;
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
  sentimentAnalysis?: string;
  contextMemory?: string;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void;
}

export function ChatMessage({ message, isLast = false, onRegenerate, onFeedback }: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [showSourcesDialog, setShowSourcesDialog] = useState(false);
  const [isCodeBlockCopied, setIsCodeBlockCopied] = useState<Record<string, boolean>>({});
  const hasRealSources = message.sourceReferences?.some(source => !source.title.includes("Résultat de recherche")) || false;
  const [showFormatButtons, setShowFormatButtons] = useState(false);
  
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
    }
  };

  const handleFeedback = (type: "positive" | "negative") => {
    if (onFeedback && !feedbackGiven) {
      onFeedback(message.id, type);
      setFeedbackGiven(type);
    }
  };
  
  const countSources = () => {
    return message.sourceReferences?.length || 0;
  };
  
  const handleCodeBlockCopy = (codeContent: string, index: string) => {
    navigator.clipboard.writeText(codeContent);
    setIsCodeBlockCopied(prev => ({ ...prev, [index]: true }));
    
    setTimeout(() => {
      setIsCodeBlockCopied(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "w-full flex",
        message.role === "user" ? "flex-row-reverse" : "flex-row"
      )}
      id={message.id}
    >
      {/* Afficher l'avatar uniquement pour l'utilisateur */}
      {message.role === "user" && (
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary ml-3">
          {user?.displayName?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      
      <div className={cn(
        "bg-muted/40 backdrop-blur-sm p-4 rounded-lg",
        message.role === "user" ? "rounded-tr-none max-w-[75%]" : "rounded-tl-none max-w-[95%] w-full md:max-w-[90%]"
      )}>
        {/* Ajout des boutons de formatage pour l'assistant */}
        {message.role === "assistant" && showFormatButtons && (
          <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border/20">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Heading1 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Grand titre</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Heading2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Titre moyen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Petit titre</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <List className="h-4 w-4" />
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
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Liste numérotée</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                <ul {...props} className="list-disc pl-6 my-4 space-y-2" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal pl-6 my-4 space-y-2" />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="mb-1" />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote {...props} className="border-l-4 border-primary/30 pl-4 italic my-4" />
              ),
              code: ({ node, ...props }) => {
                if (!props.className) {
                  return (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />
                  );
                }
                
                const codeContent = String(props.children).replace(/\n$/, '');
                const language = props.className ? props.className.replace('language-', '') : '';
                const codeBlockId = `code-${message.id}-${language}-${codeContent.length}`;
                
                return (
                  <div className="relative mt-4 mb-4">
                    <div className="flex items-center justify-between px-4 py-1.5 bg-muted/80 border-b border-border/50 rounded-t-md">
                      <div className="text-xs font-medium text-muted-foreground">
                        {language || 'Code'}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleCodeBlockCopy(codeContent, codeBlockId)}
                      >
                        {isCodeBlockCopied[codeBlockId] ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <pre className="p-4 overflow-x-auto bg-muted/40 rounded-b-md text-sm font-mono">
                      <code>{codeContent}</code>
                    </pre>
                  </div>
                );
              },
              img: ({ node, ...props }) => (
                <img {...props} className="rounded-lg w-auto max-w-full h-auto object-cover my-4" alt={props.alt || "Image"} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4 border border-border rounded-lg">
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
          
          {/* Affichage des sources moderne directement dans le message */}
          {message.role === "assistant" && message.sourceReferences && message.sourceReferences.length > 0 && (
            <div className="mt-4 pt-2 border-t border-border/30">
              <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Sources</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-6 px-2 hover:bg-muted" 
                  onClick={() => setShowSourcesDialog(true)}
                >
                  Voir tout
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.sourceReferences.slice(0, 4).map(source => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline p-1.5 rounded-md hover:bg-primary/5 transition-colors duration-200"
                  >
                    <span className="w-5 h-5 flex items-center justify-center bg-primary/10 rounded text-xs text-primary font-medium">
                      {source.id}
                    </span>
                    <span className="truncate">{getSourceDisplayTitle(source)}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            
            {message.role === "assistant" && message.useAdvancedReasoning && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="px-1.5 gap-1 hover:bg-accent cursor-help">
                      <BrainCircuit className="h-3 w-3" />
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
                    <Badge variant="outline" className="px-1.5 gap-1 hover:bg-accent cursor-help">
                      <Lightbulb className="h-3 w-3" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Réflexion approfondie LuvviXThink</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {message.role === "assistant" && message.useWebSearch && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant={countSources() > 0 ? (hasRealSources ? "default" : "outline") : "destructive"}
                      className="px-1.5 gap-1 hover:bg-accent cursor-help"
                      onClick={() => countSources() > 0 && setShowSourcesDialog(true)}
                    >
                      {countSources() > 0 ? (
                        <>
                          <Globe className="h-3 w-3" />
                          <span>{countSources()}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          <span>0</span>
                        </>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {countSources() > 0 ? (
                      <p>Recherche web avec {countSources()} sources</p>
                    ) : (
                      <p>Recherche web activée mais aucune source trouvée. Vérifiez votre API key.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {message.role === "assistant" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowFormatButtons(!showFormatButtons)}
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Options de formatage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {message.role === "assistant" && isLast && onRegenerate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => onRegenerate(message.id)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Régénérer la réponse</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={handleCopy}
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCopied ? "Copié !" : "Copier"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {message.role === "assistant" && isLast && onFeedback && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          feedbackGiven === "positive"
                            ? "text-green-500"
                            : "text-muted-foreground hover:text-green-500"
                        )}
                        onClick={() => handleFeedback("positive")}
                        disabled={feedbackGiven !== null}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cette réponse était utile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          feedbackGiven === "negative"
                            ? "text-red-500"
                            : "text-muted-foreground hover:text-red-500"
                        )}
                        onClick={() => handleFeedback("negative")}
                        disabled={feedbackGiven !== null}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cette réponse n'était pas utile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={showSourcesDialog} onOpenChange={setShowSourcesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5" />
              Sources utilisées
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4">
              {message.sourceReferences?.map((source) => (
                <div key={source.id} className="border border-border/40 rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <h3 className="font-medium text-base mb-1 flex items-center gap-1.5">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full text-xs text-primary font-medium">
                      {source.id}
                    </span>
                    {getSourceDisplayTitle(source)}
                  </h3>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all mb-2 inline-flex items-center gap-1"
                  >
                    {source.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {source.snippet && (
                    <p className="text-sm text-muted-foreground mt-2 border-t border-border/30 pt-2">{source.snippet}</p>
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
