
import React, { useState } from 'react';
import { ArrowLeft, Plus, Phone, Mail, Search, Edit, Trash2, Star, UserPlus, UserX, Heart, HeartOff, User } from 'lucide-react';
import { useContacts } from '@/hooks/use-contacts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MobileContactsProps {
  onBack: () => void;
}

type ViewMode = 'contacts' | 'favorites' | 'blocked' | 'requests' | 'add' | 'search';

const MobileContacts = ({ onBack }: MobileContactsProps) => {
  const {
    contacts,
    favoriteContacts,
    blockedContacts,
    contactRequests,
    loading,
    searchUser,
    sendContactRequest,
    acceptContactRequest,
    rejectContactRequest,
    toggleFavorite,
    toggleBlock,
    deleteContact,
    searchContacts
  } = useContacts();

  const [viewMode, setViewMode] = useState<ViewMode>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [contactSearchResults, setContactSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  // Rechercher des utilisateurs pour ajouter
  const handleUserSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUser(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Rechercher dans les contacts existants
  const handleContactSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setContactSearchResults([]);
      return;
    }

    try {
      const results = await searchContacts(query);
      setContactSearchResults(results);
    } catch (error) {
      console.error('Erreur de recherche de contacts:', error);
    }
  };

  // Envoyer une demande de contact
  const handleSendRequest = async (username: string) => {
    const success = await sendContactRequest(username, requestMessage);
    if (success) {
      setNewContactUsername('');
      setRequestMessage('');
      setViewMode('contacts');
    }
  };

  const renderHeader = () => {
    const titles = {
      contacts: 'Contacts',
      favorites: 'Favoris',
      blocked: 'Bloqués',
      requests: 'Demandes',
      add: 'Ajouter Contact',
      search: 'Rechercher'
    };

    return (
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">{titles[viewMode]}</h1>
        </div>
        <div className="flex items-center space-x-2">
          {viewMode === 'contacts' && (
            <>
              <button 
                onClick={() => setViewMode('search')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('add')}
                className="p-2 bg-blue-500 text-white rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderNavigation = () => (
    <div className="flex overflow-x-auto bg-white border-b">
      {[
        { key: 'contacts', label: 'Contacts', icon: User, count: contacts.length },
        { key: 'favorites', label: 'Favoris', icon: Heart, count: favoriteContacts.length },
        { key: 'requests', label: 'Demandes', icon: UserPlus, count: contactRequests.length },
        { key: 'blocked', label: 'Bloqués', icon: UserX, count: blockedContacts.length }
      ].map(({ key, label, icon: Icon, count }) => (
        <button
          key={key}
          onClick={() => setViewMode(key as ViewMode)}
          className={`flex items-center space-x-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
            viewMode === key
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
          {count > 0 && (
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  const renderContactItem = (contact: any, showActions = true) => (
    <div key={contact.id} className="flex items-center p-4 border-b border-gray-100">
      <Avatar className="h-12 w-12 mr-3">
        <AvatarImage src={contact.contact_profile?.avatar_url} />
        <AvatarFallback>
          {contact.contact_profile?.full_name?.charAt(0) || contact.contact_profile?.username?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">
          {contact.contact_name || contact.contact_profile?.full_name || contact.contact_profile?.username}
        </h3>
        <p className="text-sm text-gray-600">@{contact.contact_profile?.username}</p>
        {contact.notes && (
          <p className="text-xs text-gray-500 mt-1">{contact.notes}</p>
        )}
      </div>
      
      {showActions && (
        <div className="flex space-x-2">
          <button
            onClick={() => toggleFavorite(contact.id, !contact.is_favorite)}
            className={`p-2 rounded-lg transition-colors ${
              contact.is_favorite 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {contact.is_favorite ? <Heart className="w-4 h-4 fill-current" /> : <HeartOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => toggleBlock(contact.id, !contact.is_blocked)}
            className={`p-2 rounded-lg transition-colors ${
              contact.is_blocked 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            }`}
          >
            <UserX className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => deleteContact(contact.id)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  const renderAddContact = () => (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom d'utilisateur
        </label>
        <Input
          type="text"
          value={newContactUsername}
          onChange={(e) => {
            setNewContactUsername(e.target.value);
            handleUserSearch(e.target.value);
          }}
          placeholder="@username"
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message (optionnel)
        </label>
        <Input
          type="text"
          value={requestMessage}
          onChange={(e) => setRequestMessage(e.target.value)}
          placeholder="Salut ! J'aimerais t'ajouter à mes contacts"
          className="w-full"
        />
      </div>

      {isSearching && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Utilisateurs trouvés :</h3>
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.full_name || user.username}</p>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendRequest(user.username)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Ajouter
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSearchContacts = () => (
    <div className="p-4">
      <div className="mb-4">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => handleContactSearch(e.target.value)}
          placeholder="Rechercher dans vos contacts..."
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        {contactSearchResults.length > 0 ? (
          contactSearchResults.map((contact) => renderContactItem(contact))
        ) : searchQuery ? (
          <p className="text-center text-gray-500 py-8">Aucun contact trouvé</p>
        ) : (
          <p className="text-center text-gray-500 py-8">Tapez pour rechercher</p>
        )}
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-4 p-4">
      {contactRequests.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Aucune demande en attente</p>
      ) : (
        contactRequests.map((request) => (
          <div key={request.id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.requester_profile?.avatar_url} />
                <AvatarFallback>
                  {request.requester_profile?.full_name?.charAt(0) || request.requester_profile?.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {request.requester_profile?.full_name || request.requester_profile?.username}
                </h3>
                <p className="text-sm text-gray-600">@{request.requester_profile?.username}</p>
              </div>
            </div>
            
            {request.message && (
              <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
                "{request.message}"
              </p>
            )}
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => acceptContactRequest(request.id)}
                className="bg-green-500 hover:bg-green-600 flex-1"
              >
                Accepter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectContactRequest(request.id)}
                className="flex-1"
              >
                Refuser
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderContactsList = (contactsList: any[], emptyMessage: string) => (
    <div className="flex-1 overflow-y-auto">
      {contactsList.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contact</h3>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        contactsList.map((contact) => renderContactItem(contact))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p>Chargement des contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {renderHeader()}
      
      {(viewMode === 'contacts' || viewMode === 'favorites' || viewMode === 'blocked') && renderNavigation()}

      <div className="flex-1 overflow-hidden">
        {viewMode === 'add' && renderAddContact()}
        {viewMode === 'search' && renderSearchContacts()}
        {viewMode === 'requests' && renderRequests()}
        {viewMode === 'contacts' && renderContactsList(contacts, "Commencez par ajouter votre premier contact")}
        {viewMode === 'favorites' && renderContactsList(favoriteContacts, "Marquez vos contacts préférés comme favoris")}
        {viewMode === 'blocked' && renderContactsList(blockedContacts, "Aucun contact bloqué")}
      </div>
    </div>
  );
};

export default MobileContacts;
