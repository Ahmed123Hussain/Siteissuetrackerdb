import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', fullScreen = false, message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 border-3',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`} />
      {message && <p className="text-sm text-gray-600 font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
