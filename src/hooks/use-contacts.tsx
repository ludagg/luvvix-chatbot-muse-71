
import { useState, useEffect } from 'react';
import { ContactsService, UserContact, ContactRequest } from '@/services/contacts-service';
import { toast } from 'sonner';

export const useContacts = () => {
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [favoriteContacts, setFavoriteContacts] = useState<UserContact[]>([]);
  const [blockedContacts, setBlockedContacts] = useState<UserContact[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger tous les contacts
  const loadContacts = async () => {
    try {
      setLoading(true);
      const [allContacts, favorites, blocked, received, sent] = await Promise.all([
        ContactsService.getContacts(),
        ContactsService.getFavoriteContacts(),
        ContactsService.getBlockedContacts(),
        ContactsService.getReceivedContactRequests(),
        ContactsService.getSentContactRequests()
      ]);

      setContacts(allContacts);
      setFavoriteContacts(favorites);
      setBlockedContacts(blocked);
      setContactRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  // Rechercher un utilisateur
  const searchUser = async (username: string) => {
    try {
      const users = await ContactsService.searchUserByUsername(username);
      return users;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche');
      return [];
    }
  };

  // Envoyer une demande de contact
  const sendContactRequest = async (username: string, message?: string) => {
    try {
      // Vérifier d'abord si l'utilisateur existe et n'est pas déjà un contact
      const user = await ContactsService.getUserByUsername(username);
      if (!user) {
        toast.error('Utilisateur non trouvé');
        return false;
      }

      const [isContact, hasPending] = await Promise.all([
        ContactsService.isContact(user.id),
        ContactsService.hasPendingRequest(user.id)
      ]);

      if (isContact) {
        toast.error('Cet utilisateur est déjà dans vos contacts');
        return false;
      }

      if (hasPending) {
        toast.error('Une demande de contact est déjà en attente pour cet utilisateur');
        return false;
      }

      await ContactsService.sendContactRequest(username, message);
      toast.success('Demande de contact envoyée');
      loadContacts(); // Recharger pour mettre à jour les demandes envoyées
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
      return false;
    }
  };

  // Accepter une demande de contact
  const acceptContactRequest = async (requestId: string) => {
    try {
      await ContactsService.acceptContactRequest(requestId);
      toast.success('Contact ajouté avec succès');
      loadContacts();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      toast.error('Erreur lors de l\'acceptation de la demande');
    }
  };

  // Refuser une demande de contact
  const rejectContactRequest = async (requestId: string) => {
    try {
      await ContactsService.rejectContactRequest(requestId);
      toast.success('Demande refusée');
      loadContacts();
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      toast.error('Erreur lors du refus de la demande');
    }
  };

  // Basculer favori
  const toggleFavorite = async (contactId: string, isFavorite: boolean) => {
    try {
      await ContactsService.toggleFavorite(contactId, isFavorite);
      toast.success(isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
      loadContacts();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Basculer blocage
  const toggleBlock = async (contactId: string, isBlocked: boolean) => {
    try {
      await ContactsService.toggleBlock(contactId, isBlocked);
      toast.success(isBlocked ? 'Contact bloqué' : 'Contact débloqué');
      loadContacts();
    } catch (error) {
      console.error('Erreur lors du blocage:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Mettre à jour le nom du contact
  const updateContactName = async (contactId: string, name: string) => {
    try {
      await ContactsService.updateContactName(contactId, name);
      toast.success('Nom mis à jour');
      loadContacts();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Supprimer un contact
  const deleteContact = async (contactId: string) => {
    try {
      await ContactsService.deleteContact(contactId);
      toast.success('Contact supprimé');
      loadContacts();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Rechercher dans les contacts
  const searchContacts = async (query: string) => {
    try {
      const results = await ContactsService.searchContacts(query);
      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return {
    contacts,
    favoriteContacts,
    blockedContacts,
    contactRequests,
    sentRequests,
    loading,
    searchUser,
    sendContactRequest,
    acceptContactRequest,
    rejectContactRequest,
    toggleFavorite,
    toggleBlock,
    updateContactName,
    deleteContact,
    searchContacts,
    loadContacts
  };
};
