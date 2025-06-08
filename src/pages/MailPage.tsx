
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Inbox, Send, Archive, Search, Star, Paperclip, Users, Plus, Settings, Loader2, RefreshCw, Trash2, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface EmailAccount {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'other';
  displayName: string;
  connected: boolean;
}

interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  date: Date;
  read: boolean;
  starred: boolean;
  accountId: string;
  attachments?: { name: string; size: number; url: string }[];
}

const MailPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'inbox' | 'sent' | 'starred' | 'archive' | 'trash'>('inbox');
  const [composing, setComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simuler des données d'email pour la démo
  const mockEmails: Email[] = [
    {
      id: '1',
      from: 'marie.dubois@example.com',
      to: ['user@example.com'],
      subject: 'Rapport mensuel disponible',
      body: 'Bonjour,\n\nLe rapport mensuel est maintenant disponible dans LuvviX Cloud.\n\nCordialement,\nMarie',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      starred: false,
      accountId: 'gmail-1',
      attachments: [{ name: 'rapport-mars.pdf', size: 1024000, url: '#' }]
    },
    {
      id: '2',
      from: 'team@luvvix.com',
      to: ['user@example.com'],
      subject: 'Nouvelles fonctionnalités LuvviX Cloud',
      body: 'Découvrez les dernières fonctionnalités de LuvviX Cloud !',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      starred: true,
      accountId: 'gmail-1'
    },
    {
      id: '3',
      from: 'jean.martin@company.com',
      to: ['user@example.com'],
      subject: 'Réunion équipe demain',
      body: 'N\'oubliez pas notre réunion d\'équipe demain à 14h.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      starred: false,
      accountId: 'outlook-1'
    }
  ];

  const mockAccounts: EmailAccount[] = [
    {
      id: 'gmail-1',
      email: 'user@gmail.com',
      provider: 'gmail',
      displayName: 'Personnel Gmail',
      connected: true
    },
    {
      id: 'outlook-1',
      email: 'user@company.com',
      provider: 'outlook',
      displayName: 'Professionnel Outlook',
      connected: true
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?return_to=/mail');
      return;
    }

    if (user) {
      setAccounts(mockAccounts);
      setEmails(mockEmails);
    }
  }, [user, loading, navigate]);

  const connectEmailAccount = async (provider: string) => {
    setIsLoading(true);
    // Ici on implémenterait la vraie connexion OAuth
    toast({
      title: "Connexion en cours",
      description: `Connexion à ${provider} en cours...`,
    });
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Compte connecté",
        description: `Votre compte ${provider} a été connecté avec succès.`,
      });
    }, 2000);
  };

  const filteredEmails = emails.filter(email => {
    if (selectedAccount !== 'all' && email.accountId !== selectedAccount) return false;
    if (searchQuery && !email.subject.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !email.from.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    switch (currentView) {
      case 'inbox': return true;
      case 'starred': return email.starred;
      case 'sent': return false; // Pas d'emails envoyés dans cette démo
      case 'archive': return false;
      case 'trash': return false;
      default: return true;
    }
  });

  const unreadCount = emails.filter(email => !email.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-grow pt-16">
        <div className="container mx-auto p-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      LuvviX Mail
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connecter un compte email</DialogTitle>
                          <DialogDescription>
                            Choisissez votre fournisseur email pour le connecter à LuvviX Mail
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          {['Gmail', 'Outlook', 'Yahoo', 'Autre'].map((provider) => (
                            <Button
                              key={provider}
                              variant="outline"
                              onClick={() => connectEmailAccount(provider)}
                              disabled={isLoading}
                              className="h-20 flex flex-col space-y-2"
                            >
                              {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <>
                                  <Mail className="w-6 h-6" />
                                  <span>{provider}</span>
                                </>
                              )}
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sélecteur de compte */}
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les comptes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les comptes</SelectItem>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Navigation */}
                  <div className="space-y-1">
                    <Button
                      variant={currentView === 'inbox' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCurrentView('inbox')}
                    >
                      <Inbox className="w-4 h-4 mr-2" />
                      Boîte de réception
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant={currentView === 'starred' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCurrentView('starred')}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Favoris
                    </Button>
                    <Button
                      variant={currentView === 'sent' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCurrentView('sent')}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Envoyés
                    </Button>
                    <Button
                      variant={currentView === 'archive' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCurrentView('archive')}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archives
                    </Button>
                    <Button
                      variant={currentView === 'trash' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setCurrentView('trash')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Corbeille
                    </Button>
                  </div>

                  {/* Comptes connectés */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Comptes connectés</h4>
                    {accounts.map(account => (
                      <div key={account.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${account.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm">{account.displayName}</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Rechercher dans les emails..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button onClick={() => setComposing(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      Nouveau
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedEmail ? (
                    // Vue d'email sélectionné
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setSelectedEmail(null)}>
                          ← Retour
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-6 space-y-4">
                        <div>
                          <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span>De: {selectedEmail.from}</span>
                            <span>{selectedEmail.date.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-2">Pièces jointes</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedEmail.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded p-2">
                                  <Paperclip className="w-4 h-4" />
                                  <span className="text-sm">{attachment.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(attachment.size / 1024 / 1024).toFixed(1)} MB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="border-t pt-4">
                          <div className="whitespace-pre-wrap">{selectedEmail.body}</div>
                        </div>
                        
                        <div className="flex space-x-2 pt-4">
                          <Button>Répondre</Button>
                          <Button variant="outline">Transférer</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Liste des emails
                    <div className="space-y-2">
                      {filteredEmails.map((email) => (
                        <motion.div
                          key={email.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            !email.read ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => setSelectedEmail(email)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${!email.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                              <span className={`font-medium ${!email.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                {email.from}
                              </span>
                              {email.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                              {email.attachments && email.attachments.length > 0 && (
                                <Paperclip className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {email.date.toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${!email.read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                            {email.subject}
                          </p>
                        </motion.div>
                      ))}
                      
                      {filteredEmails.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Aucun email trouvé</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de composition */}
      <Dialog open={composing} onOpenChange={setComposing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">À</label>
                <Input placeholder="destinataire@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Objet</label>
                <Input placeholder="Objet du message" />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Votre message..." rows={10} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline">
                <Paperclip className="w-4 h-4 mr-2" />
                Joindre
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setComposing(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setComposing(false)}>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MailPage;
