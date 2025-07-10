
import React, { useState } from 'react';
import { useSecureChat } from '@/hooks/useSecureChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Plus, 
  Search, 
  MessageCircle,
  Shield,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const SecureContacts = () => {
  const {
    contacts,
    loading,
    createPrivateConversation,
    addContact
  } = useSecureChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactId, setNewContactId] = useState('');
  const [newContactName, setNewContactName] = useState('');

  const handleAddContact = async () => {
    if (!newContactId.trim()) return;
    
    await addContact(newContactId.trim(), newContactName.trim() || undefined);
    setNewContactId('');
    setNewContactName('');
    setShowAddContact(false);
  };

  const handleStartConversation = async (contactId: string) => {
    const conversationId = await createPrivateConversation(contactId);
    if (conversationId) {
      // Optionnel: naviguer vers la conversation créée
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.user_profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.user_profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Contacts Sécurisés</h1>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Chiffrés</span>
          </Badge>
        </div>
        <Button 
          onClick={() => setShowAddContact(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un contact
        </Button>
      </div>

      {/* Ajouter un contact */}
      {showAddContact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Ajouter un nouveau contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID Utilisateur *</label>
              <Input
                placeholder="UUID de l'utilisateur à ajouter"
                value={newContactId}
                onChange={(e) => setNewContactId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nom personnalisé (optionnel)</label>
              <Input
                placeholder="Nom d'affichage pour ce contact"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddContact} disabled={!newContactId.trim()}>
                Ajouter
              </Button>
              <Button variant="outline" onClick={() => setShowAddContact(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Liste des contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Contacts ({contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                {contacts.length === 0 ? 'Aucun contact' : 'Aucun résultat'}
              </h3>
              <p className="text-muted-foreground">
                {contacts.length === 0 
                  ? 'Ajoutez vos premiers contacts pour commencer à discuter en sécurité'
                  : 'Aucun contact ne correspond à votre recherche'
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact.user_profiles?.avatar_url || ''} />
                          <AvatarFallback>
                            {(contact.contact_name || contact.user_profiles?.full_name)?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">
                          {contact.contact_name || contact.user_profiles?.full_name || 'Contact'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          @{contact.user_profiles?.username || 'utilisateur'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ajouté {formatDistanceToNow(new Date(contact.added_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Chiffré
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleStartConversation(contact.contact_user_id)}
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Discuter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Informations de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Sécurité & Confidentialité</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800 dark:text-green-200">
                Chiffrement E2E
              </h4>
              <p className="text-green-600 dark:text-green-400">
                Tous vos messages sont chiffrés bout-à-bout
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                Contacts Sécurisés
              </h4>
              <p className="text-blue-600 dark:text-blue-400">
                Les informations de contact sont protégées
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                Relai Supabase
              </h4>
              <p className="text-purple-600 dark:text-purple-400">
                Supabase ne voit que des données chiffrées
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureContacts;
