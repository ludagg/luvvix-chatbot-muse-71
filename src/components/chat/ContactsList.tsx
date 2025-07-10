
import React, { useState } from 'react';
import { useSimpleChat } from '@/hooks/useSimpleChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, MessageCircle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ContactsList = () => {
  const {
    contacts,
    createPrivateConversation,
    addContact,
    loading
  } = useSimpleChat();

  const [newContactId, setNewContactId] = useState('');

  const handleAddContact = async () => {
    if (!newContactId.trim()) return;

    await addContact(newContactId.trim());
    setNewContactId('');
  };

  const handleStartConversation = async (contactUserId: string) => {
    const conversationId = await createPrivateConversation(contactUserId);
    if (conversationId) {
      // Optionnel: rediriger vers la conversation créée
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
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Contacts</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Ajouter un contact */}
        <div className="space-y-4 mb-6">
          <div className="flex space-x-2">
            <Input
              placeholder="ID utilisateur du contact"
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddContact} size="sm">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Liste des contacts */}
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-3" />
                <p>Aucun contact</p>
                <p className="text-sm">Ajoutez des contacts pour commencer à discuter</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.user_profiles?.avatar_url} />
                        <AvatarFallback>
                          {contact.user_profiles?.full_name?.charAt(0) || 
                           contact.contact_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {contact.contact_name || 
                           contact.user_profiles?.full_name || 
                           contact.user_profiles?.username || 
                           'Utilisateur'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ajouté {formatDistanceToNow(new Date(contact.added_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartConversation(contact.contact_user_id)}
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

export default ContactsList;
