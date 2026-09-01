/**
 * Dialog Component
 *
 * A modal dialog component built on top of Radix UI's Dialog primitive.
 * Provides accessible, animated modal windows with overlay, close behavior,
 * and keyboard navigation support.
 *
 * Features:
 *   - Centered positioning with smooth enter/exit animations
 *   - Dark overlay backdrop (80% black opacity)
 *   - Built-in close button with X icon
 *   - Composable header, footer, title, and description sections
 *   - Full accessibility support (focus trap, ESC to close, ARIA attributes)
 *
 * Components:
 *   - Dialog: Root context provider (controls open/close state)
 *   - DialogTrigger: Button that opens the dialog
 *   - DialogPortal: Renders dialog in a portal (outside DOM hierarchy)
 *   - DialogOverlay: Semi-transparent backdrop behind the dialog
 *   - DialogClose: Button that closes the dialog
 *   - DialogContent: The main dialog container with animations
 *   - DialogHeader: Flex column layout for title/description
 *   - DialogFooter: Flex row layout for action buttons (reversed on mobile)
 *   - DialogTitle: Accessible heading for the dialog
 *   - DialogDescription: Accessible description text
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

// Root component - manages dialog open/close state
const Dialog = DialogPrimitive.Root

// Trigger element - the button/interactive element that opens the dialog
const DialogTrigger = DialogPrimitive.Trigger

// Portal - renders dialog content in a portal to avoid z-index issues
const DialogPortal = DialogPrimitive.Portal

// Close element - the button/interactive element that closes the dialog
const DialogClose = DialogPrimitive.Close

// Overlay - semi-transparent backdrop with fade animations
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Content - the main dialog panel with centering, animations, and close button
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-700 bg-slate-800 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

// Header section - vertical layout for dialog title and description
const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

// Footer section - action buttons layout (stacked on mobile, row on desktop)
const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

// Title - accessible heading element for the dialog
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

// Description - accessible secondary text for additional context
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
