
import { ReactNode } from 'react';
import { Header } from '@/components/Header';

interface HeaderWrapperProps {
  onOpenAuth?: (mode: "login" | "register") => void;
  onOpenProfile?: () => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
  children?: ReactNode;
}

export function HeaderWrapper({ 
  onOpenAuth, 
  onOpenProfile, 
  isSidebarOpen, 
  setIsSidebarOpen,
  children
}: HeaderWrapperProps) {
  // Instead of passing these props directly to Header, we'll just render the Header
  // and provide the children if any were passed
  return (
    <>
      <Header />
      {children}
    </>
  );
}
