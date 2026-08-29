/**
 * Button Component (Re-export)
 *
 * This file re-exports the Button component and its variant styles from the
 * parent components directory. It serves as a convenience alias so that
 * consumers can import from either `components/ui/button` or `components/button`.
 *
 * The Button component is the primary interactive element used throughout the
 * application for actions like form submissions, navigation triggers, and
 * call-to-action buttons. It supports multiple visual variants (primary,
 * secondary, outline, ghost, destructive) and sizes.
 *
 * Re-exports:
 *   - Button: The button UI component
 *   - buttonVariants: Class variance authority (CVA) variants for button styling
 */

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants } from '../button';
