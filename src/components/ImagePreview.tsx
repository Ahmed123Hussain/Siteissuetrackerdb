import React, { useState } from 'react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  thumbnailSize?: 'small' | 'medium';
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, thumbnailSize = 'small' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
  };

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
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl max-h-screen overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">{alt}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <img src={src} alt={alt} className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
