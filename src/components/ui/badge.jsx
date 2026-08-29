/**
 * Badge Component (Re-export)
 *
 * This file re-exports the Badge component and its variant styles from the
 * parent components directory. It serves as a convenience alias so that
 * consumers can import from either `components/ui/badge` or `components/badge`.
 *
 * The Badge component is used to display small status indicators, labels,
 * or counts throughout the application (e.g., stock status, category tags).
 *
 * Re-exports:
 *   - Badge: The badge UI component
 *   - badgeVariants: Class variance authority (CVA) variants for badge styling
 */

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants } from '../badge';
