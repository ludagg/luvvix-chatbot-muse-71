
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  status?: 'default' | 'error' | 'success' | 'warning';
  showPercentage?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, status = 'default', showPercentage = false, ...props }, ref) => {
  // Determine the indicator color based on status
  const getIndicatorClass = () => {
    switch (status) {
      case 'error':
        return "bg-gradient-to-r from-red-500 to-red-600";
      case 'warning':
        return "bg-gradient-to-r from-yellow-500 to-amber-500";
      case 'success':
        return "bg-gradient-to-r from-green-500 to-teal-500";
      default:
        return "bg-gradient-to-r from-purple-500 to-indigo-500";
    }
  };

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-300",
            getIndicatorClass(),
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showPercentage && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {Math.round(value || 0)}%
        </span>
      )}
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
