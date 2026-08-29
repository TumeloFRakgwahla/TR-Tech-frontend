/**
 * Separator Component
 *
 * A visual divider component built on Radix UI's Separator primitive.
 * Used to create visual separation between content sections, either
 * horizontally or vertically.
 *
 * Features:
 *   - Horizontal or vertical orientation
 *   - Decorative by default (hidden from screen readers)
 *   - Shrinks to fit available space (shrink-0)
 *   - Uses theme border color for consistent styling
 *
 * Props:
 *   - orientation: "horizontal" (default) or "vertical"
 *   - decorative: boolean (default true) - when true, hidden from a11y tree
 */

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "../../lib/utils"

// Divider line - horizontal (full width, 1px height) or vertical (full height, 1px width)
const Separator = React.forwardRef(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
