import React, { useState, useRef } from 'react';
import { Issue } from '../types/index';
import { processImage } from '../utils/imageHandling';
import LoadingSpinner from './LoadingSpinner';

interface AddIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (issueData: Omit<Issue, 'id' | 'issueNumber'>) => void;
}

const AddIssueModal: React.FC<AddIssueModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formState, setFormState] = useState({
    location: '',
    description: '',
    shopDrawing: null as { data: string; filename: string; thumbnail: string } | null,
    siteImage: null as { data: string; filename: string; thumbnail: string } | null,
  });

  const shopDrawingRef = useRef<HTMLInputElement>(null);
  const siteImageRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingShopDrawing, setIsProcessingShopDrawing] = useState(false);
  const [isProcessingSiteImage, setIsProcessingSiteImage] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (
    file: File,
    field: 'shopDrawing' | 'siteImage'
  ) => {
    try {
      setError('');
      if (field === 'shopDrawing') {
        setIsProcessingShopDrawing(true);
      } else {
        setIsProcessingSiteImage(true);
      }

      const { data, thumbnail } = await processImage(file);
      setFormState(prev => ({
        ...prev,
        [field]: {
          data,
          thumbnail,
          filename: file.name,
        },
      }));
    } catch (err) {
      setError(`Failed to process ${field === 'shopDrawing' ? 'shop drawing' : 'site image'}`);
    } finally {
      if (field === 'shopDrawing') {
        setIsProcessingShopDrawing(false);
      } else {
        setIsProcessingSiteImage(false);
      }
    }
  };

  const handleShopDrawingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'shopDrawing');
  };

  const handleSiteImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'siteImage');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formState.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formState.shopDrawing) {
      setError('Shop Drawing image is required');
      return;
    }

    setIsLoading(true);
    try {
      onAdd({
        location: formState.location,
        description: formState.description,
        shopDrawing: formState.shopDrawing,
        siteImage: formState.siteImage || undefined,
        status: 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Reset form
      setFormState({
        location: '',
        description: '',
        shopDrawing: null,
        siteImage: null,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Add New Issue</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formState.location}
              onChange={e => setFormState(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Floor 2, Room A"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formState.description}
              onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue in detail..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Shop Drawing */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Shop Drawing Image <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => !isProcessingShopDrawing && shopDrawingRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isProcessingShopDrawing 
                  ? 'border-blue-500 bg-blue-50 cursor-wait' 
                  : 'border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              {isProcessingShopDrawing ? (
                <div className="flex justify-center">
                  <LoadingSpinner size="small" text="Processing..." />
                </div>
              ) : formState.shopDrawing ? (
                <div className="text-green-600 font-semibold">
                  ✓ {formState.shopDrawing.filename}
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-2xl mb-2">📸</div>
                  <p>Click to upload shop drawing</p>
                </div>
              )}
            </div>
            <input
              ref={shopDrawingRef}
              type="file"
              accept="image/*"
              onChange={handleShopDrawingChange}
              disabled={isProcessingShopDrawing}
              className="hidden"
            />
          </div>

          {/* Site Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Site Image <span className="text-gray-400">(Optional)</span>
            </label>
            <div
              onClick={() => !isProcessingSiteImage && siteImageRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isProcessingSiteImage 
                  ? 'border-blue-500 bg-blue-50 cursor-wait' 
                  : 'border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              {isProcessingSiteImage ? (
                <div className="flex justify-center">
                  <LoadingSpinner size="small" text="Processing..." />
                </div>
              ) : formState.siteImage ? (
                <div className="text-green-600 font-semibold">
                  ✓ {formState.siteImage.filename}
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-2xl mb-2">📷</div>
                  <p>Click to upload site image</p>
                </div>
              )}
            </div>
            <input
              ref={siteImageRef}
              type="file"
              accept="image/*"
              onChange={handleSiteImageChange}
              disabled={isProcessingSiteImage}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isProcessingShopDrawing || isProcessingSiteImage}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isProcessingShopDrawing || isProcessingSiteImage}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" text="" />
                  <span>Adding Issue...</span>
                </>
              ) : (
                'Add Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIssueModal;
