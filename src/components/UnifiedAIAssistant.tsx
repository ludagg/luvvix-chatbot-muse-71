
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DecentralizedChat from './chat/DecentralizedChat';
import DecentralizedContacts from './chat/DecentralizedContacts';
import { MessageCircle, Users, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UnifiedAIAssistant = () => {
  return (
    <div className="h-screen bg-background">
      <Tabs defaultValue="chat" className="h-full">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Chat Décentralisé</h1>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Wifi className="h-3 w-3 text-green-500" />
              <span>P2P Network</span>
            </Badge>
          </div>
          
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Contacts</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="h-[calc(100vh-120px)] m-0">
          <DecentralizedChat />
        </TabsContent>
        
        <TabsContent value="contacts" className="h-[calc(100vh-120px)] m-0 p-4">
          <DecentralizedContacts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAIAssistant;
