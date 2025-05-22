
import { toast, useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { toast } = useToast();

  return (
    <ToastProvider>
      <Sonner />
      <ToastViewport />
    </ToastProvider>
  );
}
