import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setShowLightbox(true);
  };

  // Handle ESC key to close lightbox and arrow keys for navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showLightbox) return;

      switch (event.key) {
        case 'Escape':
          setShowLightbox(false);
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, currentIndex]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  return (
    <>
      {/* Mobile: Single image with counter, Desktop: Grid with thumbnails */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 h-64 sm:h-80 md:h-96">
        {/* Main Image */}
        <div className="col-span-4 md:col-span-3 relative bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={alt}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity active:opacity-75"
            onClick={() => openLightbox(currentIndex)}
          />
          {images.length > 1 && (
            <>
              {/* Image counter */}
              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/60 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Mobile navigation arrows */}
              <div className="md:hidden absolute inset-0 flex items-center justify-between px-2">
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="min-w-[44px] min-h-[44px] bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-2 transition-colors"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="min-w-[44px] min-h-[44px] bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-2 transition-colors"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-4">
            {images.slice(1, 4).map((image, index) => (
              <div key={index} className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`${alt} ${index + 2}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openLightbox(index + 1)}
                />
                {index === 2 && images.length > 4 && (
                  <div
                    className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                    onClick={() => openLightbox(3)}
                  >
                    <span className="text-white font-medium">
                      +{images.length - 4} más
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close button - Touch friendly */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 min-w-[44px] min-h-[44px] bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-2 z-10 transition-colors"
            aria-label="Cerrar galería"
          >
            <X className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>

          {/* Navigation buttons - Touch friendly */}
          <button
            onClick={prevImage}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-2 z-10 transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-2 z-10 transition-colors"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>

          <img
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Image counter */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs sm:text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;