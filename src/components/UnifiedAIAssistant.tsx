
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecureChat from './chat/SecureChat';
import SecureContacts from './chat/SecureContacts';
import { MessageCircle, Users, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UnifiedAIAssistant = () => {
  return (
    <div className="h-screen bg-background">
      <Tabs defaultValue="chat" className="h-full">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Messagerie Sécurisée</h1>
            </div>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span>Chiffrement E2E</span>
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
          <SecureChat />
        </TabsContent>
        
        <TabsContent value="contacts" className="h-[calc(100vh-120px)] m-0 p-0">
          <SecureContacts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAIAssistant;
