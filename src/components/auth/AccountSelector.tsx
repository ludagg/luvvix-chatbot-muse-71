
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, User, ArrowRight, X } from 'lucide-react';
import { multiAccountService, StoredAccount } from '@/services/multi-account-service';
import { useToast } from '@/hooks/use-toast';

interface AccountSelectorProps {
  onAccountSelect: (userId: string) => void;
  onAddNewAccount: () => void;
  onClose: () => void;
}

const AccountSelector = ({ onAccountSelect, onAddNewAccount, onClose }: AccountSelectorProps) => {
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const storedAccounts = await multiAccountService.getAccountForQuickLogin();
      setAccounts(storedAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les comptes sauvegardés"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = async (userId: string) => {
    try {
      const success = await multiAccountService.switchAccount(userId);
      if (success) {
        onAccountSelect(userId);
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Impossible de restaurer la session. Veuillez vous reconnecter."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de changer de compte"
      });
    }
  };

  const handleRemoveAccount = async (userId: string) => {
    try {
      await multiAccountService.removeAccount(userId);
      setAccounts(accounts.filter(acc => acc.user_id !== userId));
      toast({
        title: "Compte supprimé",
        description: "Le compte a été retiré de cet appareil"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le compte"
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des comptes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Choisir un compte
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Aucun compte sauvegardé sur cet appareil
              </p>
              <Button onClick={onAddNewAccount} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
            </div>
          ) : (
            <>
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                  onClick={() => handleAccountSelect(account.user_id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={account.account_data.avatar_url} />
                      <AvatarFallback>
                        {account.account_data.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.account_data.full_name || account.account_data.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {account.account_data.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Dernière utilisation: {new Date(account.last_used_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAccount(account.user_id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                  </div>
                </motion.div>
              ))}
              
              <Button 
                onClick={onAddNewAccount} 
                variant="outline" 
                className="w-full justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un autre compte
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccountSelector;
