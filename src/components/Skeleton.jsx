/**
 * Skeleton Loader Components
 *
 * Reusable skeleton components for better perceived performance
 * during data loading states.
 */

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-muted/60 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden border border-border ${className}`}
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/4 mt-2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="px-3 pb-3">
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 8, columns = 2 }) {
  return (
    <div
      className={`grid gap-3 sm:gap-4`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonCarousel({ count = 5, className = '' }) {
  return (
    <div
      className={`flex gap-3 overflow-hidden px-4 ${className}`}
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="min-w-[160px] max-w-[180px]"
          aria-hidden="true"
        >
          <div className="bg-white rounded-xl overflow-hidden border border-border">
            <Skeleton className="aspect-square rounded-none" />
            <div className="p-2.5 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <div className="px-2.5 pb-2.5">
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail({ className = '' }) {
  return (
    <div className={`space-y-6 ${className}`} role="status" aria-label="Loading product details">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 flex-1 rounded-md" />
            <Skeleton className="h-12 flex-1 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCart({ className = '' }) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading cart">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-border p-4 flex gap-4"
          aria-hidden="true"
        >
          <Skeleton className="w-20 h-20 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
