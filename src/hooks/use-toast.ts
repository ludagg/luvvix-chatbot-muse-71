
import { toast as sonnerToast } from "sonner";

// Import the types from the shadcn toast component
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Create a state variable to store the toasts
const TOAST_LIMIT = 5;
let TOASTS: ToasterToast[] = [];

const useToast = () => {
  // Standardized toast function that handles all toast variants
  const toast = (props: ToasterToast | string, options?: any) => {
    // Handle different call patterns
    if (typeof props === 'string') {
      // Toast was called with title as first arg and options as second
      const title = props;
      const description = options?.description;
      
      if (options?.variant === 'destructive') {
        sonnerToast.error(title, { description });
      } else {
        sonnerToast(title, { description });
      }
      
      // For compatibility with shadcn toast component
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { 
        id, 
        title, 
        description, 
        ...options 
      };
      
      TOASTS = [newToast, ...TOASTS].slice(0, TOAST_LIMIT);
      return id;
    } else {
      // Toast was called with full props object
      if (props.variant === "destructive") {
        sonnerToast.error(props.title as string, {
          description: props.description,
        });
      } else {
        sonnerToast(props.title as string, {
          description: props.description,
        });
      }

      // For compatibility with shadcn toast component
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, ...props };

      TOASTS = [newToast, ...TOASTS].slice(0, TOAST_LIMIT);
      return id;
    }
  };

  // Add convenience methods to match sonner's API
  toast.error = (title: string, options?: any) => {
    return toast({ title, ...options, variant: "destructive" });
  };
  
  toast.success = (title: string, options?: any) => {
    return sonnerToast.success(title, options);
  };
  
  toast.warning = (title: string, options?: any) => {
    return sonnerToast(title, { ...options, className: "bg-yellow-500" });
  };
  
  toast.info = (title: string, options?: any) => {
    return sonnerToast.info(title, options);
  };

  const dismiss = (toastId?: string) => {
    // Dismiss specific toast in sonner
    if (toastId) {
      sonnerToast.dismiss(toastId);
    }

    // For compatibility with shadcn toast component
    TOASTS = toastId
      ? TOASTS.filter((toast) => toast.id !== toastId)
      : [];
  };

  return {
    toast,
    dismiss,
    toasts: TOASTS,
  };
};

// Export the hook and a singleton instance of toast
const { toast } = useToast();
export { useToast, toast };
