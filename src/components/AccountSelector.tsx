
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown, User, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface Account {
  id: string;
  email: string;
  avatarUrl?: string | null;
  fullName?: string | null;
  lastUsed?: string;
  isActive?: boolean;
}

interface AccountSelectorProps {
  currentUser: {
    id: string;
    email: string;
    avatarUrl?: string;
    fullName?: string;
  };
  onLogout: () => Promise<void>;
}

const AccountSelector = ({ currentUser, onLogout }: AccountSelectorProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get accounts from localStorage
    const getStoredAccounts = () => {
      try {
        const storedAccounts = localStorage.getItem('luvvix_accounts');
        if (storedAccounts) {
          const parsed = JSON.parse(storedAccounts);
          // Make sure current user is included
          const hasCurrentUser = parsed.some((acc: Account) => acc.id === currentUser.id);
          
          if (!hasCurrentUser) {
            const updatedAccounts = [
              ...parsed,
              {
                id: currentUser.id,
                email: currentUser.email,
                avatarUrl: currentUser.avatarUrl,
                fullName: currentUser.fullName,
                lastUsed: new Date().toISOString(),
                isActive: true
              }
            ];
            localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
            return updatedAccounts;
          }
          
          // Mark current user as active
          const updatedAccounts = parsed.map((acc: Account) => ({
            ...acc,
            isActive: acc.id === currentUser.id
          }));
          localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
          return updatedAccounts;
        }
        
        // Initialize accounts if none stored
        const initialAccounts = [{
          id: currentUser.id,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          fullName: currentUser.fullName,
          lastUsed: new Date().toISOString(),
          isActive: true
        }];
        localStorage.setItem('luvvix_accounts', JSON.stringify(initialAccounts));
        return initialAccounts;
      } catch (error) {
        console.error('Error loading accounts:', error);
        return [{
          id: currentUser.id,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          fullName: currentUser.fullName,
          lastUsed: new Date().toISOString(),
          isActive: true
        }];
      }
    };
    
    setAccounts(getStoredAccounts());
  }, [currentUser]);

  const handleAddAccount = () => {
    // Save current accounts without logging out
    localStorage.setItem('luvvix_accounts', JSON.stringify(accounts));
    
    // Redirect to sign in without logout
    navigate('/auth?add_account=true');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      
      // Update stored accounts
      const updatedAccounts = accounts.map(acc => ({
        ...acc,
        isActive: false
      }));
      localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
      
      // Redirect to login
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Une erreur est survenue lors de la déconnexion.");
    }
  };

  const handleGlobalLogout = async () => {
    try {
      // Sign out current session
      await onLogout();
      
      // Clear all stored accounts
      localStorage.removeItem('luvvix_accounts');
      
      toast.success("Vous avez été déconnecté de tous les comptes.");
      
      // Redirect to login
      navigate('/auth');
    } catch (error) {
      console.error('Error during global logout:', error);
      toast.error("Une erreur est survenue lors de la déconnexion globale.");
    }
  };

  const switchToAccount = async (account: Account) => {
    if (account.id === currentUser.id) {
      setIsOpen(false);
      return;
    }
    
    try {
      // Update account information first, marking the selected account as active
      const updatedAccounts = accounts.map(acc => ({
        ...acc,
        isActive: acc.id === account.id,
        lastUsed: acc.id === account.id ? new Date().toISOString() : acc.lastUsed
      }));
      localStorage.setItem('luvvix_accounts', JSON.stringify(updatedAccounts));
      
      // Sign out current user
      await supabase.auth.signOut();
      
      // Directly navigate to dashboard - the session will be established on next load
      toast.success(`Connexion avec ${account.fullName || account.email} en cours...`);
      
      // Redirect to dashboard, letting the automatic session restoration handle the login
      navigate('/dashboard');
    } catch (error) {
      console.error('Error switching account:', error);
      toast.error("Une erreur est survenue lors du changement de compte.");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.email} 
                      className="w-5 h-5 rounded-full mr-2"
                    />
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  <span className="truncate max-w-[150px]">
                    {currentUser.fullName || currentUser.email}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              {accounts.map(account => (
                <DropdownMenuItem
                  key={account.id}
                  className={`flex items-center ${account.isActive ? 'bg-gray-100' : ''}`}
                  onClick={() => switchToAccount(account)}
                >
                  {account.avatarUrl ? (
                    <img 
                      src={account.avatarUrl} 
                      alt={account.email} 
                      className="w-5 h-5 rounded-full mr-2"
                    />
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm">{account.fullName || account.email}</span>
                    {account.fullName && (
                      <span className="text-xs text-gray-500 truncate max-w-[180px]">
                        {account.email}
                      </span>
                    )}
                  </div>
                  {account.isActive && (
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuItem 
                className="flex items-center text-blue-600"
                onClick={handleAddAccount}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>Ajouter un compte</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center text-red-600"
                onClick={handleGlobalLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Déconnexion de tous les comptes</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSelector;
