
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const ProBadge = ({ className, size = "md" }: ProBadgeProps) => {
  const sizeClasses = {
    sm: "text-[8px] px-1.5 py-0.5 gap-0.5",
    md: "text-xs px-2 py-0.5 gap-1",
    lg: "text-sm px-2.5 py-1 gap-1.5"
  };
  
  const iconSizes = {
    sm: 8,
    md: 10,
    lg: 12
  };
  
  return (
    <span className={cn(
      "bg-amber-500/20 text-amber-500 rounded-full flex items-center font-medium",
      sizeClasses[size],
      className
    )}>
      <Star size={iconSizes[size]} className="fill-amber-500" /> 
      Pro
    </span>
  );
};
