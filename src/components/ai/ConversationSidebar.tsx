
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Calendar,
  Clock
} from 'lucide-react';
import { Conversation } from '@/hooks/use-persistent-conversations';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  loading: boolean;
}

const ConversationSidebar = ({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  loading
}: ConversationSidebarProps) => {

  const formatConversationDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: fr });
    } else if (isYesterday(date)) {
      return 'Hier';
    } else if (date > subDays(new Date(), 7)) {
      return format(date, 'EEEE', { locale: fr });
    } else {
      return format(date, 'dd/MM/yyyy', { locale: fr });
    }
  };

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const groups: { [key: string]: Conversation[] } = {
      "Aujourd'hui": [],
      "Hier": [],
      "Cette semaine": [],
      "Plus ancien": []
    };

    conversations.forEach(conv => {
      if (isToday(conv.updatedAt)) {
        groups["Aujourd'hui"].push(conv);
      } else if (isYesterday(conv.updatedAt)) {
        groups["Hier"].push(conv);
      } else if (conv.updatedAt > subDays(new Date(), 7)) {
        groups["Cette semaine"].push(conv);
      } else {
        groups["Plus ancien"].push(conv);
      }
    });

    return groups;
  };

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Nouvelle conversation
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            Object.entries(groupedConversations).map(([group, convs]) => (
              convs.length > 0 && (
                <div key={group} className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {group}
                  </div>
                  <div className="space-y-1">
                    {convs.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          currentConversation?.id === conversation.id
                            ? 'bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => onSelectConversation(conversation.id)}
                      >
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {conversation.title}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatConversationDate(conversation.updatedAt)}
                            <span className="mx-1">•</span>
                            <span>{conversation.messages.length} messages</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} sauvegardée{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default ConversationSidebar;
