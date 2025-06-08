
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Plus, 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Settings,
  Send,
  Paperclip,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mailService, MailAccount, Email } from '@/services/mail-service';
import { cloudService } from '@/services/cloud-service';

const MailPage = () => {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    loadData();
  }, [currentFolder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, emailsData] = await Promise.all([
        mailService.getMailAccounts(),
        mailService.getEmails(undefined, currentFolder)
      ]);
      
      setAccounts(accountsData);
      setEmails(emailsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données de messagerie"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (provider: string) => {
    try {
      const email = prompt(`Entrez votre adresse ${provider}:`);
      if (!email) return;

      await mailService.connectMailAccount(provider, email);
      toast({
        title: "Connexion en cours",
        description: "Vous allez être redirigé pour autoriser l'accès"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de connecter le compte de messagerie"
      });
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!composeData.to || !composeData.subject || !accounts.length) {
        toast({
          variant: "destructive",
          title: "Champs manquants",
          description: "Veuillez remplir tous les champs obligatoires"
        });
        return;
      }

      const defaultAccount = accounts.find(acc => acc.is_default) || accounts[0];
      
      await mailService.sendEmail(
        defaultAccount.id,
        composeData.to.split(',').map(email => email.trim()),
        composeData.subject,
        composeData.body,
        composeData.cc ? composeData.cc.split(',').map(email => email.trim()) : undefined,
        composeData.bcc ? composeData.bcc.split(',').map(email => email.trim()) : undefined
      );

      setIsComposing(false);
      setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '' });
      toast({
        title: "Email envoyé",
        description: "Votre message a été envoyé avec succès"
      });

      await loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer l'email"
      });
    }
  };

  const handleMarkAsRead = async (emailId: string) => {
    try {
      await mailService.markAsRead(emailId);
      setEmails(emails.map(email => 
        email.id === emailId ? { ...email, is_read: true } : email
      ));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer l'email comme lu"
      });
    }
  };

  const handleStarEmail = async (emailId: string, starred: boolean) => {
    try {
      await mailService.markAsStarred(emailId, starred);
      setEmails(emails.map(email => 
        email.id === emailId ? { ...email, is_starred: starred } : email
      ));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le statut de l'email"
      });
    }
  };

  const filteredEmails = emails.filter(email =>
    email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = [
    { id: 'inbox', name: 'Boîte de réception', count: emails.length },
    { id: 'sent', name: 'Envoyés', count: 0 },
    { id: 'drafts', name: 'Brouillons', count: 0 },
    { id: 'archive', name: 'Archives', count: 0 },
    { id: 'spam', name: 'Spam', count: 0 },
    { id: 'trash', name: 'Corbeille', count: 0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre messagerie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Mail className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LuvviX Mail</h1>
            <Badge variant="secondary">Bêta</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Button onClick={() => setIsComposing(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
            
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          {/* Comptes */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Comptes</h3>
            {accounts.length === 0 ? (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleConnectAccount('gmail')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Connecter Gmail
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleConnectAccount('outlook')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Connecter Outlook
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span className="text-sm truncate">{account.email_address}</span>
                    {account.is_default && (
                      <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleConnectAccount('gmail')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un compte
                </Button>
              </div>
            )}
          </div>

          {/* Dossiers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Dossiers</h3>
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    currentFolder === folder.id
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{folder.name}</span>
                  {folder.count > 0 && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                      {folder.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 flex">
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {folders.find(f => f.id === currentFolder)?.name}
                </h2>
                <Button variant="ghost" size="icon" onClick={loadData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto h-full">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {accounts.length === 0 
                      ? 'Connectez un compte de messagerie pour commencer'
                      : 'Aucun email dans ce dossier'
                    }
                  </p>
                </div>
              ) : (
                filteredEmails.map(email => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedEmail?.id === email.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                    } ${!email.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => {
                      setSelectedEmail(email);
                      if (!email.is_read) {
                        handleMarkAsRead(email.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`font-medium truncate ${!email.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {email.sender?.name || email.sender?.email || 'Expéditeur inconnu'}
                          </span>
                          {email.is_starred && (
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <p className={`text-sm truncate mb-1 ${!email.is_read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {email.subject || 'Pas de sujet'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                          {email.body_text?.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                        {new Date(email.received_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 bg-white dark:bg-gray-800">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {selectedEmail.subject || 'Pas de sujet'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>De: {selectedEmail.sender?.name || selectedEmail.sender?.email}</span>
                        <span>{new Date(selectedEmail.received_at).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStarEmail(selectedEmail.id, !selectedEmail.is_starred)}
                      >
                        <Star className={`w-4 h-4 ${selectedEmail.is_starred ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  <div 
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedEmail.body_html || selectedEmail.body_text?.replace(/\n/g, '<br>') || 'Pas de contenu'
                    }}
                  />
                </div>
                
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Répondre
                  </Button>
                </div>
              </div>
            ) : isComposing ? (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Nouveau message</h3>
                </div>
                
                <div className="flex-1 p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">À</label>
                      <Input
                        value={composeData.to}
                        onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                        placeholder="destinataire@example.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cc</label>
                        <Input
                          value={composeData.cc}
                          onChange={(e) => setComposeData({...composeData, cc: e.target.value})}
                          placeholder="cc@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cci</label>
                        <Input
                          value={composeData.bcc}
                          onChange={(e) => setComposeData({...composeData, bcc: e.target.value})}
                          placeholder="bcc@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet</label>
                      <Input
                        value={composeData.subject}
                        onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                        placeholder="Sujet du message"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                      <Textarea
                        value={composeData.body}
                        onChange={(e) => setComposeData({...composeData, body: e.target.value})}
                        placeholder="Écrivez votre message..."
                        rows={12}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button onClick={handleSendEmail} className="bg-purple-600 hover:bg-purple-700">
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </Button>
                    <Button variant="outline" onClick={() => setIsComposing(false)}>
                      Annuler
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Sélectionnez un email pour le lire</p>
                  <Button onClick={() => setIsComposing(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau message
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailPage;
