
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
  const toast = (props: Omit<ToasterToast, "id">) => {
    // Use sonner toast for modern notifications
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

export { useToast, sonnerToast as toast };
