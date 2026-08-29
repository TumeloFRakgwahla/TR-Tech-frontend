/**
 * Label Component
 *
 * A styled label element for form fields. Provides consistent typography
 * and integrates with the peer disabled state pattern to automatically
 * style labels when their associated input is disabled.
 *
 * Features:
 *   - Small, medium-weight font for form labels
 *   - peer-disabled styling: automatically reduces opacity and shows
 *     not-allowed cursor when associated input is disabled
 *   - Ref forwarding for form library integration
 */

import * as React from "react"
import { cn } from "../../lib/utils"

// Label element with peer-disabled support for form field associations
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
