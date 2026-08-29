/**
 * Table Component
 *
 * A composable table layout system for displaying tabular data.
 * All sub-components use React.forwardRef for ref forwarding and
 * the cn() utility for class merging.
 *
 * Components:
 *   - Table: Outer wrapper with overflow scroll and inner table element
 *   - TableHeader: Thead with bottom border styling
 *   - TableBody: Tbody with no border on last row
 *   - TableFooter: Tfoot with top border and slate-700 background
 *   - TableRow: Tr with hover state and selected state highlighting
 *   - TableHead: Th with muted text and consistent padding
 *   - TableCell: Td with white text and middle alignment
 *   - TableCaption: Caption with muted text
 *
 * Features:
 *   - Dark theme styling (slate-700 borders, alternating row backgrounds)
 *   - Hover highlighting on rows
 *   - Selected state for active rows
 *   - Responsive overflow handling
 */

import * as React from "react"

import { cn } from "../../lib/utils"

// Wrapper div with overflow handling and inner table element
const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

// Table header - column headers row group with bottom border
const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b border-slate-700", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

// Table body - data rows with no border on last row
const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

// Table footer - summary row with top border and darker background
const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-slate-700 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

// Table row - data row with hover and selected states
const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-700 transition-colors hover:bg-slate-700/50 data-[state=selected]:bg-slate-700",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

// Table header cell - column header with muted text and left alignment
const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-slate-400 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

// Table cell - data cell with white text and middle alignment
const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle text-white [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

// Table caption - descriptive text below the table
const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-slate-400", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
