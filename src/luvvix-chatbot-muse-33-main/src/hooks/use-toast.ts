
import { useToast as useToastOriginal } from "@/components/ui/use-toast";
import { toast as toastOriginal } from "@/components/ui/use-toast";
import { sonnerToast as sonnerToastOriginal } from "@/components/ui/use-toast";

// Exportations des types nécessaires
export type ToastActionElement = React.ReactElement<HTMLButtonElement>;
export type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

// Re-export des fonctions
export const useToast = useToastOriginal;
export const toast = toastOriginal;
export const sonnerToast = sonnerToastOriginal;
