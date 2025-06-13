
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Edit, User, Mail, Phone, MapPin, Calendar, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage = ({ onBack }: ProfilePageProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    birth_date: '',
    bio: '',
    username: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setProfile({
        full_name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: user?.user_metadata?.phone_number || '',
        location: user?.user_metadata?.country || '',
        birth_date: user?.user_metadata?.birthdate || '',
        bio: user?.user_metadata?.bio || '',
        username: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
        avatar_url: user?.user_metadata?.avatar_url || ''
      });
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Mise à jour des métadonnées utilisateur
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone_number: profile.phone,
          country: profile.location,
          birthdate: profile.birth_date,
          bio: profile.bio,
          username: profile.username,
          avatar_url: profile.avatar_url
        }
      });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = () => {
    toast({
      title: "Bientôt disponible",
      description: "La modification d'avatar sera bientôt disponible",
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Profil utilisateur</h1>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {/* Photo de profil */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'
              )}
            </div>
            {isEditing && (
              <button
                onClick={handleAvatarChange}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-3">
            {profile.full_name || profile.username}
          </h2>
          <p className="text-gray-600">Membre LuvviX ID</p>
        </div>

        {/* Formulaire */}
        <div className="space-y-6">
          {/* Nom complet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nom complet
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
                placeholder="Votre nom complet"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-900">
                {profile.full_name || 'Non renseigné'}
              </div>
            )}
          </div>

          {/* Nom d'utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nom d'utilisateur
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
                placeholder="Votre nom d'utilisateur"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-900">
                @{profile.username || 'non-defini'}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Adresse email
            </label>
            <div className="px-4 py-3 bg-gray-100 rounded-2xl text-gray-600">
              {profile.email}
              <span className="text-xs block mt-1 text-gray-500">Non modifiable</span>
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Téléphone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
                placeholder="Votre numéro de téléphone"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-900">
                {profile.phone || 'Non renseigné'}
              </div>
            )}
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Localisation
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
                placeholder="Votre ville, pays"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-900">
                {profile.location || 'Non renseigné'}
              </div>
            )}
          </div>

          {/* Date de naissance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date de naissance
            </label>
            {isEditing ? (
              <input
                type="date"
                value={profile.birth_date}
                onChange={(e) => setProfile(prev => ({ ...prev, birth_date: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-900">
                {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('fr-FR') : 'Non renseigné'}
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              À propos
            </label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                placeholder="Parlez-nous de vous..."
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-900 min-h-[100px]">
                {profile.bio || 'Aucune description'}
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        {isEditing && (
          <div className="flex space-x-3 mt-8">
            <button
              onClick={() => {
                setIsEditing(false);
                loadProfile(); // Restaurer les données originales
              }}
              className="flex-1 py-3 text-gray-600 font-medium rounded-2xl hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white font-medium py-3 rounded-2xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        )}

        {/* Informations du compte */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Informations du compte</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Membre depuis</span>
              <span className="text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Inconnu'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dernière connexion</span>
              <span className="text-gray-900">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'Inconnu'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID utilisateur</span>
              <span className="text-gray-900 font-mono text-xs">
                {user?.id?.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
