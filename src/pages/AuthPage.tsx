import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/ui/icons";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthPage = () => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupParam = searchParams.get("signup");
  const isSignupFromParams = signupParam === "true";

  useState(() => {
    setIsLogin(!isSignupFromParams);
  }, [isSignupFromParams]);

  const handleAuth = async (type: "login" | "register") => {
    setIsLoading(true);
    setError(null);

    if (type === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      if (type === "login") {
        await signIn({ email, password });
        navigate("/dashboard");
      } else {
        await signUp({ email, password });
        navigate("/dashboard");
      }
    } catch (e: any) {
      setError(e.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container grid h-screen w-screen place-items-center">
      <Card className="w-[350px] md:w-[500px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Connexion" : "Créer un compte"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? "Connectez-vous à votre compte"
              : "Rejoignez notre plateforme"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue={isLogin ? "login" : "register"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="login"
                onClick={() => setIsLogin(true)}
                className={isLogin ? "bg-gray-100 dark:bg-gray-700" : ""}
              >
                {t.nav.login}
              </TabsTrigger>
              <TabsTrigger
                value="register"
                onClick={() => setIsLogin(false)}
                className={!isLogin ? "bg-gray-100 dark:bg-gray-700" : ""}
              >
                {t.nav.account}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t.common.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@luvviX.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t.common.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <CardFooter className="flex justify-between">
                <Button variant="link">Mot de passe oublié ?</Button>
                <Button
                  onClick={() => handleAuth("login")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    t.nav.login
                  )}
                </Button>
              </CardFooter>
            </TabsContent>
            <TabsContent value="register" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t.common.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@luvviX.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t.common.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  {t.common.confirmPassword}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() => handleAuth("register")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    t.nav.account
                  )}
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </CardContent>
        {error && <p className="text-center text-red-500">{error}</p>}
      </Card>
    </div>
  );
};

export default AuthPage;
