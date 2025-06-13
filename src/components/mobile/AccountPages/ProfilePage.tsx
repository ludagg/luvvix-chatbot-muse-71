
import React, { useState } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Calendar, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage = ({ onBack }: ProfilePageProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    username: user?.user_metadata?.username || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    bio: user?.user_metadata?.bio || '',
    website: user?.user_metadata?.website || ''
  });

  const handleSave = () => {
    // Sauvegarder les modifications
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Mon Profil</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Edit3 className="w-5 h-5 text-gray-600" />
        </button>
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
                <button className="absolute bottom-4 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
                  <p className="text-sm text-gray-500">Nom complet</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.fullName || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{profileData.email}</p>
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
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0"
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
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0"
                      placeholder="Votre ville"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.location || 'Non renseigné'}</p>
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
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="w-full bg-transparent border-0 p-0 text-gray-900 resize-none focus:ring-0"
                  placeholder="Parlez-nous de vous..."
                  rows={3}
                />
              ) : (
                <p className="text-gray-900">{profileData.bio || 'Aucune description disponible'}</p>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
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

          {/* Bouton sauvegarder */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Sauvegarder les modifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
