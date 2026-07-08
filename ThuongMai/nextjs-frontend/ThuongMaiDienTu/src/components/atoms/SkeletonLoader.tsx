import React from 'react';

interface SkeletonProps {
  shape?: 'text' | 'circle' | 'rectangle';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ shape = 'text', className = '' }) => {
  const shapes = {
    text: 'h-4 w-full rounded',
    circle: 'h-12 w-12 rounded-full',
    rectangle: 'h-48 w-full rounded-md',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 ${shapes[shape]} ${className}`}
      role="status"
      aria-label="Đang tải dữ liệu..."
    />
  );
};
