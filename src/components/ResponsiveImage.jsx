import React, { useState, useCallback } from 'react';

export function ResponsiveImage({
  src,
  alt,
  className = '',
  sizes = '(max-width: 639px) 300px, (max-width: 1023px) 400px, 500px',
  placeholder,
  onError,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback((e) => {
    setError(true);
    if (onError) onError(e);
  }, [onError]);

  if (error && placeholder) {
    return <>{placeholder}</>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && placeholder && (
        <div className="absolute inset-0">
          {placeholder}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

export default ResponsiveImage;
