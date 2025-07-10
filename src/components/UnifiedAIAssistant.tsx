
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleChat from './chat/SimpleChat';
import ContactsList from './chat/ContactsList';
import { MessageCircle, Users } from 'lucide-react';

const UnifiedAIAssistant = () => {
  return (
    <div className="h-screen bg-background">
      <Tabs defaultValue="chat" className="h-full">
        <div className="border-b border-border p-4">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Contacts</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="h-[calc(100vh-80px)] m-0">
          <SimpleChat />
        </TabsContent>
        
        <TabsContent value="contacts" className="h-[calc(100vh-80px)] m-0 p-4">
          <ContactsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAIAssistant;
