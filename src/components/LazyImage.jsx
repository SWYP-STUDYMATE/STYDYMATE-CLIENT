import { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function LazyImage({ 
  src, 
  alt, 
  placeholder = '/assets/basicProfilePic.png',
  className = '',
  loading = 'lazy',
  ...props 
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoading, setImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [targetRef, isIntersecting] = useIntersectionObserver();

  useEffect(() => {
    if (!isIntersecting || !src) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setImageLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setImageLoading(false);
    };
  }, [isIntersecting, src]);

  return (
    <div ref={targetRef} className={`relative ${className}`}>
      <img
        src={hasError ? placeholder : imageSrc}
        alt={alt}
        loading={loading}
        className={`${className} ${imageLoading ? 'blur-sm' : ''} transition-all duration-300`}
        {...props}
      />
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
    </div>
  );
}