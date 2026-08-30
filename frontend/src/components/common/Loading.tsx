import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', fullPage = false }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const wrapper = fullPage ? (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
    </div>
  ) : (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );

  return wrapper;
};

export default Loading;