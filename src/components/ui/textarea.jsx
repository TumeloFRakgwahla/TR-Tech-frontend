/**
 * Textarea Component
 *
 * A styled multi-line text input component for forms. Features a dark
 * theme with slate-700 background, blue focus ring, and consistent
 * sizing with the Input component.
 *
 * Features:
 *   - Minimum height of 80px for multi-line content
 *   - Dark theme styling (slate-700 background, slate-600 border)
 *   - Blue focus ring for accessibility
 *   - Placeholder text in muted slate-400
 *   - Disabled state with reduced opacity and not-allowed cursor
 *   - Ref forwarding for form library integration
 */

import * as React from "react"

import { cn } from "../../lib/utils"

// Multi-line text input with dark theme styling and focus states
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
