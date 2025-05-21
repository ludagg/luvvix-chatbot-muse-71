
import { useToast as useToastUI } from "@/components/ui/use-toast";
import type { ToastProps } from "@/components/ui/use-toast";

// Re-export the toast hook from the main app to ensure consistent toasts
export const useToast = useToastUI;

export type { ToastProps };
