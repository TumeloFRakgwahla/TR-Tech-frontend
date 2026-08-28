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
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const { ref: thumbsRef, className: thumbsClassName } = useScrollIndicators();
  const containerRef = useRef(null);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedImage < imageUrls.length - 1) {
      onSelect(selectedImage + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      onSelect(selectedImage - 1);
    }
  }, [touchStart, touchEnd, selectedImage, imageUrls.length, onSelect]);

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

  const goToPrevious = useCallback(() => {
    if (selectedImage > 0) {
      onSelect(selectedImage - 1);
    }
  }, [selectedImage, onSelect]);

  const goToNext = useCallback(() => {
    if (selectedImage < imageUrls.length - 1) {
      onSelect(selectedImage + 1);
    }
  }, [selectedImage, imageUrls.length, onSelect]);

  if (imageUrls.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden bg-muted border border-border aspect-square flex items-center justify-center">
        <Smartphone className="h-20 w-20 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden bg-muted border border-border aspect-square flex items-center justify-center select-none"
      >
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

        {/* Mobile: Swipe indicators and controls */}
        {imageUrls.length > 1 && (
          <>
            {/* Dot indicators for mobile */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={`h-2 rounded-full transition-all ${
                    selectedImage === idx
                      ? 'bg-white w-6'
                      : 'bg-white/50 w-2'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrow buttons for mobile */}
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

            {/* Image counter */}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full md:hidden">
              {selectedImage + 1}/{imageUrls.length}
            </div>
          </>
        )}
      </div>

      {/* Desktop: Thumbnail grid */}
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
                  ? 'border-primary'
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

      {/* Mobile: Horizontal scrollable thumbnails */}
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
