
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface AppIconProps {
  name: string;
  description?: string;
  icon: LucideIcon;
  to: string;
  color: string;
  className?: string;
}

const AppIcon = ({ name, description, icon: Icon, to, color, className }: AppIconProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl transition-all",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "border border-gray-200 dark:border-gray-700",
        "group cursor-pointer",
        className
      )}
    >
      <div 
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-3",
          "transition-transform group-hover:scale-110",
          color
        )}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-base font-medium">{name}</h3>
      {description && <p className="text-xs text-gray-500 mt-1 text-center">{description}</p>}
    </Link>
  );
};

export default AppIcon;
