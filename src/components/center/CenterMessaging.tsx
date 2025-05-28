
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal,
  Send,
  Smile,
  Paperclip
} from 'lucide-react';

const CenterMessaging = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Alice Martin',
      username: 'alice_m',
      avatar: null,
      lastMessage: 'Salut ! Comment ça va ?',
      time: '14:30',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Groupe Dev LuvviX',
      username: 'dev-team',
      avatar: null,
      lastMessage: 'La nouvelle version est prête',
      time: '13:45',
      unread: 0,
      online: false,
      isGroup: true
    },
    {
      id: 3,
      name: 'Thomas Durand',
      username: 'tdurand',
      avatar: null,
      lastMessage: 'Parfait, on se voit demain',
      time: '12:20',
      unread: 0,
      online: false
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Alice Martin',
      content: 'Salut ! Comment ça va ?',
      time: '14:30',
      isMe: false
    },
    {
      id: 2,
      sender: 'Moi',
      content: 'Très bien ! Et toi ? Comment se passe ton projet ?',
      time: '14:32',
      isMe: true
    },
    {
      id: 3,
      sender: 'Alice Martin',
      content: 'Ça avance bien ! J\'aimerais te montrer ce que j\'ai fait avec LuvviX Center',
      time: '14:35',
      isMe: false
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Logic to send message would go here
      setMessageText('');
    }
  };

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une conversation..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {conversations.map((conv, index) => (
            <div
              key={conv.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedChat === index ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
              onClick={() => setSelectedChat(index)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.avatar || ''} />
                    <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{conv.name}</p>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                
                {conv.unread > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {conv.unread}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversations[selectedChat]?.avatar || ''} />
                <AvatarFallback>
                  {conversations[selectedChat]?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{conversations[selectedChat]?.name}</p>
                <p className="text-sm text-gray-500">
                  {conversations[selectedChat]?.online ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isMe
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isMe ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Tapez votre message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterMessaging;
