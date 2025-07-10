
import { supabase } from '@/integrations/supabase/client';

export interface UserContact {
  id: string;
  user_id: string;
  contact_user_id: string;
  contact_name?: string;
  is_blocked: boolean;
  is_favorite: boolean;
  added_at: string;
  updated_at: string;
  notes?: string;
  // Profile data from join
  contact_profile?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface ContactRequest {
  id: string;
  requester_id: string;
  requested_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
  // Profile data from join
  requester_profile?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  requested_profile?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export class ContactsService {
  // Rechercher un utilisateur par nom d'utilisateur
  static async searchUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, full_name, avatar_url')
      .ilike('username', `%${username}%`)
      .limit(10);

    if (error) throw error;
    return data;
  }

  // Obtenir un utilisateur par nom d'utilisateur exact
  static async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, full_name, avatar_url')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  }

  // Envoyer une demande de contact
  static async sendContactRequest(requestedUsername: string, message?: string) {
    // D'abord, trouver l'utilisateur par nom d'utilisateur
    const user = await this.getUserByUsername(requestedUsername);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const { data, error } = await supabase
      .from('contact_requests')
      .insert({
        requested_id: user.id,
        message: message || undefined
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Obtenir les demandes de contact reçues
  static async getReceivedContactRequests() {
    const { data, error } = await supabase
      .from('contact_requests')
      .select(`
        *,
        requester_profile:user_profiles!contact_requests_requester_id_fkey(
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ContactRequest[];
  }

  // Obtenir les demandes de contact envoyées
  static async getSentContactRequests() {
    const { data, error } = await supabase
      .from('contact_requests')
      .select(`
        *,
        requested_profile:user_profiles!contact_requests_requested_id_fkey(
          full_name,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ContactRequest[];
  }

  // Accepter une demande de contact
  static async acceptContactRequest(requestId: string) {
    // Mettre à jour le statut de la demande
    const { data: request, error: updateError } = await supabase
      .from('contact_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Ajouter les deux utilisateurs comme contacts mutuels
    const { error: insertError } = await supabase
      .from('user_contacts')
      .insert([
        {
          user_id: request.requested_id,
          contact_user_id: request.requester_id
        },
        {
          user_id: request.requester_id,
          contact_user_id: request.requested_id
        }
      ]);

    if (insertError) throw insertError;
    return request;
  }

  // Refuser une demande de contact
  static async rejectContactRequest(requestId: string) {
    const { data, error } = await supabase
      .from('contact_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Obtenir tous les contacts
  static async getContacts() {
    const { data, error } = await supabase
      .from('user_contacts')
      .select(`
        *,
        contact_profile:user_profiles!user_contacts_contact_user_id_fkey(
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_blocked', false)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data as UserContact[];
  }

  // Obtenir les contacts favoris
  static async getFavoriteContacts() {
    const { data, error } = await supabase
      .from('user_contacts')
      .select(`
        *,
        contact_profile:user_profiles!user_contacts_contact_user_id_fkey(
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_favorite', true)
      .eq('is_blocked', false)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data as UserContact[];
  }

  // Obtenir les contacts bloqués
  static async getBlockedContacts() {
    const { data, error } = await supabase
      .from('user_contacts')
      .select(`
        *,
        contact_profile:user_profiles!user_contacts_contact_user_id_fkey(
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_blocked', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as UserContact[];
  }

  // Rechercher dans les contacts
  static async searchContacts(query: string) {
    const { data, error } = await supabase
      .from('user_contacts')
      .select(`
        *,
        contact_profile:user_profiles!user_contacts_contact_user_id_fkey(
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_blocked', false)
      .or(`contact_name.ilike.%${query}%,contact_profile.username.ilike.%${query}%,contact_profile.full_name.ilike.%${query}%`)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data as UserContact[];
  }

  // Marquer un contact comme favori
  static async toggleFavorite(contactId: string, isFavorite: boolean) {
    const { data, error } = await supabase
      .from('user_contacts')
      .update({ is_favorite: isFavorite })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Bloquer/Débloquer un contact
  static async toggleBlock(contactId: string, isBlocked: boolean) {
    const { data, error } = await supabase
      .from('user_contacts')
      .update({ is_blocked: isBlocked })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mettre à jour le nom personnalisé d'un contact
  static async updateContactName(contactId: string, contactName: string) {
    const { data, error } = await supabase
      .from('user_contacts')
      .update({ contact_name: contactName })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mettre à jour les notes d'un contact
  static async updateContactNotes(contactId: string, notes: string) {
    const { data, error } = await supabase
      .from('user_contacts')
      .update({ notes })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Supprimer un contact
  static async deleteContact(contactId: string) {
    const { error } = await supabase
      .from('user_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
    return true;
  }

  // Vérifier si un utilisateur est déjà un contact
  static async isContact(userId: string) {
    const { data, error } = await supabase
      .from('user_contacts')
      .select('id')
      .eq('contact_user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  // Vérifier s'il existe déjà une demande de contact en attente
  static async hasPendingRequest(userId: string) {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('id')
      .eq('requested_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
}
