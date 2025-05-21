
import { useToast as useToastOriginal, toast as toastOriginal, ToastActionElement as ToastActionElementType, ToastProps as ToastPropsType } from "@/hooks/use-toast";
import { toast as sonnerToastOriginal } from "sonner";

export type ToastProps = ToastPropsType;
export type ToastActionElement = ToastActionElementType;

export const useToast = useToastOriginal;
export const toast = toastOriginal;
export const sonnerToast = sonnerToastOriginal;
