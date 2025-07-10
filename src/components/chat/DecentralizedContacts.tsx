
import React, { useState } from 'react';
import { useGunChat } from '@/hooks/useGunChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MessageCircle, Users, Wifi } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const DecentralizedContacts = () => {
  const {
    contacts,
    createConversation,
    addContact,
    loading,
    currentUser
  } = useGunChat();

  const [newContactId, setNewContactId] = useState('');
  const [newContactName, setNewContactName] = useState('');

  const handleAddContact = async () => {
    if (!newContactId.trim() || !newContactName.trim()) return;

    await addContact(newContactId.trim(), newContactName.trim());
    setNewContactId('');
    setNewContactName('');
  };

  const handleStartConversation = async (contactId: string, contactName: string) => {
    const conversationId = await createConversation(contactId, `Chat avec ${contactName}`);
    if (conversationId) {
      // Optionnel: notification de succès
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Contacts P2P</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Wifi className="h-3 w-3 mr-1" />
            Décentralisé
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Votre ID utilisateur */}
        <div className="mb-6 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Votre ID décentralisé :</p>
          <div className="flex items-center space-x-2">
            <code className="text-xs bg-background px-2 py-1 rounded font-mono">
              {currentUser}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(currentUser)}
            >
              Copier
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Partagez cet ID pour que d'autres puissent vous ajouter
          </p>
        </div>

        {/* Ajouter un contact */}
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Input
              placeholder="ID du contact"
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value)}
              className="font-mono text-sm"
            />
            <Input
              placeholder="Nom du contact"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
            />
            <Button 
              onClick={handleAddContact} 
              className="w-full"
              disabled={!newContactId.trim() || !newContactName.trim()}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter au réseau P2P
            </Button>
          </div>
        </div>

        {/* Liste des contacts */}
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="relative mb-3">
                  <UserPlus className="h-12 w-12 mx-auto" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <p>Aucun contact P2P</p>
                <p className="text-sm">Ajoutez des contacts pour commencer à discuter</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {contact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {contact.id.substring(0, 20)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ajouté {formatDistanceToNow(new Date(contact.addedAt), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleStartConversation(contact.id, contact.name)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DecentralizedContacts;
