import React, { useState, useRef, useEffect } from 'react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  thumbnailSize?: 'small' | 'medium';
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, thumbnailSize = 'small' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPan = useRef<{ x: number; y: number } | null>(null);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
  };

  // prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return;
  }, [isModalOpen]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${sizeClasses[thumbnailSize]} rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer shadow-soft hover:shadow-soft-md`}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
          onKeyDown={e => { if (e.key === 'Escape') setIsModalOpen(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={containerRef}
            className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
            onWheel={e => {
              // zoom with wheel
              e.preventDefault();
              const delta = -e.deltaY;
              const factor = delta > 0 ? 1.08 : 0.92;
              setScale(s => Math.min(5, Math.max(1, +(s * factor).toFixed(3))));
            }}
            onMouseDown={e => {
              if (scale <= 1) return;
              setIsPanning(true);
              startPan.current = { x: e.clientX, y: e.clientY };
            }}
            onMouseMove={e => {
              if (!isPanning || !startPan.current) return;
              const dx = e.clientX - startPan.current.x;
              const dy = e.clientY - startPan.current.y;
              setTranslate({ x: lastTranslate.current.x + dx, y: lastTranslate.current.y + dy });
            }}
            onMouseUp={() => {
              setIsPanning(false);
              lastTranslate.current = { ...translate };
              startPan.current = null;
            }}
            onMouseLeave={() => {
              if (isPanning) {
                setIsPanning(false);
                lastTranslate.current = { ...translate };
                startPan.current = null;
              }
            }}
            onTouchStart={e => {
              if (e.touches.length === 1) {
                startPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                setIsPanning(true);
              } else if (e.touches.length === 2) {
                pinchRef.current = {
                  distance: Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                  ),
                  scale,
                };
              }
            }}
            onTouchMove={e => {
              if (e.touches.length === 1 && isPanning && startPan.current) {
                const dx = e.touches[0].clientX - startPan.current.x;
                const dy = e.touches[0].clientY - startPan.current.y;
                setTranslate({ x: lastTranslate.current.x + dx, y: lastTranslate.current.y + dy });
              } else if (e.touches.length === 2 && pinchRef.current) {
                const distance = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                const factor = distance / pinchRef.current.distance;
                setScale(s => Math.min(5, Math.max(1, +(pinchRef.current!.scale * factor).toFixed(3))));
              }
            }}
            onTouchEnd={() => {
              setIsPanning(false);
              lastTranslate.current = { ...translate };
              startPan.current = null;
              pinchRef.current = null;
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-50 bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Close"
            >
              ×
            </button>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ maxWidth: '95vw', maxHeight: '95vh' }}>
                <img
                  ref={imgRef}
                  src={src}
                  alt={alt}
                  draggable={false}
                  style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                    transition: isPanning ? 'none' : 'transform 120ms ease-out',
                    touchAction: 'none',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  className="rounded-md"
                  onDoubleClick={() => {
                    // reset or zoom
                    if (scale > 1) {
                      setScale(1);
                      setTranslate({ x: 0, y: 0 });
                      lastTranslate.current = { x: 0, y: 0 };
                    } else {
                      setScale(2);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
