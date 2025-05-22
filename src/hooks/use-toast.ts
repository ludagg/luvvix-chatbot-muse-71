
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

export type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>;
export type ToastActionElement = React.ReactNode;

export function useToast() {
  return {
    toast,
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

export function toast(props: ToastProps) {
  sonnerToast(props);
}

export { sonnerToast };
