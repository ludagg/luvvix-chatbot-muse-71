
// Import directly from the UI components
import { useToast as useUIToast } from "@/components/ui/use-toast";
import { toast as uiToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

// Export the hooks and functions
export const useToast = useUIToast;
export const toast = uiToast;
export { sonnerToast };

export type { ToastProps };
