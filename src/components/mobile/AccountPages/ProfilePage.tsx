
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage = ({ onBack }: ProfilePageProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    username: user?.user_metadata?.username || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    bio: user?.user_metadata?.bio || '',
    website: user?.user_metadata?.website || '',
    birthDate: user?.user_metadata?.birth_date || '',
    gender: user?.user_metadata?.gender || '',
    occupation: user?.user_metadata?.occupation || ''
  });

  const [originalData, setOriginalData] = useState(profileData);
  const [stats, setStats] = useState({
    servicesUsed: 0,
    translationsCount: 0,
    eventsCreated: 0,
    memberSince: '',
    score: 4.8
  });

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Récupérer les statistiques de l'utilisateur
      const [translationsResponse, eventsResponse] = await Promise.all([
        supabase.from('translations').select('id').eq('user_id', user.id),
        supabase.from('calendar_events').select('id').eq('user_id', user.id)
      ]);

      const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
      }) : 'Récemment';

      setStats({
        servicesUsed: 8, // Nombre fixe basé sur les services disponibles
        translationsCount: translationsResponse.data?.length || 0,
        eventsCreated: eventsResponse.data?.length || 0,
        memberSince,
        score: 4.8
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          username: profileData.username,
          phone: profileData.phone,
          location: profileData.location,
          bio: profileData.bio,
          website: profileData.website,
          birth_date: profileData.birthDate,
          gender: profileData.gender,
          occupation: profileData.occupation
        }
      });

      if (error) throw error;

      setOriginalData(profileData);
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    return profileData.fullName.trim() !== '' && profileData.email.trim() !== '';
  };

  const recentActivity = [
    {
      icon: "🤖",
      title: "Assistant IA utilisé",
      time: "Il y a 2h",
      description: "Génération de contenu"
    },
    {
      icon: "🌤️",
      title: "Météo consultée",
      time: "Il y a 4h",
      description: user?.user_metadata?.location || "Paris, France"
    },
    {
      icon: "📰",
      title: "Traduction effectuée",
      time: "Hier",
      description: `${stats.translationsCount} traductions`
    }
  ];

  const achievements = [
    {
      icon: "🏆",
      title: "Explorateur",
      description: "Premier service utilisé",
      unlocked: true
    },
    {
      icon: "🚀",
      title: "Power User",
      description: "10 services utilisés",
      unlocked: stats.servicesUsed >= 5
    },
    {
      icon: "⭐",
      title: "Expert LuvviX",
      description: "Tous les services maîtrisés",
      unlocked: stats.servicesUsed >= 10
    }
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Mon Profil</h1>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSave}
                disabled={!validateForm() || isSaving}
                className="p-2 hover:bg-green-100 rounded-full disabled:opacity-50"
              >
                <Save className="w-5 h-5 text-green-600" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Edit3 className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto">
        {/* Photo de profil */}
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 pt-12 pb-6">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              {isEditing && (
                <button className="absolute bottom-4 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{profileData.fullName || 'Utilisateur'}</h2>
            <p className="text-blue-100">@{profileData.username || 'username'}</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Événements créés</p>
                    <p className="text-sm text-gray-600">{stats.eventsCreated} événements</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.eventsCreated}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Traductions</p>
                    <p className="text-sm text-gray-600">{stats.translationsCount} textes traduits</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.translationsCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Membre depuis</p>
                    <p className="text-sm text-gray-600">{stats.memberSince}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.score}/5</p>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Nom complet *</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 focus:outline-none"
                      placeholder="Votre nom complet"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.fullName || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email *</p>
                  <p className="text-gray-900 font-medium">{profileData.email}</p>
                  {isEditing && (
                    <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié ici</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Téléphone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 focus:outline-none"
                      placeholder="Numéro de téléphone"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.phone || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Localisation</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 focus:outline-none"
                      placeholder="Votre ville"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.location || 'Non renseigné'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Succès</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${
                    !achievement.unlocked ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-gray-100'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton sauvegarder en bas */}
          {isEditing && (
            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 -mx-4">
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={!validateForm() || isSaving}
                  className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    'Sauvegarder'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
