
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, ArrowLeft, Moon, Sun, Share2, Settings, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatToolbarProps {
  agentName?: string;
  agentAvatar?: string;
  agentObjective?: string;
  onBackClick?: () => void;
  accentColor?: string;
}

const ChatToolbar: React.FC<ChatToolbarProps> = ({
  agentName = 'Assistant IA',
  agentAvatar,
  agentObjective,
  onBackClick,
  accentColor = '#6366F1'
}) => {
  const { theme, setTheme } = useTheme();
  
  return (
    <TooltipProvider>
      <div className="flex items-center justify-between w-full px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          {onBackClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <Avatar className="h-10 w-10 border-2" style={{ borderColor: accentColor }}>
            <AvatarImage src={agentAvatar} />
            <AvatarFallback style={{ backgroundColor: accentColor }} className="text-white">
              {agentName.charAt(0) || <Bot size={20} />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <h3 className="font-medium text-gray-900 dark:text-white">{agentName}</h3>
            {agentObjective && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{agentObjective}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Bouton thème */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </TooltipContent>
          </Tooltip>
          
          {/* Bouton partage */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Partager</TooltipContent>
          </Tooltip>
          
          {/* Bouton info */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>À propos de cet assistant</TooltipContent>
          </Tooltip>
          
          {/* Bouton paramètres */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Paramètres</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatToolbar;
