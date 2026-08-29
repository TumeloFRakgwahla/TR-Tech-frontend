/**
 * Input Component
 *
 * A styled text input component that serves as the primary form field
 * throughout the application. Features a dark theme with slate-700 background,
 * blue focus ring, and consistent sizing.
 *
 * Features:
 *   - Full-width layout with standard height (h-10)
 *   - Dark theme styling (slate-700 background, slate-600 border)
 *   - Blue focus ring for accessibility
 *   - File input styling support (transparent background for file buttons)
 *   - Placeholder text in muted slate-400
 *   - Disabled state with reduced opacity and not-allowed cursor
 *   - Ref forwarding for form library integration
 */

import * as React from "react"

import { cn } from "../../lib/utils"

// Input field with dark theme styling and focus states
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
