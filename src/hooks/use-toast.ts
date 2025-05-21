import { useToast, toast, sonnerToast } from "@/components/ui/use-toast";

// Re-export des fonctions
export { useToast, toast, sonnerToast };

// Types exportés
export type ToastActionElement = React.ReactElement<HTMLButtonElement>;
export type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};