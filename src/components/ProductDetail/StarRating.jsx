import { Star } from 'lucide-react';

export function StarRating({ rating = 0, reviews = 0, size = 4 }) {
  const rounded = Math.round(Number(rating || 0));
  const sizeClass = size === 3 ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-2" aria-label={`${rounded} out of 5 stars`}>
      <div className="flex" role="img" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rounded
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted-foreground'
            }`}
          />
        ))}
      </div>
      {reviews > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviews} reviews)
        </span>
      )}
    </div>
  );
}
