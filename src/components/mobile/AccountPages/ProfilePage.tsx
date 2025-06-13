
import React, { useState } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simuler une sauvegarde réelle avec l'API Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ici, on ferait un appel à l'API pour mettre à jour les métadonnées utilisateur
      // await supabase.auth.updateUser({
      //   data: {
      //     full_name: profileData.fullName,
      //     username: profileData.username,
      //     phone: profileData.phone,
      //     location: profileData.location,
      //     bio: profileData.bio,
      //     website: profileData.website,
      //     birth_date: profileData.birthDate,
      //     gender: profileData.gender,
      //     occupation: profileData.occupation
      //   }
      // });
      
      setOriginalData(profileData);
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    } catch (error) {
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

        {/* Informations */}
        <div className="p-4 space-y-6">
          {/* Informations personnelles */}
          <div>
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

              {/* Informations supplémentaires */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 focus:outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profileData.birthDate ? new Date(profileData.birthDate).toLocaleDateString() : 'Non renseigné'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Genre</p>
                  {isEditing ? (
                    <select
                      value={profileData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 focus:outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                      <option value="autre">Autre</option>
                      <option value="non-specifie">Préfère ne pas dire</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.gender || 'Non renseigné'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos</h3>
            <div className="p-3 bg-gray-50 rounded-xl">
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-gray-900 resize-none focus:ring-0 focus:outline-none"
                  placeholder="Parlez-nous de vous..."
                  rows={4}
                  maxLength={500}
                />
              ) : (
                <p className="text-gray-900">{profileData.bio || 'Aucune description disponible'}</p>
              )}
              {isEditing && (
                <p className="text-xs text-gray-400 mt-2">{profileData.bio.length}/500 caractères</p>
              )}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Profession</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 focus:outline-none"
                      placeholder="Votre profession"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.occupation || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Globe className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Site web</p>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 focus:outline-none"
                      placeholder="https://votre-site.com"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.website || 'Non renseigné'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques d'utilisation</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">42</p>
                <p className="text-sm text-blue-700">Services utilisés</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">156</p>
                <p className="text-sm text-green-700">Heures économisées</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">9.2</p>
                <p className="text-sm text-purple-700">Score productivité</p>
              </div>
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
