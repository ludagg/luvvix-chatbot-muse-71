
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { ChatContainer } from "@/components/ChatContainer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Index = () => {
  const { user, login, register, isLoading } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setError("");
    try {
      if (authMode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setIsAuthDialogOpen(false);
      setEmail("");
      setPassword("");
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-background/90">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10%] opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <Header onOpenAuth={handleOpenAuth} />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col flex-grow pt-20 pb-6 relative z-10"
      >
        <div className="flex-1 w-full max-w-5xl mx-auto px-4">
          {!user && (
            <div className="text-center mb-6">
              <p className="text-muted-foreground mb-4">
                Connectez-vous pour sauvegarder vos discussions
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => handleOpenAuth("login")}>
                  Se connecter
                </Button>
                <Button variant="outline" onClick={() => handleOpenAuth("register")}>
                  S'inscrire
                </Button>
              </div>
            </div>
          )}

          <ChatContainer />
        </div>
      </motion.main>
      
      {/* Modern footer with gradient */}
      <div className="relative z-10 py-3 text-center text-xs text-muted-foreground bg-gradient-to-t from-background/80 to-transparent">
        <p>© {new Date().getFullYear()} LuvviX AI · Tous droits réservés</p>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAuth} disabled={isLoading}>
              {isLoading ? "Chargement..." : authMode === "login" ? "Se connecter" : "S'inscrire"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
