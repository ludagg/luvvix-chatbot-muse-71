
"use client";

import { useTheme } from "@/hooks/use-theme";
import { Toaster as Sonner } from "sonner";

interface ToasterProps {
  className?: string;
  toastOptions?: typeof Sonner.defaultProps;
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme === "light" ? "light" : "light"}
      className="toaster group"
      toastOptions={{ classNames: { toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg" } }}
      {...props}
    />
  );
};

export { Toaster };
