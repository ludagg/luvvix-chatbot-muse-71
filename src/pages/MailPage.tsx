import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mail, 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  Forward, 
  MoreHorizontal,
  Menu,
  Inbox,
  Send,
  FileText,
  Bot,
  Sparkles,
  Paperclip,
  Settings,
  Plus,
  Filter,
  SortDesc,
  RefreshCw,
  Zap,
  Globe,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AccountSetup from "@/components/mail/AccountSetup";
import EmailComposer from "@/components/mail/EmailComposer";

interface Email {
  id: string;
  message_id: string;
  subject: string;
  sender_email: string;
  sender_name: string;
  body_text: string;
  body_html: string;
  received_at: string;
  is_read: boolean;
  is_starred: boolean;
  labels: string[];
  attachments: Array<{ filename: string; size_bytes: number; content_type: string }>;
}

interface MailAccount {
  id: string;
  email_address: string;
  display_name: string;
  provider: string;
  is_primary: boolean;
  is_active: boolean;
}

interface AIInsight {
  type: 'summary' | 'action' | 'priority' | 'translation';
  content: string;
  confidence: number;
}

const MailPage = () => {
  const { user } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [mailAccounts, setMailAccounts] = useState<MailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      loadMailAccounts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAccount) {
      loadEmails();
    }
  }, [selectedAccount, currentFolder]);

  const loadMailAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('mail_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      setMailAccounts(data || []);
      if (data && data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmails = async () => {
    if (!selectedAccount) return;

    try {
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          email_attachments (
            filename,
            size_bytes,
            content_type
          )
        `)
        .eq('mail_account_id', selectedAccount)
        .order('received_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setEmails(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des emails:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les emails"
      });
    }
  };

  const syncEmails = async () => {
    if (!selectedAccount) return;

    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session non trouvée');

      const { data, error } = await supabase.functions.invoke('sync-emails', {
        body: { accountId: selectedAccount, maxResults: 50 },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      toast({
        title: "Synchronisation terminée",
        description: `${data.synced} nouveaux emails synchronisés`
      });

      await loadEmails();
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      toast({
        variant: "destructive",
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les emails"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const generateAIInsights = async (email: Email) => {
    setIsLoadingAI(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session non trouvée');

      const { data, error } = await supabase.functions.invoke('luvvix-mail-ai', {
        body: {
          emailContent: `Objet: ${email.subject}\n\nDe: ${email.sender_email}\n\nContenu: ${email.body_text}`,
          analysisType: 'insights'
        },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      const insights: AIInsight[] = [
        {
          type: 'summary',
          content: data.analysis,
          confidence: data.confidence
        }
      ];

      setAiInsights(insights);
    } catch (error) {
      console.error('Erreur IA:', error);
      toast({
        variant: "destructive",
        title: "Erreur IA",
        description: "Impossible de générer les insights IA"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleEmailSelect = async (email: Email) => {
    setSelectedEmail(email);
    generateAIInsights(email);
    
    // Marquer comme lu
    if (!email.is_read) {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', email.id);

      if (!error) {
        setEmails(prev => prev.map(e => 
          e.id === email.id ? { ...e, is_read: true } : e
        ));
      }
    }
  };

  const folders = [
    { id: 'inbox', name: 'Boîte de réception', icon: Inbox, count: emails.filter(e => !e.is_read).length },
    { id: 'starred', name: 'Messages suivis', icon: Star, count: emails.filter(e => e.is_starred).length },
    { id: 'sent', name: 'Envoyés', icon: Send, count: 0 },
    { id: 'drafts', name: 'Brouillons', icon: FileText, count: 0 },
    { id: 'archive', name: 'Archives', icon: Archive, count: 0 },
    { id: 'trash', name: 'Corbeille', icon: Trash2, count: 0 }
  ];

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.sender_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.body_text.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (currentFolder) {
      case 'starred':
        return matchesSearch && email.is_starred;
      case 'inbox':
      default:
        return matchesSearch;
    }
  });

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          onClick={() => setIsComposing(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau message
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={currentFolder === folder.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentFolder(folder.id)}
            >
              <folder.icon className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">{folder.name}</span>
              {folder.count > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {folder.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="px-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Libellés</h3>
          <div className="space-y-1">
            {['Business', 'Personnel', 'Urgent', 'LuvviX'].map((label) => (
              <Button key={label} variant="ghost" className="w-full justify-start text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                {label}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <Bot className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800 dark:text-purple-200">LuvviX AI</span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Assistant IA intégré pour une gestion intelligente de vos emails
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <CardTitle className="text-2xl">LuvviX Mail</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connectez-vous pour accéder à votre messagerie professionnelle
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
              <a href="/auth">Se connecter</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement de LuvviX Mail...</p>
        </div>
      </div>
    );
  }

  if (mailAccounts.length === 0) {
    return <AccountSetup onAccountAdded={loadMailAccounts} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <Mail className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                LuvviX Mail
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher dans les emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={syncEmails}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>

            <Avatar className="w-8 h-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <SidebarContent />
        </aside>

        {/* Email List */}
        <div className={cn(
          "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden",
          selectedEmail ? "hidden md:block md:w-96" : "flex-1"
        )}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {folders.find(f => f.id === currentFolder)?.name}
              </h2>
              <Button 
                onClick={() => setIsComposing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau
              </Button>
            </div>
            
            {mailAccounts.length > 1 && (
              <select 
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full p-2 border rounded-md mb-4"
              >
                {mailAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.display_name} ({account.email_address})
                  </option>
                ))}
              </select>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredEmails.map((email) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                      selectedEmail?.id === email.id && "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600",
                      !email.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                    onClick={() => handleEmailSelect(email)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {email.sender_email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            "text-sm truncate",
                            !email.is_read ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {email.sender_name || email.sender_email.split('@')[0]}
                          </p>
                          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                            {email.is_starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            <span className="text-xs text-gray-500">
                              {new Date(email.received_at).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <p className={cn(
                          "text-sm truncate mb-1",
                          !email.is_read ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
                        )}>
                          {email.subject}
                        </p>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {email.body_text?.substring(0, 100)}...
                        </p>
                        
                        {email.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {email.labels.slice(0, 3).map((label) => (
                              <Badge key={label} variant="secondary" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Email Content */}
        {selectedEmail && (
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedEmail(null)}
                >
                  ← Retour
                </Button>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Star className={cn(
                      "w-4 h-4",
                      selectedEmail.is_starred ? "text-yellow-500 fill-current" : ""
                    )} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* AI Insights */}
              {aiInsights.length > 0 && (
                <div className="mb-4">
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="font-semibold text-purple-800 dark:text-purple-200">
                          Insights IA
                        </span>
                        {isLoadingAI && (
                          <div className="ml-2 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {aiInsights.map((insight, index) => (
                          <div key={index} className="text-sm text-purple-700 dark:text-purple-300">
                            {insight.content}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedEmail.subject}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {selectedEmail.sender_email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedEmail.sender_name || selectedEmail.sender_email}
                      </p>
                      <p>{selectedEmail.sender_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1"></div>
                  
                  <div className="text-right">
                    <p>{new Date(selectedEmail.received_at).toLocaleDateString('fr-FR')}</p>
                    <p>{new Date(selectedEmail.received_at).toLocaleTimeString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="prose max-w-none dark:prose-invert">
                {selectedEmail.body_html ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                ) : (
                  selectedEmail.body_text?.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                )}
              </div>

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Pièces jointes ({selectedEmail.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <Card key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {attachment.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attachment.size_bytes ? `${Math.round(attachment.size_bytes / 1024)} KB` : 'Taille inconnue'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsComposing(true)}
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Répondre
                </Button>
                <Button variant="outline">
                  <Forward className="w-4 h-4 mr-2" />
                  Transférer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailPage;
