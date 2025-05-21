
import * as React from "react"
import { cn } from "@/lib/utils"

export interface HoverGlowCardProps {
  children: React.ReactNode
  className?: string
}

export const HoverGlowCard = ({ children, className }: HoverGlowCardProps) => {
  return (
    <div
      className={cn(
        "group relative h-full w-full rounded-xl bg-transparent p-0",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-gradient-to-t from-neutral-50 via-neutral-100 to-neutral-50 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"
      />
      <div className="absolute inset-0.5 rounded-xl bg-gradient-to-b from-neutral-50 to-neutral-100 p-px dark:from-neutral-800 dark:to-neutral-900">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-neutral-50 via-neutral-100 to-neutral-50 opacity-0 transition duration-300 group-hover:opacity-100 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800" />
      </div>
      <div className="relative h-full w-full rounded-xl bg-background">{children}</div>
    </div>
  )
}
