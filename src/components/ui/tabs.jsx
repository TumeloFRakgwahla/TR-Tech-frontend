/**
 * Tabs Component
 *
 * A tabbed interface component built on Radix UI's Tabs primitive.
 * Provides accessible tab navigation with animated active states.
 *
 * Features:
 *   - Dark theme styling (slate-700 background for tab list)
 *   - Blue active state for selected tab (bg-blue-600, text-white)
 *   - Keyboard navigation support (arrow keys to switch tabs)
 *   - Animated transitions between tab states
 *   - Content panels mount/unmount based on active tab
 *
 * Components:
 *   - Tabs: Root context provider
 *   - TabsList: Container for tab triggers with rounded background
 *   - TabsTrigger: Individual tab button with active state styling
 *   - TabsContent: Panel that renders when its tab is active
 */

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

// Root - manages tab selection state
const Tabs = TabsPrimitive.Root;

// List - flex container with dark background for tab buttons
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-slate-700 p-1 text-slate-400',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// Trigger - individual tab button with blue active state
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// Content - panel that shows when associated tab is active
const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
