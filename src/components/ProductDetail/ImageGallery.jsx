/**
 * ImageGallery Component
 *
 * A product image gallery with multiple view modes for desktop and mobile.
 * Supports image navigation via thumbnails (desktop), horizontal scroll (mobile),
 * and touch swipe gestures (mobile).
 *
 * Features:
 *   - Main image display with lazy loading and error handling
 *   - Desktop: Grid of 4 thumbnail images for quick navigation
 *   - Mobile: Horizontal scrollable thumbnail strip with scroll indicators
 *   - Mobile: Swipe gesture support for navigating between images
 *   - Mobile: Dot indicators and arrow buttons for navigation
 *   - Fallback placeholder when no images are available or fail to load
 *   - Image counter display on mobile
 *
 * Props:
 *   - imageUrls: Array of image URLs to display
 *   - selectedImage: Index of currently selected image
 *   - onSelect: Callback when user selects an image (receives index)
 *   - productName: Product name for alt text generation
 *   - imageErrors: Object mapping URLs that failed to load
 *   - onImageError: Callback when an image fails to load
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollIndicators } from '../../hooks/useScrollIndicators';

export function ImageGallery({
  imageUrls,
  selectedImage,
  onSelect,
  productName,
  imageErrors,
  onImageError,
}) {
  // Touch tracking state for swipe gesture detection
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  // Hook for detecting scroll position in the mobile thumbnail strip
  const { ref: thumbsRef, className: thumbsClassName } = useScrollIndicators();
  // Ref to the main container for attaching touch event listeners
  const containerRef = useRef(null);

  // Minimum pixel distance for a swipe to register (prevents accidental swipes)
  const minSwipeDistance = 50;

  // Touch event handlers for swipe navigation on mobile
  const onTouchStart = useCallback((e) => {
    setTouchEnd(null); // Reset end position to allow repeated swipes
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  // Calculate swipe direction and navigate if threshold exceeded
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;  // Swipe left = next image
    const isRightSwipe = distance < -minSwipeDistance; // Swipe right = previous image

    if (isLeftSwipe && selectedImage < imageUrls.length - 1) {
      onSelect(selectedImage + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      onSelect(selectedImage - 1);
    }
  }, [touchStart, touchEnd, selectedImage, imageUrls.length, onSelect]);

  // Attach touch event listeners to the container for swipe support
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  // Navigate to previous image (if not at first image)
  const goToPrevious = useCallback(() => {
    if (selectedImage > 0) {
      onSelect(selectedImage - 1);
    }
  }, [selectedImage, onSelect]);

  // Navigate to next image (if not at last image)
  const goToNext = useCallback(() => {
    if (selectedImage < imageUrls.length - 1) {
      onSelect(selectedImage + 1);
    }
  }, [selectedImage, imageUrls.length, onSelect]);

  // Fallback placeholder when no images are available
  if (imageUrls.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden bg-muted border border-border aspect-square flex items-center justify-center">
        <Smartphone className="h-20 w-20 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {/* Main image container with touch support and navigation overlays */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden bg-muted border border-border aspect-square flex items-center justify-center select-none"
      >
        {/* Display selected image or fallback if image failed to load */}
        {imageUrls[selectedImage] && !imageErrors[imageUrls[selectedImage]] ? (
          <img
            src={imageUrls[selectedImage]}
            alt={`${productName} - Image ${selectedImage + 1}`}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={() => onImageError(imageUrls[selectedImage])}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        ) : (
          <Smartphone className="h-20 w-20 text-muted-foreground" aria-hidden="true" />
        )}

        {/* Mobile: Swipe indicators and controls - only shown when multiple images */}
        {imageUrls.length > 1 && (
          <>
            {/* Dot indicators for mobile - shows current position */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={`h-2 rounded-full transition-all ${
                    selectedImage === idx
                      ? 'bg-white w-6'      // Active dot is wider
                      : 'bg-white/50 w-2'   // Inactive dot is smaller
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrow buttons for mobile navigation */}
            <button
              type="button"
              onClick={goToPrevious}
              disabled={selectedImage === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full disabled:opacity-30 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={selectedImage === imageUrls.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full disabled:opacity-30 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Image counter - shows "1/4" style indicator */}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full md:hidden">
              {selectedImage + 1}/{imageUrls.length}
            </div>
          </>
        )}
      </div>

      {/* Desktop: Thumbnail grid - 4 columns for quick image selection */}
      {imageUrls.length > 1 && (
        <div className="hidden md:grid grid-cols-4 gap-2" role="listbox" aria-label="Product images">
          {imageUrls.map((img, idx) => (
            <button
              key={img}
              type="button"
              role="option"
              aria-selected={selectedImage === idx}
              aria-label={`View image ${idx + 1}`}
              onClick={() => onSelect(idx)}
              className={`rounded-lg overflow-hidden border-2 transition-all aspect-square focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                selectedImage === idx
                  ? 'border-primary'                    // Highlight selected thumbnail
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => onImageError(img)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile: Horizontal scrollable thumbnails with scroll indicators */}
      {imageUrls.length > 1 && (
        <div ref={thumbsRef} className={`md:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-1 ${thumbsClassName}`}>
          {imageUrls.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => onSelect(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === idx
                  ? 'border-primary'
                  : 'border-border'
              }`}
              aria-label={`View image ${idx + 1}`}
              aria-pressed={selectedImage === idx}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => onImageError(img)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
