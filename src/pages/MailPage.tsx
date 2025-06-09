import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  Users,
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

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[];
  attachments?: Array<{ name: string; size: string; type: string }>;
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
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Données de démonstration réalistes
  const demoEmails: Email[] = [
    {
      id: '1',
      from: 'marie.dubois@techcorp.com',
      to: user?.email || 'user@example.com',
      subject: 'Proposition de collaboration stratégique - Q1 2025',
      body: `Bonjour,

J'espère que ce message vous trouve en bonne santé. Je suis Marie Dubois, Directrice du Développement Commercial chez TechCorp Solutions.

Nous sommes très impressionnés par votre travail récent et aimerions explorer une collaboration stratégique pour le premier trimestre 2025. Notre équipe a identifié des synergies potentielles qui pourraient bénéficier à nos deux organisations.

Seriez-vous disponible pour une réunion la semaine prochaine ? Je peux m'adapter à votre emploi du temps.

Dans l'attente de votre retour,

Cordialement,
Marie Dubois
Directrice du Développement Commercial
TechCorp Solutions`,
      timestamp: new Date('2024-12-08T10:30:00'),
      isRead: false,
      isStarred: true,
      isImportant: true,
      labels: ['Business', 'Urgent'],
      attachments: [
        { name: 'Proposition_TechCorp_2025.pdf', size: '2.3 MB', type: 'pdf' },
        { name: 'Calendrier_projet.xlsx', size: '890 KB', type: 'excel' }
      ]
    },
    {
      id: '2',
      from: 'notifications@luvvix.com',
      to: user?.email || 'user@example.com',
      subject: '🚀 Nouvelles fonctionnalités LuvviX - Décembre 2024',
      body: `Découvrez les dernières améliorations de votre suite LuvviX !

✨ Nouvelles fonctionnalités :
• Assistant IA avancé dans LuvviX Mail
• Traduction automatique en temps réel
• Synchronisation améliorée avec le cloud
• Interface utilisateur redessinée

🔧 Améliorations :
• Performances accrues de 40%
• Sécurité renforcée
• Support de nouveaux formats de fichiers

Connectez-vous dès maintenant pour découvrir ces améliorations !

L'équipe LuvviX`,
      timestamp: new Date('2024-12-08T09:15:00'),
      isRead: true,
      isStarred: false,
      isImportant: false,
      labels: ['LuvviX', 'Updates']
    },
    {
      id: '3',
      from: 'jean.martin@innovcorp.fr',
      to: user?.email || 'user@example.com',
      subject: 'Re: Analyse des résultats Q4 - Action requise',
      body: `Merci pour votre analyse détaillée des résultats Q4.

Les chiffres sont effectivement encourageants, avec une croissance de 23% par rapport au trimestre précédent. J'ai quelques questions spécifiques :

1. Comment expliquez-vous le pic d'activité en novembre ?
2. Quelles sont vos recommandations pour maintenir cette tendance ?
3. Avez-vous identifié des risques potentiels pour Q1 ?

Pouvons-nous planifier une réunion cette semaine pour discuter de la stratégie 2025 ?

Bien à vous,
Jean Martin`,
      timestamp: new Date('2024-12-08T08:45:00'),
      isRead: false,
      isStarred: false,
      isImportant: true,
      labels: ['Work', 'Analysis']
    }
  ];

  useEffect(() => {
    setEmails(demoEmails);
  }, [user]);

  const generateAIInsights = async (email: Email) => {
    setIsLoadingAI(true);
    try {
      // Simulation d'analyse IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const insights: AIInsight[] = [
        {
          type: 'summary',
          content: `Résumé : ${email.subject.length > 50 ? email.subject.substring(0, 50) + '...' : email.subject}`,
          confidence: 0.92
        },
        {
          type: 'priority',
          content: email.isImportant ? 'Priorité élevée détectée' : 'Priorité normale',
          confidence: 0.88
        }
      ];

      if (email.attachments && email.attachments.length > 0) {
        insights.push({
          type: 'action',
          content: `${email.attachments.length} pièce(s) jointe(s) à examiner`,
          confidence: 0.95
        });
      }

      setAiInsights(insights);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur IA",
        description: "Impossible de générer les insights IA"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    generateAIInsights(email);
    
    // Marquer comme lu
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, isRead: true } : e
    ));
  };

  const folders = [
    { id: 'inbox', name: 'Boîte de réception', icon: Inbox, count: emails.filter(e => !e.isRead).length },
    { id: 'starred', name: 'Messages suivis', icon: Star, count: emails.filter(e => e.isStarred).length },
    { id: 'sent', name: 'Envoyés', icon: Send, count: 0 },
    { id: 'drafts', name: 'Brouillons', icon: FileText, count: 0 },
    { id: 'archive', name: 'Archives', icon: Archive, count: 0 },
    { id: 'trash', name: 'Corbeille', icon: Trash2, count: 0 }
  ];

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (currentFolder) {
      case 'starred':
        return matchesSearch && email.isStarred;
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
            
            <Button variant="ghost" size="icon">
              <RefreshCw className="w-4 h-4" />
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
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {folders.find(f => f.id === currentFolder)?.name}
              </h2>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <SortDesc className="w-4 h-4" />
                </Button>
              </div>
            </div>
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
                      !email.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                    onClick={() => handleEmailSelect(email)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {email.from.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            "text-sm truncate",
                            !email.isRead ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {email.from.split('@')[0]}
                          </p>
                          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                            {email.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            {email.isImportant && <Zap className="w-4 h-4 text-red-500" />}
                            <span className="text-xs text-gray-500">
                              {email.timestamp.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <p className={cn(
                          "text-sm truncate mb-1",
                          !email.isRead ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
                        )}>
                          {email.subject}
                        </p>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {email.body.substring(0, 100)}...
                        </p>
                        
                        {email.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {email.labels.map((label) => (
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
                      selectedEmail.isStarred ? "text-yellow-500 fill-current" : ""
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
                          <div key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-purple-700 dark:text-purple-300">
                              {insight.content}
                            </span>
                            <Badge variant="outline" className="ml-auto text-xs border-purple-300">
                              {Math.round(insight.confidence * 100)}%
                            </Badge>
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
                        {selectedEmail.from.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedEmail.from}
                      </p>
                      <p>à {selectedEmail.to}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1"></div>
                  
                  <div className="text-right">
                    <p>{selectedEmail.timestamp.toLocaleDateString('fr-FR')}</p>
                    <p>{selectedEmail.timestamp.toLocaleTimeString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="prose max-w-none dark:prose-invert">
                {selectedEmail.body.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
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
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500">{attachment.size}</p>
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
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Reply className="w-4 h-4 mr-2" />
                  Répondre
                </Button>
                <Button variant="outline">
                  <Forward className="w-4 h-4 mr-2" />
                  Transférer
                </Button>
                <Button variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Traduire
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
