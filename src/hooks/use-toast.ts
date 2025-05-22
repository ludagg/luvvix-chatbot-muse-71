
import * as React from "react";
import { toast as sonnerToast } from "sonner";

export type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>;
export type ToastActionElement = React.ReactNode;

const toast = sonnerToast;

export { toast };

export function useToast() {
  return {
    toast: sonnerToast,
    dismiss: sonnerToast.dismiss,
    message: sonnerToast.message,
    success: sonnerToast.success,
    error: sonnerToast.error,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
    custom: sonnerToast.custom,
    promise: sonnerToast.promise,
    loading: sonnerToast.loading,
  };
}
