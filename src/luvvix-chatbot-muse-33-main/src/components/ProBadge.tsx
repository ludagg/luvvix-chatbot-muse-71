
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/luvvix-chatbot-muse-33-main/src/lib/utils';

interface ProBadgeProps {
  size?: 'sm' | 'default';
  className?: string;
}

export function ProBadge({ size = 'default', className }: ProBadgeProps) {
  return (
    <div className={cn(
      "flex items-center rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-black font-semibold",
      size === 'sm' 
        ? "text-[0.65rem] py-0.5 px-1.5" 
        : "text-xs py-1 px-2",
      className
    )}>
      <Star className={size === 'sm' ? "w-2.5 h-2.5 mr-0.5" : "w-3 h-3 mr-1"} fill="currentColor" />
      <span>Pro</span>
    </div>
  );
}

export default ProBadge;
