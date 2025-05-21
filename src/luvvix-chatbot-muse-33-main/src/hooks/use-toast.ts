
// Re-export the main use-toast hook from the root project
import { useToast, toast, sonnerToast } from '@/hooks/use-toast';

// Export everything
export { useToast, toast, sonnerToast };

// Re-export the types but rename the conflicting one
import { type ToastProps as MainToastProps } from '@/hooks/use-toast';
export type LuvvixToastProps = MainToastProps;
