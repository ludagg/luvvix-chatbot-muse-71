import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatContainer } from "@/components/ChatContainer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ConversationSelector } from "@/components/ConversationSelector";
import { DiscussionsMenu } from "@/components/DiscussionsMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

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

const Index = () => {
  const { user, login, register, isLoading } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex flex-col min-h-screen h-screen bg-gradient-to-b from-background via-background to-background/90 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10%] opacity-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-72 h-72 md:w-96 md:h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <header className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/95 backdrop-blur-sm z-30">
        <div className="flex items-center gap-2">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4 h-full">
                <ConversationSelector closeMenu={() => setIsSidebarOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-xl font-bold text-primary">LuvviX AI</span>
          <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">Beta</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DiscussionsMenu />
          {user ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-primary/10"
              onClick={() => console.log("User profile")}
            >
              <span className="font-medium text-sm">{user.displayName?.charAt(0) || "U"}</span>
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleOpenAuth("login")}
            >
              Se connecter
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex flex-col flex-grow relative z-10 overflow-hidden">
        {!user && (
          <div className="text-center mt-4 mb-2 px-4 md:mb-4">
            <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">
              Connectez-vous pour sauvegarder vos discussions
            </p>
            <div className="flex justify-center gap-3 md:gap-4">
              <Button size={isMobile ? "sm" : "default"} onClick={() => handleOpenAuth("login")}>
                Se connecter
              </Button>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"} 
                onClick={() => handleOpenAuth("register")}
              >
                S'inscrire
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 h-full w-full max-w-5xl mx-auto px-2 md:px-4 pb-2">
          <div className="h-full flex flex-col bg-gradient-to-b from-background/50 via-background/80 to-background rounded-xl md:rounded-2xl shadow-lg border border-primary/10 overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 py-2 text-center text-xs text-muted-foreground bg-background border-t border-border/20">
        <p>© {new Date().getFullYear()} LuvviX AI · Tous droits réservés</p>
      </footer>

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
