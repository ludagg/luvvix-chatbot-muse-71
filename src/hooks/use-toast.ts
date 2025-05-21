
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

interface ToastOptions {
  description?: string;
  variant?: "default" | "destructive";
  [key: string]: any;
}

const useToast = () => {
  // Helper function to generate a unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
  // Base toast function that handles string and object formats
  const toast = (titleOrProps: string | Partial<ToasterToast>, options?: ToastOptions) => {
    if (typeof titleOrProps === 'string') {
      // Called with title as a string
      const title = titleOrProps;
      const id = generateId();
      const variant = options?.variant || "default";
      const description = options?.description;
      
      // Call the appropriate sonner toast function
      if (variant === 'destructive') {
        sonnerToast.error(title, { description });
      } else {
        sonnerToast(title, { description });
      }
      
      // Create toast object for shadcn compatibility
      const newToast = { 
        id, 
        title, 
        description, 
        variant,
        ...options 
      } as ToasterToast;
      
      TOASTS = [newToast, ...TOASTS].slice(0, TOAST_LIMIT);
      return id;
    } else {
      // Called with an object
      // Create a new object with an ID if it doesn't have one
      const id = titleOrProps.id || generateId();
      const newToast = { ...titleOrProps, id } as ToasterToast;
      
      // Call the appropriate sonner toast function
      if (newToast.variant === "destructive") {
        sonnerToast.error(newToast.title as string, {
          description: newToast.description,
        });
      } else {
        sonnerToast(newToast.title as string, {
          description: newToast.description,
        });
      }

      TOASTS = [newToast, ...TOASTS].slice(0, TOAST_LIMIT);
      return id;
    }
  };

  // Add convenience methods to match sonner's API and support different calling patterns
  toast.error = (title: string, options?: ToastOptions) => {
    return toast(title, { ...options, variant: "destructive" });
  };
  
  toast.success = (title: string, options?: ToastOptions) => {
    sonnerToast.success(title, options);
    
    const id = generateId();
    const newToast = { 
      id, 
      title, 
      description: options?.description,
      ...options 
    } as ToasterToast;
    
    TOASTS = [newToast, ...TOASTS].slice(0, TOAST_LIMIT);
    return id;
  };
  
  toast.warning = (title: string, options?: ToastOptions) => {
    sonnerToast.warning ? 
      sonnerToast.warning(title, options) : 
      sonnerToast(title, { ...options, className: "bg-yellow-500" });
    
    const id = generateId();
    const newToast = { 
      id, 
      title, 
      description: options?.description,
      ...options 
    } as ToasterToast;
    
    TOASTS = [newToast, ...TOASTS].slice(0, TOAST_LIMIT);
    return id;
  };
  
  toast.info = (title: string, options?: ToastOptions) => {
    sonnerToast.info(title, options);
    
    const id = generateId();
    const newToast = { 
      id, 
      title, 
      description: options?.description,
      ...options 
    } as ToasterToast;
    
    TOASTS = [newToast, ...TOASTS].slice(0, TOAST_LIMIT);
    return id;
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
const { toast, dismiss, toasts } = useToast();
export { useToast, toast, dismiss, toasts };
