import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, Key, AppWindow, Loader2, Shield, User, Settings, Bell, Globe, Palette, Lock } from "lucide-react";
import AccountSelector from "@/components/AccountSelector";
import AppGrid from "@/components/dashboard/AppGrid";
import RecentActivities from "@/components/dashboard/RecentActivities";
import StatCards from "@/components/dashboard/StatCards";
import Clock from "@/components/dashboard/Clock";
import UsageStats from "@/components/dashboard/UsageStats";
import LanguageSelector from "@/components/LanguageSelector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppAccess {
  id: string;
  app_name: string;
  granted_at: string;
  last_access: string;
}

const Dashboard = () => {
  const { user, profile, signOut, globalSignOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'ecosystem';
  const [connectedApps, setConnectedApps] = useState<AppAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeLoading, setRevokeLoading] = useState<string | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    darkMode: false,
    autoSave: true,
    twoFactor: false,
    publicProfile: true
  });
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchConnectedApps();
    }
  }, [user, navigate]);
  
  const fetchConnectedApps = async () => {
    setLoading(true);
    try {
      const { data: authSession } = await supabase.auth.getSession();
      if (authSession.session) {
        const response = await fetch("https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api/get-user-apps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token: authSession.session.access_token })
        });
        
        const result = await response.json();
        if (result.success && result.data) {
          setConnectedApps(result.data);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des applications:", error);
      toast({
        variant: "destructive",
        title: t('general.error'),
        description: "Impossible de récupérer vos applications connectées."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevokeAccess = async (appId: string, appName: string) => {
    if (!user) return;
    
    setRevokeLoading(appId);
    try {
      const { data: authSession } = await supabase.auth.getSession();
      if (!authSession.session) return;
      
      const response = await fetch("https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/auth-api/revoke-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          token: authSession.session.access_token,
          app_access_id: appId
        })
      });
      
      const result = await response.json();
      if (result.success) {
        toast({
          title: t('message.accessRevoked'),
          description: `${t('general.lastAccess')} ${appName} ${t('message.accessRevokedDesc')}`
        });
        setConnectedApps(prevApps => prevApps.filter(app => app.id !== appId));
      } else {
        throw new Error(result.error || "Échec de la révocation");
      }
    } catch (error) {
      console.error("Erreur lors de la révocation de l'accès:", error);
      toast({
        variant: "destructive",
        title: t('general.error'),
        description: "Impossible de révoquer l'accès à cette application."
      });
    } finally {
      setRevokeLoading(null);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getAppDisplayName = (appName: string) => {
    const appNames: {[key: string]: string} = {
      main: "LuvviX Principal",
      pharmacy: "LuvviX Pharmacy",
      streaming: "LuvviX Streaming",
      chat: "LuvviX Chat"
    };
    
    return appNames[appName] || appName;
  };

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {user && (
            <>
              {/* Header avec design amélioré */}
              <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      {t('dashboard.title')}
                    </h1>
                    <p className="text-xl text-blue-100">
                      {t('dashboard.welcome')}, {profile?.full_name || user.email}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-200">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      {t('dashboard.connectedTo')}
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 flex items-center gap-4">
                    <div className="hidden lg:block bg-white/10 backdrop-blur-md rounded-2xl p-4">
                      <Clock />
                    </div>
                    <AccountSelector 
                      currentUser={{
                        id: user.id,
                        email: user.email || '',
                        avatarUrl: profile?.avatar_url || undefined,
                        fullName: profile?.full_name || undefined,
                      }}
                      onLogout={async () => {
                        await signOut();
                        return Promise.resolve();
                      }}
                    />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
              </div>
              
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-white/20">
                  <TabsTrigger value="ecosystem" className="rounded-xl font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white">{t('dashboard.ecosystem')}</TabsTrigger>
                  <TabsTrigger value="connected-apps" className="rounded-xl font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white">SSO</TabsTrigger>
                  <TabsTrigger value="security" className="rounded-xl font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white">{t('dashboard.security')}</TabsTrigger>
                  <TabsTrigger value="profile" className="rounded-xl font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white">{t('dashboard.profile')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ecosystem">
                  <div className="space-y-8">
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/20 shadow-xl rounded-2xl">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <AppWindow className="h-5 w-5 text-white" />
                          </div>
                          {t('nav.ecosystem')} LuvviX
                        </CardTitle>
                        <CardDescription className="text-lg">
                          {t('dashboard.ecosystemDescription')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AppGrid />
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <RecentActivities userId={user.id} />
                      </div>
                      <div className="lg:col-span-1 space-y-6">
                        <div className="lg:hidden">
                          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/20 shadow-xl rounded-2xl p-6">
                            <Clock />
                          </Card>
                        </div>
                        <UsageStats userId={user.id} />
                        <StatCards userId={user.id} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="connected-apps">
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/20 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                          <AppWindow className="h-5 w-5 text-white" />
                        </div>
                        {t('dashboard.connectedApps')}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        {t('dashboard.connectedAppsDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center p-6">{t('message.loadingApps')}</div>
                      ) : connectedApps.length > 0 ? (
                        <div className="space-y-4">
                          {connectedApps.map((app) => (
                            <div key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border border-white/20 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{getAppDisplayName(app.app_name)}</h3>
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">{app.app_name}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {t('general.grantedOn')} {formatDate(app.granted_at)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {t('general.lastAccess')}: {formatDate(app.last_access)}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="mt-4 md:mt-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                                onClick={() => handleRevokeAccess(app.id, getAppDisplayName(app.app_name))}
                                disabled={revokeLoading === app.id}
                              >
                                {revokeLoading === app.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('action.revoking')}
                                  </>
                                ) : (
                                  t('action.revokeAccess')
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-white/30 dark:bg-gray-800/30">
                          <AppWindow className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">{t('message.noAppsConnected')}</p>
                          <p className="text-sm text-gray-400 mt-2">
                            {t('message.noAppsConnected.desc')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <div className="space-y-6">
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/20 shadow-xl rounded-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          {t('dashboard.security')}
                        </CardTitle>
                        <CardDescription className="text-lg">
                          {t('dashboard.securityDescription')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {/* Notifications */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-violet-600" />
                            <h3 className="text-lg font-semibold">{t('settings.notifications')}</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                              <Label htmlFor="notifications" className="font-medium">{t('settings.notifications.push')}</Label>
                              <Switch
                                id="notifications"
                                checked={settings.notifications}
                                onCheckedChange={(checked) => updateSetting('notifications', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                              <Label htmlFor="email-notifications" className="font-medium">{t('settings.notifications.email')}</Label>
                              <Switch
                                id="email-notifications"
                                checked={settings.emailNotifications}
                                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Préférences */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Palette className="h-5 w-5 text-violet-600" />
                            <h3 className="text-lg font-semibold">{t('settings.preferences')}</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                              <Label htmlFor="dark-mode" className="font-medium">{t('settings.darkMode')}</Label>
                              <Switch
                                id="dark-mode"
                                checked={settings.darkMode}
                                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                              <Label htmlFor="auto-save" className="font-medium">{t('settings.autoSave')}</Label>
                              <Switch
                                id="auto-save"
                                checked={settings.autoSave}
                                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Langue */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-violet-600" />
                            <h3 className="text-lg font-semibold">{t('settings.language')}</h3>
                          </div>
                          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                            <LanguageSelector />
                          </div>
                        </div>

                        {/* Sécurité avancée */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-violet-600" />
                            <h3 className="text-lg font-semibold">{t('settings.security.advanced')}</h3>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                              <div>
                                <Label htmlFor="two-factor" className="font-medium">{t('settings.twoFactor')}</Label>
                                <p className="text-sm text-gray-500">{t('settings.twoFactor.desc')}</p>
                              </div>
                              <Switch
                                id="two-factor"
                                checked={settings.twoFactor}
                                onCheckedChange={(checked) => updateSetting('twoFactor', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                              <div>
                                <Label htmlFor="public-profile" className="font-medium">{t('settings.publicProfile')}</Label>
                                <p className="text-sm text-gray-500">{t('settings.publicProfile.desc')}</p>
                              </div>
                              <Switch
                                id="public-profile"
                                checked={settings.publicProfile}
                                onCheckedChange={(checked) => updateSetting('publicProfile', checked)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Actions de sécurité */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">{t('action.actions')}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 rounded-xl">
                              <Key className="h-5 w-5" />
                              <span className="font-medium">{t('action.changePassword')}</span>
                              <span className="text-sm text-gray-500">{t('action.changePassword.desc')}</span>
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="h-auto p-4 flex flex-col items-start gap-2 rounded-xl"
                              onClick={async () => {
                                await globalSignOut();
                                navigate('/');
                              }}
                            >
                              <LogOut className="h-5 w-5" />
                              <span className="font-medium">{t('action.globalSignOut')}</span>
                              <span className="text-sm text-red-100">{t('action.globalSignOut.desc')}</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="profile">
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/20 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        {t('dashboard.profile')}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        {t('dashboard.profileDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.email')}</Label>
                            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                              {user.email}
                            </div>
                          </div>
                          
                          {profile?.full_name && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.fullName')}</Label>
                              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                {profile.full_name}
                              </div>
                            </div>
                          )}
                          
                          {profile?.username && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.username')}</Label>
                              <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                {profile.username}
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('general.memberSince')}</Label>
                            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                              {formatDate(user.created_at || new Date().toISOString())}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 hover:shadow-lg transition-all">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('action.updateProfile')}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
