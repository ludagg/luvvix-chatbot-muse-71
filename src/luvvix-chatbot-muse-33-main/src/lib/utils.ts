
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Re-export the utility functions from the main app
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
