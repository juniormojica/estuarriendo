'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder-property.webp',
  width,
  height,
  fill = true,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-gray-100", className)}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse z-10">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-200 z-10">
          <span className="text-xs text-gray-400 text-center px-2 py-1">
            Error al cargar imagen
          </span>
        </div>
      )}

      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setError(true);
          setIsLoaded(true);
        }}
      />
    </div>
  );
};

export default LazyImage;
