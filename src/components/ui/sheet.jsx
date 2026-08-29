/**
 * Sheet Component (Slide-out Panel)
 *
 * A slide-out panel component built on Radix UI's Dialog primitive.
 * Unlike the centered Dialog, the Sheet slides in from the right edge
 * of the screen, making it ideal for mobile menus, filters, or detail panels.
 *
 * Features:
 *   - Slides in from the right side of the viewport
 *   - Full-height panel with shadow and border
 *   - Semi-transparent overlay backdrop
 *   - Built-in close button with X icon
 *   - Composable header, title, and description sections
 *
 * Components:
 *   - Dialog: Root context provider
 *   - DialogTrigger: Button that opens the sheet
 *   - DialogPortal: Renders sheet in a portal
 *   - DialogOverlay: Semi-transparent backdrop
 *   - DialogClose: Button that closes the sheet
 *   - DialogContent: The slide-out panel container
 *   - DialogHeader: Flex column layout for title/description
 *   - DialogTitle: Accessible heading for the sheet
 *   - DialogDescription: Accessible description text
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";

// Root - manages sheet open/close state
const Dialog = DialogPrimitive.Root;
// Trigger - the button/interactive element that opens the sheet
const DialogTrigger = DialogPrimitive.Trigger;
// Portal - renders sheet content in a portal
const DialogPortal = DialogPrimitive.Portal;
// Close - the button/interactive element that closes the sheet
const DialogClose = DialogPrimitive.Close;

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
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Content - the slide-out panel positioned at right edge with slide animation
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-50 h-full w-full border-l bg-background shadow-lg animate-slide-in-from-right",
        className
      )}
      {...props}
    >
      {children}
      {/* Close button positioned in top-right corner of sheet */}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Header section - vertical layout for sheet title and description
const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

// Title - accessible heading element for the sheet
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Description - accessible secondary text for additional context
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
