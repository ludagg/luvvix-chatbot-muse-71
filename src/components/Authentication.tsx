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
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
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
    phoneNumber: '',
    country: '',
    birthdate: '',
    gender: '',
    acceptTerms: false,
    acceptMarketing: false
  });
  
  // Simplified captcha logic for demo
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState('');
  
  // Generate a simple math question for captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptchaQuestion(`Combien font ${num1} + ${num2} ?`);
    setCaptchaAnswer(String(num1 + num2));
  };
  
  useEffect(() => {
    generateCaptcha();
    console.log("Authentication component loaded");
    console.log("Biometrics available:", biometricsAvailable);
    console.log("Biometrics loading:", biometricsLoading);
  }, [biometricsAvailable, biometricsLoading]);
  
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
      phone_number: formData.phoneNumber,
      country: formData.country,
      birthdate: formData.birthdate,
      gender: formData.gender,
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
    console.log("Attempting biometric authentication...");
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
              <Label htmlFor="password">Mot de passe</Label>
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
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
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
              className="w-full" 
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
              <Label htmlFor="fullName">Nom complet</Label>
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
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Votre nom d'utilisateur" 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="+33600000000" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthdate">Date de naissance</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Select onValueChange={(value) => handleSelectChange('country', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="france">France</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="belgique">Belgique</SelectItem>
                      <SelectItem value="suisse">Suisse</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Genre</Label>
                <Select onValueChange={(value) => handleSelectChange('gender', value)}>
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
                onClick={() => setStep(3)}
                disabled={!formData.fullName || !formData.username}
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
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Vérification - Je ne suis pas un robot</h3>
              <p className="text-sm mb-2">{captchaQuestion}</p>
              <Input 
                type="text" 
                value={userCaptchaAnswer}
                onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                placeholder="Votre réponse" 
                className="mb-2"
              />
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
                    J'accepte les conditions d'utilisation
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
                disabled={isLoading || !formData.acceptTerms}
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
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">LuvviX ID</h2>
            <p className="text-gray-600 mt-2">
              Un compte pour tout l'écosystème technologique
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signup" className="text-gray-700">Créer un compte</TabsTrigger>
              <TabsTrigger value="login" className="text-gray-700">Connexion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {renderSignupStep()}
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="login">
              <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Bouton Authentivix toujours disponible */}
                <div className="mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
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
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">ou</span>
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Authentication;
