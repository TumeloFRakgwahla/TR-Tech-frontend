/**
 * Progress Component
 *
 * A visual progress indicator built on Radix UI's Progress primitive.
 * Displays completion percentage with a blue fill bar on a dark track.
 *
 * Features:
 *   - Animated fill indicator with smooth transitions
 *   - Dark track background (slate-700)
 *   - Blue fill color (blue-600)
 *   - Accessible ARIA attributes (value, min, max) via Radix primitive
 *   - Value range: 0-100 (percentage)
 *
 * Usage:
 *   <Progress value={75} /> // Shows 75% filled
 */

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "../../lib/utils"

// Progress bar with animated fill indicator
// The indicator uses translateX transform to reveal/hide the fill based on value
const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-slate-700",
      className
    )}
    {...props}
  >
    {/* Fill indicator - translateX creates the progress effect by sliding the bar */}
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-blue-600 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
