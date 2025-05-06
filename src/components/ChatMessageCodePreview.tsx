
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Code } from "lucide-react";
import { CodeLivePreview } from "./CodeLivePreview";

interface ChatMessageCodePreviewProps {
  codeContent: string;
  language: string;
  codeBlockId: string;
}

export function ChatMessageCodePreview({ codeContent, language, codeBlockId }: ChatMessageCodePreviewProps) {
  const [isCodeBlockCopied, setIsCodeBlockCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCodeBlockCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setIsCodeBlockCopied(true);
    
    setTimeout(() => {
      setIsCodeBlockCopied(false);
    }, 2000);
  };

  // Determine if this code can be previewed
  const canPreview = language === "html" || 
                     language === "css" || 
                     language === "javascript" || 
                     language === "js";

  return (
    <div className="relative mt-3 mb-3 rounded-lg overflow-hidden">
      {canPreview && showPreview ? (
        <CodeLivePreview 
          code={codeContent} 
          language={language} 
          height="250px"
          title={`Aperçu ${language.toUpperCase()}`}
        />
      ) : (
        <>
          <div className="flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border/30">
            <div className="text-xs font-medium text-muted-foreground">
              {language || 'Code'}
            </div>
            <div className="flex gap-1">
              {canPreview && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPreview(true)}
                  className="h-6 px-2 rounded-full text-xs"
                >
                  <Code className="h-3 w-3 mr-1" />
                  Aperçu
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 w-6 rounded-full"
                onClick={handleCodeBlockCopy}
              >
                {isCodeBlockCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <pre className="p-3 overflow-x-auto bg-muted/40 text-sm font-mono">
            <code>{codeContent}</code>
          </pre>
        </>
      )}
    </div>
  );
}
