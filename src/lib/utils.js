/**
 * TR-Tech Frontend — Utility Library
 *
 * Lightweight helpers shared across components.
 * Currently provides a className merger compatible with Tailwind CSS.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Merges class names intelligently.
 *
 * - clsx concatenates conditional class strings.
 * - twMerge resolves Tailwind conflicts (e.g. "p-4 p-2" becomes "p-2").
 *
 * This is the standard pattern for dynamic Tailwind classes in this app.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
