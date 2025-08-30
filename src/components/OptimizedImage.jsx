import { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({
    src,
    alt,
    className = '',
    width,
    height,
    loading = 'lazy',
    placeholder = '/assets/placeholder.png',
    onLoad,
    onError,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadImage();
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px',
            }
        );

        if (imgRef.current && loading === 'lazy') {
            observer.observe(imgRef.current);
        } else {
            loadImage();
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [src]);

    const loadImage = () => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            onLoad && onLoad();
        };

        img.onerror = () => {
            setHasError(true);
            setIsLoading(false);
            onError && onError();
        };
    };

    // WebP 지원 체크 및 폴백
    const getOptimizedSrc = (originalSrc) => {
        // Workers API를 통한 이미지 최적화 URL 생성
        if (originalSrc.startsWith('http')) {
            // 외부 이미지인 경우 Workers 프록시 사용
            const params = new URLSearchParams({
                url: originalSrc,
                w: width || '',
                h: height || '',
                q: '85',
                f: 'auto'
            });
            return `/workers/api/images/transform?${params}`;
        }
        return originalSrc;
    };

    return (
        <div className={`relative ${className}`} style={{ width, height }}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
            )}

            <img
                ref={imgRef}
                src={getOptimizedSrc(imageSrc)}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                width={width}
                height={height}
                loading={loading}
                {...props}
            />

            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">이미지 로드 실패</span>
                </div>
            )}
        </div>
    );
};

// Picture 컴포넌트 - 반응형 이미지
export const ResponsiveImage = ({
    src,
    alt,
    sources = [],
    className = '',
    ...props
}) => {
    return (
        <picture>
            {sources.map((source, index) => (
                <source
                    key={index}
                    srcSet={source.srcSet}
                    media={source.media}
                    type={source.type}
                />
            ))}
            <OptimizedImage
                src={src}
                alt={alt}
                className={className}
                {...props}
            />
        </picture>
    );
};

// 블러 플레이스홀더를 가진 이미지
export const BlurredImage = ({
    src,
    alt,
    blurDataURL,
    className = '',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative">
            {blurDataURL && !isLoaded && (
                <img
                    src={blurDataURL}
                    alt=""
                    aria-hidden="true"
                    className={`${className} absolute inset-0 filter blur-lg scale-110`}
                />
            )}
            <OptimizedImage
                src={src}
                alt={alt}
                className={className}
                onLoad={() => setIsLoaded(true)}
                {...props}
            />
        </div>
    );
};

export default OptimizedImage;