
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

const QuickReplies = ({ replies, onSelect }: QuickRepliesProps) => {
  if (replies.length === 0) return null;

  return (
    <div className="p-3 border-t bg-muted/50">
      <p className="text-xs text-muted-foreground mb-2">Réponses rapides :</p>
      <ScrollArea className="w-full">
        <div className="flex space-x-2 pb-2">
          {replies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={() => onSelect(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QuickReplies;
