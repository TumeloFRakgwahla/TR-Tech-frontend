/**
 * StarRating Component
 *
 * Displays a visual star rating with optional review count.
 * Rounds the rating to the nearest integer for display.
 *
 * Features:
 *   - Configurable star size (3 = small, 4 = default)
 *   - Filled stars in amber for rated portion
 *   - Empty stars in muted color for unrated portion
 *   - Review count display next to stars
 *   - Accessible with aria-label showing rating value
 *
 * Props:
 *   - rating: Numeric rating value (will be rounded to nearest integer)
 *   - reviews: Number of reviews to display (optional)
 *   - size: Star size - 3 for small (h-3 w-3), 4 for default (h-4 w-4)
 */

import { Star } from 'lucide-react';

export function StarRating({ rating = 0, reviews = 0, size = 4 }) {
  // Round rating to nearest integer for star display
  const rounded = Math.round(Number(rating || 0));
  // Determine star size class based on size prop
  const sizeClass = size === 3 ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-2" aria-label={`${rounded} out of 5 stars`}>
      <div className="flex" role="img" aria-hidden="true">
        {/* Render 5 stars, filling based on rounded rating */}
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rounded
                ? 'fill-amber-400 text-amber-400'      // Filled star (amber)
                : 'fill-muted text-muted-foreground'    // Empty star (muted)
            }`}
          />
        ))}
      </div>
      {/* Review count display - only shown if reviews > 0 */}
      {reviews > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviews} reviews)
        </span>
      )}
    </div>
  );
}
