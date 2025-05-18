import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SciraInterface } from "@/components/SciraInterface";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Mot de passe doit contenir au moins 6 caractères" }),
});

const registerSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Mot de passe doit contenir au moins 6 caractères" }),
  displayName: z.string().min(2, { message: "Prénom requis" }),
  age: z.coerce.number().min(13, { message: "Vous devez avoir au moins 13 ans" }).max(120, { message: "Âge invalide" }),
  country: z.string().min(2, { message: "Pays requis" }),
});

const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Prénom requis" }),
  age: z.coerce.number().min(13, { message: "Vous devez avoir au moins 13 ans" }).max(120, { message: "Âge invalide" }),
  country: z.string().min(2, { message: "Pays requis" }),
});

const Index = () => {
  const { user, login, register, isLoading } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      age: undefined,
      country: "",
    },
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      age: user?.age || undefined,
      country: user?.country || "",
    },
  });

  // Authentication handlers
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setError("");
    try {
      await login(values.email, values.password);
      setIsAuthDialogOpen(false);
      loginForm.reset();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setError("");
    try {
      await register(
        values.email, 
        values.password, 
        values.displayName, 
        values.age, 
        values.country
      );
      setIsAuthDialogOpen(false);
      registerForm.reset();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthDialogOpen(true);
    setError("");
  };

  return (
    <div className="h-screen w-full bg-black text-white">
      <SciraInterface />
      
      {/* Authentication Dialog */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>
              {authMode === "login" ? "Connexion" : "Inscription"}
            </DialogTitle>
            <DialogDescription>
              {authMode === "login" 
                ? "Entrez vos identifiants pour vous connecter" 
                : "Créez un compte pour sauvegarder vos discussions"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={authMode} className="w-full" onValueChange={(v) => setAuthMode(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-2">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="exemple@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Chargement..." : "Se connecter"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-2">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="exemple@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Âge</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              min={13}
                              max={120}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pays</FormLabel>
                          <FormControl>
                            <Input placeholder="France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Chargement..." : "S'inscrire"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
