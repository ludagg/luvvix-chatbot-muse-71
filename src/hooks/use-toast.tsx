
// Importing from React directly
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react"; // Use X from lucide-react
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type ToastProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof toastVariants> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    onClose?: () => void;
  };

const Toast = React.forwardRef<React.ElementRef<"div">, ToastProps>(
  ({ className, variant, title, description, action, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="grid gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        {action}
        <button
          className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    );
  }
);
Toast.displayName = "Toast";

// Create components for ToastTitle, ToastDescription, and ToastClose
const ToastTitle = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

const ToastClose = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
));
ToastClose.displayName = "ToastClose";

type ToastActionElement = React.ReactElement<{
  onClick?: () => void;
}>;

const ToastAction = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

type ToastViewport = React.ComponentPropsWithoutRef<"ol">;

const ToastViewport = React.forwardRef<
  React.ElementRef<"ol">,
  ToastViewport
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

// Create react context for toast
type ToastProviderProps = {
  children: React.ReactNode;
  swipeDirection?: "right" | "left" | "up" | "down";
  swipeThreshold?: number;
  label?: string;
};

type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

const ToastContext = React.createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, "id">>) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  updateToast: () => {},
});

// Create a ToastProvider component
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    setToasts((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), ...toast },
    ]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = React.useCallback(
    (id: string, toast: Partial<Omit<Toast, "id">>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
      );
    },
    []
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, updateToast }}
    >
      {children}
    </ToastContext.Provider>
  );
};

function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toasts: context.toasts,
    toast: (props: Omit<Toast, "id">) => {
      context.addToast(props);
    },
    dismiss: (id: string) => {
      context.removeToast(id);
    },
    update: (id: string, props: Partial<Omit<Toast, "id">>) => {
      context.updateToast(id, props);
    },
  };
}

// Simple utility for toast
const toast = {
  default: (props: Omit<Toast, "id" | "variant">) => {
    const { addToast } = React.useContext(ToastContext);
    if (addToast) {
      addToast({ ...props, variant: "default" });
    }
  },
  destructive: (props: Omit<Toast, "id" | "variant">) => {
    const { addToast } = React.useContext(ToastContext);
    if (addToast) {
      addToast({ ...props, variant: "destructive" });
    }
  },
};

export {
  type ToastProps,
  type ToastActionElement,
  Toast,
  ToastAction,
  ToastViewport,
  ToastContext,
  // Export the new components
  ToastTitle,
  ToastDescription,
  ToastClose,
  useToast,
  toast,
};
