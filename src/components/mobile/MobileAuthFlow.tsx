
import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import AvatarUpload from '@/components/ui/avatar-upload';

interface MobileAuthFlowProps {
  onSuccess: () => void;
  onBack: () => void;
}

const MobileAuthFlow = ({ onSuccess, onBack }: MobileAuthFlowProps) => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const handleAvatarChange = (file: File | null, preview: string) => {
    setAvatarFile(file);
    setAvatarPreview(preview);
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      // Create a unique filename
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // For now, we'll return the preview URL
      // In a real implementation, you'd upload to Supabase Storage or another service
      return avatarPreview;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        // Upload avatar first if provided
        const avatarUrl = avatarFile ? avatarPreview : null;
        
        result = await signUp(email, password, fullName, avatarUrl);
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

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {isLogin ? 'Connexion' : 'Inscription'}
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
            : 'Créez votre accès à l\'écosystème LuvviX'
          }
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 px-6 space-y-4">
        {!isLogin && (
          <>
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3">Photo de profil (optionnel)</label>
              <AvatarUpload
                currentAvatar={avatarPreview}
                onAvatarChange={handleAvatarChange}
                size="lg"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
              />
            </div>
          </>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {!isLogin && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
            />
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-2xl mt-6 disabled:opacity-50 hover:shadow-lg transition-all text-base"
        >
          {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
        </button>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 font-medium"
          >
            {isLogin 
              ? 'Pas encore de compte ? S\'inscrire' 
              : 'Déjà un compte ? Se connecter'
            }
          </button>
        </div>
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

export default MobileAuthFlow;
