
import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { toast as shadcnToast } from "@/hooks/use-toast";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export const useToast = useShadcnToast;

export const toast = (props: ToastProps) => {
  return shadcnToast(props);
};

export const sonnerToast = shadcnToast;

export type { ToastProps };
