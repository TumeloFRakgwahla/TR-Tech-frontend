/**
 * Card Component
 *
 * A composable card layout system used to group related content in a visually
 * distinct container. The card uses a dark theme (slate-800 background) with
 * subtle borders and shadows.
 *
 * Components:
 *   - Card: The outer container with rounded corners, border, and shadow
 *   - CardHeader: Top section with flex column layout and padding
 *   - CardTitle: Large heading element (h3) for the card title
 *   - CardDescription: Smaller muted text for subtitles or descriptions
 *   - CardContent: Main content area with padding (no top padding to flow from header)
 *   - CardFooter: Bottom section with flex row layout for actions
 *
 * All sub-components use React.forwardRef to support ref forwarding and the
 * cn() utility for merging Tailwind classes with custom className props.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

// Main card container - provides the visual card wrapper with dark theme styling
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-slate-800 text-white shadow-sm border-slate-700",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

// Card header section - vertical flex layout with spacing for title/description groups
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Card title - large, bold heading with tight tracking
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// Card description - muted secondary text for subtitles
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// Card content area - main body padding with no top padding (connects to header)
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

// Card footer - flex row layout typically used for action buttons
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
