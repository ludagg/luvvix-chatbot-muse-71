import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Camera, Globe, Calendar, Users, Upload, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface MobileAuthFlowProps {
  onSuccess: () => void;
  onBack: () => void;
}

const COUNTRIES = [
  'France', 'Canada', 'Belgique', 'Suisse', 'Maroc', 'Tunisie', 
  'Algérie', 'Sénégal', 'Côte d\'Ivoire', 'Cameroun', 'Madagascar'
];

const GENDERS = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
  { value: 'non_specifie', label: 'Préfère ne pas préciser' }
];

const EnhancedMobileAuthFlow = ({ onSuccess, onBack }: MobileAuthFlowProps) => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    bio: '',
    age: '',
    gender: '',
    country: '',
    avatarFile: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatarFile: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && (!formData.fullName || !formData.age || !formData.gender || !formData.country)) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        const userMetadata = {
          full_name: formData.fullName,
          bio: formData.bio,
          age: formData.age,
          gender: formData.gender,
          country: formData.country,
          avatar_url: '' // À implémenter avec l'upload d'image
        };
        result = await signUp(formData.email, formData.password, userMetadata);
      }

      if (result && !result.error) {
        toast({
          title: "Succès",
          description: isLogin ? "Connexion réussie !" : "Inscription réussie !",
        });
        onSuccess();
      } else {
        throw new Error(result?.error?.message || "Erreur d'authentification");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur d'authentification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDropboxConnect = () => {
    const clientId = 'n996hgcg16xp1pu';
    const redirectUri = `${window.location.origin}/auth/dropbox/callback`;
    const scope = 'files.content.write files.content.read files.metadata.read';
    
    const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}`;
    
    toast({
      title: "Connexion Dropbox",
      description: "Redirection vers Dropbox...",
    });
    
    window.location.href = authUrl;
  };

  const renderSignupStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.email || !formData.password || !formData.confirmPassword}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-2xl mt-6 disabled:opacity-50 hover:shadow-lg transition-all text-base"
            >
              Continuer
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Photo de profil */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="mobile-avatar-upload"
              />
              <button
                type="button"
                onClick={() => document.getElementById('mobile-avatar-upload')?.click()}
                className="text-blue-600 text-sm font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Ajouter une photo
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nom complet *"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              />
            </div>

            <textarea
              placeholder="Bio (optionnel)"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base resize-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Âge *"
                min="13"
                max="120"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              />
              
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              >
                <option value="">Sexe *</option>
                {GENDERS.map(gender => (
                  <option key={gender.value} value={gender.value}>
                    {gender.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
            >
              <option value="">Sélectionner votre pays *</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl transition-all text-base"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-2xl transition-all text-base"
              >
                Continuer
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="p-6 bg-blue-50 rounded-3xl mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white">
                    <path fill="currentColor" d="M7.71,3.5L1.15,8L7.71,12.5L12.39,8L7.71,3.5M21.15,8L14.59,3.5L9.91,8L14.59,12.5L21.15,8M14.59,14.5L21.15,19L12.39,19L7.71,14.5L14.59,14.5M7.71,14.5L1.15,19L9.91,19L14.59,14.5L7.71,14.5Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connecter Dropbox</h3>
                  <p className="text-sm text-gray-600">Stockage cloud sécurisé</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                Pour utiliser LuvviX Cloud, connectez votre Dropbox et gérez vos fichiers en toute sécurité.
              </p>
              
              <button
                onClick={handleDropboxConnect}
                className="w-full bg-white border border-blue-200 text-blue-600 font-medium py-3 rounded-xl mb-3 flex items-center justify-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Connecter Dropbox
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Vous pourrez aussi connecter Dropbox plus tard dans les paramètres
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl transition-all text-base"
              >
                Retour
              </button>
              <button
                onClick={handleAuth}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-2xl transition-all text-base disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer le compte'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {isLogin ? 'Connexion' : `Inscription ${!isLogin ? `(${step}/3)` : ''}`}
        </h1>
        <div className="w-10" />
      </div>

      {/* Logo et titre */}
      <div className="flex flex-col items-center px-8 mt-8 mb-8">
        <div className="w-24 h-24 mb-6">
          <img 
            src="/lovable-uploads/4e135247-8f83-4117-8247-edc3de222f86.png" 
            alt="LuvviX Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">LuvviX ID</h2>
        <p className="text-gray-600 text-center">
          {isLogin 
            ? 'Connectez-vous à votre écosystème intelligent' 
            : step === 1 ? 'Créez votre accès à l\'écosystème LuvviX'
            : step === 2 ? 'Complétez votre profil'
            : 'Connectez votre stockage cloud'
          }
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 px-6">
        {isLogin ? (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-2xl mt-6 disabled:opacity-50 hover:shadow-lg transition-all text-base"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        ) : (
          renderSignupStep()
        )}

        {!isLogin && (
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(true)}
              className="text-blue-500 font-medium"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-500">
          En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
        </p>
      </div>
    </div>
  );
};

export default EnhancedMobileAuthFlow;
