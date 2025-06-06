
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn, UserPlus, Mail, Lock, User, Phone, MapPin, Calendar, Fingerprint } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from '@/hooks/use-toast';
import { useBiometrics } from '@/hooks/use-biometrics';

interface AuthenticationProps {
  returnTo?: string | null;
  addingAccount?: boolean;
}

const Authentication = ({ returnTo, addingAccount = false }: AuthenticationProps) => {
  const { signUp, signIn, session } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { 
    isAvailable: biometricsAvailable, 
    authenticateWithBiometrics,
    enrollBiometrics,
    isLoading: biometricsLoading
  } = useBiometrics({
    onSuccess: () => {
      toast({
        title: "Authentification biométrique réussie",
        description: "Vous êtes maintenant connecté"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification biométrique",
        description: error.message
      });
    }
  });
  
  const [enableBiometrics, setEnableBiometrics] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    age: '',
    gender: '',
    nationality: '',
    acceptTerms: false,
    acceptMarketing: false
  });
  
  // CAPTCHA simple
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  // Générer une question mathématique simple pour CAPTCHA
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    if (operation === '+') {
      setCaptchaQuestion(`Combien font ${num1} + ${num2} ?`);
      setCaptchaAnswer(String(num1 + num2));
    } else {
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      setCaptchaQuestion(`Combien font ${larger} - ${smaller} ?`);
      setCaptchaAnswer(String(larger - smaller));
    }
  };
  
  useEffect(() => {
    generateCaptcha();
  }, []);
  
  const verifyCaptcha = () => {
    if (userCaptchaAnswer === captchaAnswer) {
      setCaptchaVerified(true);
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "Vérification échouée",
        description: "La réponse au CAPTCHA est incorrecte.",
      });
      generateCaptcha();
      setUserCaptchaAnswer('');
      setCaptchaVerified(false);
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }
    
    if (!formData.acceptTerms) {
      toast({
        variant: "destructive",
        title: "Conditions non acceptées",
        description: "Vous devez accepter les conditions d'utilisation pour continuer.",
      });
      return;
    }
    
    if (!verifyCaptcha()) {
      return;
    }
    
    setIsLoading(true);
    
    const userMetadata = {
      full_name: formData.fullName,
      username: formData.username,
      age: formData.age,
      gender: formData.gender,
      nationality: formData.nationality,
      use_biometrics: enableBiometrics,
      accept_marketing: formData.acceptMarketing
    };
    
    try {
      const success = await signUp(formData.email, formData.password, userMetadata);
      
      if (success) {
        // Si les biométriques sont activées, s'inscrire après la création du compte
        if (enableBiometrics && biometricsAvailable && session?.access_token) {
          toast({
            title: "Configuration de l'authentification biométrique",
            description: "Veuillez configurer votre authentification biométrique maintenant.",
          });
          
          // Attendre un moment pour que la session soit établie
          setTimeout(async () => {
            try {
              const enrolled = await enrollBiometrics(session.user.id, session.access_token);
              if (enrolled) {
                toast({
                  title: "Authentivix activé",
                  description: "Vous pouvez maintenant vous connecter avec votre biométrie.",
                });
              }
            } catch (error) {
              console.error("Erreur lors de l'inscription biométrique:", error);
            }
          }, 2000);
        }
        
        if (returnTo) {
          navigate(returnTo);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await signIn(formData.email, formData.password);
      setIsLoading(false);
      if (success) {
        if (returnTo) {
          navigate(returnTo);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setBiometricLoading(true);
    try {
      const session = await authenticateWithBiometrics(formData.email || undefined);
      
      if (session) {
        toast({
          title: "Connexion réussie",
          description: "Authentification biométrique effectuée avec succès"
        });
        
        setTimeout(() => {
          if (returnTo) {
            navigate(returnTo);
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur d\'authentification biométrique:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "La vérification biométrique a échoué"
      });
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const renderSignupStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="votre@email.com" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <p className="text-xs text-gray-500">Minimum 8 caractères avec lettres et chiffres</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>
            
            <Button 
              type="button" 
              className="w-full bg-purple-600 hover:bg-purple-700" 
              onClick={() => setStep(2)}
              disabled={!formData.email || !formData.password || !formData.confirmPassword}
            >
              Continuer
            </Button>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Votre nom complet" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="nom_utilisateur" 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Âge *</Label>
                <Input 
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="25" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Sexe *</Label>
                <Select onValueChange={(value) => handleSelectChange('gender', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homme">Homme</SelectItem>
                    <SelectItem value="femme">Femme</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                    <SelectItem value="non_specifie">Préfère ne pas préciser</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationalité *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Select onValueChange={(value) => handleSelectChange('nationality', value)} required>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Sélectionner votre nationalité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="française">Française</SelectItem>
                    <SelectItem value="canadienne">Canadienne</SelectItem>
                    <SelectItem value="belge">Belge</SelectItem>
                    <SelectItem value="suisse">Suisse</SelectItem>
                    <SelectItem value="marocaine">Marocaine</SelectItem>
                    <SelectItem value="tunisienne">Tunisienne</SelectItem>
                    <SelectItem value="algérienne">Algérienne</SelectItem>
                    <SelectItem value="sénégalaise">Sénégalaise</SelectItem>
                    <SelectItem value="ivoirienne">Ivoirienne</SelectItem>
                    <SelectItem value="camerounaise">Camerounaise</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
              >
                Retour
              </Button>
              
              <Button 
                type="button" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setStep(3)}
                disabled={!formData.fullName || !formData.username || !formData.age || !formData.gender || !formData.nationality}
              >
                Continuer
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center space-x-3 mb-3">
                <Fingerprint className="h-6 w-6 text-purple-600" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Authentivix - Sécurité biométrique</h3>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="enableBiometrics"
                  checked={enableBiometrics}
                  onCheckedChange={(checked) => setEnableBiometrics(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="enableBiometrics"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Activer l'authentification biométrique
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Utilisez votre empreinte digitale ou reconnaissance faciale pour vous connecter rapidement et en toute sécurité.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-yellow-50 border-yellow-200">
              <h3 className="font-medium mb-3 text-yellow-800">🤖 Vérification anti-robot</h3>
              <p className="text-sm mb-3 text-yellow-700">{captchaQuestion}</p>
              <Input 
                type="number" 
                value={userCaptchaAnswer}
                onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                placeholder="Votre réponse" 
                className="mb-2"
                required
              />
              {captchaVerified && (
                <p className="text-xs text-green-600">✅ Vérification réussie</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleCheckboxChange('acceptTerms', checked as boolean)}
                  required
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    J'accepte les conditions d'utilisation *
                  </label>
                  <p className="text-xs text-gray-500">
                    En cochant cette case, vous acceptez nos{" "}
                    <a href="/terms" className="text-purple-600 hover:underline">Conditions d'utilisation</a> et notre{" "}
                    <a href="/privacy" className="text-purple-600 hover:underline">Politique de confidentialité</a>.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptMarketing"
                  checked={formData.acceptMarketing}
                  onCheckedChange={(checked) => handleCheckboxChange('acceptMarketing', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="acceptMarketing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Je souhaite recevoir les actualités et offres
                  </label>
                  <p className="text-xs text-gray-500">
                    Vous pouvez vous désabonner à tout moment depuis les paramètres de votre compte.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(2)}
              >
                Retour
              </Button>
              
              <Button 
                type="submit" 
                className="w-1/2 bg-purple-600 hover:bg-purple-700"
                disabled={isLoading || !formData.acceptTerms || !userCaptchaAnswer}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer un compte
                  </>
                )}
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit">
            <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">LuvviX ID</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Un compte pour tout l'écosystème technologique
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="signup" className="text-gray-700 dark:text-gray-300">Créer un compte</TabsTrigger>
              <TabsTrigger value="login" className="text-gray-700 dark:text-gray-300">Connexion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {renderSignupStep()}
              </form>
            </TabsContent>
            
            <TabsContent value="login">
              {/* Bouton Authentivix toujours disponible */}
              <div className="mb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:hover:bg-purple-900/20"
                  onClick={handleBiometricAuth}
                  disabled={biometricLoading}
                >
                  {biometricLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Fingerprint className="mr-2 h-4 w-4 text-purple-600" />
                  )}
                  Se connecter avec Authentivix
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="votre@email.com" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <a href="#" className="text-xs text-purple-600 hover:underline">
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
          En vous connectant, vous acceptez nos{" "}
          <a href="/terms" className="text-purple-600 hover:underline">conditions d'utilisation</a> et notre{" "}
          <a href="/privacy" className="text-purple-600 hover:underline">politique de confidentialité</a>
        </p>
      </div>
    </div>
  );
};

export default Authentication;
