import { Smartphone } from 'lucide-react';

export function ImageGallery({
  imageUrls,
  selectedImage,
  onSelect,
  productName,
  imageErrors,
  onImageError,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl overflow-hidden bg-muted border border-border aspect-square flex items-center justify-center">
        {imageUrls[selectedImage] && !imageErrors[imageUrls[selectedImage]] ? (
          <img
            src={imageUrls[selectedImage]}
            alt={`${productName} - Image ${selectedImage + 1}`}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={() => onImageError(imageUrls[selectedImage])}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Smartphone className="h-20 w-20 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      {imageUrls.length > 1 && (
        <div className="grid grid-cols-4 gap-2" role="listbox" aria-label="Product images">
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
    </div>
  );
}
