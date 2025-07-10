
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Camera, 
  Sparkles,
  Languages,
  Zap,
  RotateCcw
} from 'lucide-react';
import { aiChatService } from '@/services/ai-chat-service';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isRecording?: boolean;
  placeholder?: string;
}

const ChatInput = ({ 
  onSend, 
  onStartRecording, 
  onStopRecording, 
  isRecording = false,
  placeholder = "Tapez votre message..."
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (message.trim()) {
      loadQuickReplies();
    } else {
      setQuickReplies([]);
    }
  }, [message]);

  const loadQuickReplies = async () => {
    try {
      const replies = await aiChatService.getQuickReplies(message);
      setQuickReplies(replies);
    } catch (error) {
      console.error('Error loading quick replies:', error);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      setShowAIFeatures(false);
      setQuickReplies([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const enhanceMessage = async (style: 'formal' | 'casual' | 'emoji' | 'correct') => {
    if (message.trim()) {
      try {
        const enhanced = await aiChatService.enhanceMessage(message, style);
        setMessage(enhanced);
      } catch (error) {
        console.error('Error enhancing message:', error);
      }
    }
  };

  const autoCorrect = async () => {
    if (message.trim()) {
      try {
        const corrected = await aiChatService.autoCorrect(message);
        setMessage(corrected);
      } catch (error) {
        console.error('Error correcting message:', error);
      }
    }
  };

  const selectQuickReply = (reply: string) => {
    setMessage(reply);
    setShowAIFeatures(false);
    setQuickReplies([]);
  };

  return (
    <div className="border-t bg-background">
      {/* Fonctionnalités IA */}
      {showAIFeatures && (
        <div className="p-3 border-b bg-muted/50">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Assistant IA</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => enhanceMessage('formal')}
              className="text-xs"
            >
              🎩 Formel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => enhanceMessage('casual')}
              className="text-xs"
            >
              😎 Décontracté
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => enhanceMessage('emoji')}
              className="text-xs"
            >
              😊 + Emojis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={autoCorrect}
              className="text-xs"
            >
              ✏️ Corriger
            </Button>
          </div>

          {quickReplies.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Suggestions :</span>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => selectQuickReply(reply)}
                    className="text-xs"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zone de saisie */}
      <div className="p-4">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <Camera className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIFeatures(!showAIFeatures)}
            className={showAIFeatures ? 'text-primary' : ''}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          
          {message.trim() ? (
            <Button onClick={handleSend} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onMouseDown={onStartRecording}
              onMouseUp={onStopRecording}
              onTouchStart={onStartRecording}
              onTouchEnd={onStopRecording}
              variant={isRecording ? "destructive" : "default"}
              size="sm"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
