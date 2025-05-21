
import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProBadge({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-xs shadow-lg",
      className
    )}>
      <Sparkles className="h-3 w-3" />
      <span className="font-medium">PRO</span>
    </div>
  );
}

export default ProBadge;
