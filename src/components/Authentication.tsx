
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn, UserPlus, Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react';
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
  const { signUp, signIn, signInWithBiometrics } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [step, setStep] = useState(1); // For multi-step signup process
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const { 
    isAvailable: biometricsAvailable, 
    authenticateWithBiometrics,
    enrollBiometrics,
    isLoading: biometricsLoading
  } = useBiometrics({
    onSuccess: () => {
      toast({
        title: "Biometric authentication successful",
        description: "You are now logged in"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Biometric authentication failed",
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
    setCaptchaQuestion(`What is ${num1} + ${num2}?`);
    setCaptchaAnswer(String(num1 + num2));
  };
  
  useState(() => {
    generateCaptcha();
  });
  
  const verifyCaptcha = () => {
    if (userCaptchaAnswer === captchaAnswer) {
      setCaptchaVerified(true);
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "The CAPTCHA response is incorrect.",
      });
      generateCaptcha(); // Generate a new question
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validations
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Passwords do not match.",
      });
      return;
    }
    
    if (!formData.acceptTerms) {
      toast({
        variant: "destructive",
        title: "Terms not accepted",
        description: "You must accept the terms of use to continue.",
      });
      return;
    }
    
    if (!verifyCaptcha()) {
      return;
    }
    
    setIsLoading(true);
    
    // Prepare enriched user metadata
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
        // If biometrics are enabled, enroll after successful signup
        if (enableBiometrics && biometricsAvailable) {
          // We need to get the user ID - for the demo we'll simulate it
          const simulatedUserId = btoa(formData.email); // In real app, get from auth
          
          // Trigger fingerprint enrollment
          await enrollBiometrics(simulatedUserId);
        }
        
        if (returnTo) {
          navigate(returnTo);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);
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
      console.error("Error during sign in:", error);
      setIsLoading(false);
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
  
  // Handle multi-step signup
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
            {/* Option d'authentification biométrique */}
            {biometricsAvailable && (
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h3 className="font-medium mb-2">Authentivix - Sécurité biométrique</h3>
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
                    <p className="text-xs text-gray-500">
                      Permet de vous connecter avec votre empreinte digitale ou reconnaissance faciale
                      lorsque cette option est disponible sur votre appareil.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* CAPTCHA */}
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
            
            {/* Termes et conditions */}
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
                    <a href="/terms" className="text-luvvix-purple hover:underline">Conditions d'utilisation</a> et notre{" "}
                    <a href="/privacy" className="text-luvvix-purple hover:underline">Politique de confidentialité</a>.
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
                className="w-1/2"
                variant="luvvix" 
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

  const handleBiometricAuth = async () => {
    if (!biometricsAvailable) {
      toast({
        variant: "destructive",
        title: "Biometric authentication not available",
        description: "Your device does not support biometric authentication"
      });
      return;
    }
    
    setBiometricLoading(true);
    try {
      // First let's try to authenticate with biometrics
      const userId = await authenticateWithBiometrics();
      
      if (userId) {
        // If successful, sign in the user using the auth hook
        const success = await signInWithBiometrics();
        
        if (success) {
          // Successful login via biometrics
          setBiometricLoading(false);
          
          // Redirect after successful login
          setTimeout(() => {
            if (returnTo) {
              navigate(returnTo);
            } else {
              navigate('/dashboard');
            }
          }, 500);
        } else {
          throw new Error("Biometric authentication failed");
        }
      } else {
        throw new Error("Biometric authentication failed to retrieve user ID");
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setBiometricLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Biometric verification failed"
      });
    }
  };

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">LuvviX ID</h2>
            <p className="text-gray-600 mt-2">
              One account for the entire technological ecosystem
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signup" className="text-gray-700">Create account</TabsTrigger>
              <TabsTrigger value="login" className="text-gray-700">Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {renderSignupStep()}
                </form>
                
                {step === 1 && (
                  <>
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">ou continuer avec</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Button variant="white" className="w-full">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button variant="white" className="w-full">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="black"/>
                            <path d="M16.7333 8.13332C16.4 8.4 15.8 8.73332 15.3333 8.73332C14.8 8.73332 14.0667 8.33332 13.6 8.33332C12.9333 8.33332 12.0667 8.73332 12.0667 9.66665C12.0667 10.4 12.6 10.8 13.2 11.1333L14 11.5333C15 12.0667 15.8667 12.7333 15.8667 14.1333C15.8667 15.7333 14.6 17.1333 12.8667 17.1333C11.9333 17.1333 10.9333 16.6667 10.2667 16L9.6 15.4667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Apple
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="login">
              <div className="bg-white p-6 rounded-lg shadow-md">
                {biometricsAvailable && (
                  <div className="mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleBiometricAuth}
                      disabled={biometricLoading || biometricsLoading}
                    >
                      {biometricLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fingerprint">
                          <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z"></path>
                          <path d="M2 12c0 4.42 3.58 8 8 8s8-3.58 8-8"></path>
                          <path d="M12 20c-4.42 0-8-3.58-8-8"></path>
                          <path d="M8 16s1.5 2 4 2 4-2 4-2"></path>
                          <path d="M12 4v4"></path>
                          <path d="M8 10v8"></path>
                          <path d="M16 10v8"></path>
                          <path d="M12 12v8"></path>
                        </svg>
                      )}
                      Login with Authentivix
                    </Button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>
                  </div>
                )}

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
                      <a href="#" className="text-xs text-luvvix-purple hover:underline">
                        Mot de passe oublié?
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
                    className="w-full" 
                    variant="default" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">ou continuer avec</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button variant="white" className="w-full">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="white" className="w-full">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="black"/>
                        <path d="M16.7333 8.13332C16.4 8.4 15.8 8.73332 15.3333 8.73332C14.8 8.73332 14.0667 8.33332 13.6 8.33332C12.9333 8.33332 12.0667 8.73332 12.0667 9.66665C12.0667 10.4 12.6 10.8 13.2 11.1333L14 11.5333C15 12.0667 15.8667 12.7333 15.8667 14.1333C15.8667 15.7333 14.6 17.1333 12.8667 17.1333C11.9333 17.1333 10.9333 16.6667 10.2667 16L9.6 15.4667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Apple
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              En créant un compte ou en vous connectant, vous acceptez nos{" "}
              <a href="/terms" className="text-luvvix-purple hover:underline">Conditions d'utilisation</a> et notre{" "}
              <a href="/privacy" className="text-luvvix-purple hover:underline">Politique de confidentialité</a>
            </p>
          </div>
          
          <div className="mt-12 border-t pt-6">
            <h3 className="text-lg font-semibold text-center mb-4">Pour les développeurs</h3>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/api-docs')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 16-4-4 4-4" />
                  <path d="m6 8 4 4-4 4" />
                </svg>
                Documentation API
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Authentication;
