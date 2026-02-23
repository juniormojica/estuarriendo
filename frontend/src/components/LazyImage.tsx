import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className,
    fallbackSrc = 'https://via.placeholder.com/400x300?text=No+Image',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        // Fallback if IntersectionObserver is not supported
        if (!('IntersectionObserver' in window)) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px', // Pre-load when 200px away from viewport
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={imgRef}
            className={cn(
                "relative overflow-hidden bg-gray-100",
                className
            )}
        >
            {/* Skeleton Loading State */}
            {(!isLoaded || !shouldLoad) && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-200">
                    <span className="text-xs text-gray-400 text-center px-2 py-1">Error al cargar imagen</span>
                </div>
            )}

            {/* The Actual Image */}
            {shouldLoad && (
                <img
                    src={error ? fallbackSrc : src}
                    alt={alt}
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-500 ease-in-out",
                        isLoaded ? "opacity-100" : "opacity-0",
                        className
                    )}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        setError(true);
                        setIsLoaded(true);
                    }}
                    loading="lazy" // Native fallback
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;
