import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-white/[0.05]';
  
  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Card Skeleton for product cards
export const CardSkeleton: React.FC = () => (
  <div className="glass-card overflow-hidden">
    <Skeleton variant="rectangular" height="176px" className="w-full" />
    <div className="p-6 space-y-3">
      <Skeleton variant="text" width="70%" height="1rem" />
      <Skeleton variant="text" width="100%" height="0.75rem" />
      <Skeleton variant="text" width="85%" height="0.75rem" />
      <div className="mt-4 flex justify-between items-center">
        <Skeleton variant="text" width="80px" height="1.25rem" />
        <Skeleton variant="rounded" width="112px" height="36px" />
      </div>
    </div>
  </div>
);

// Hero Skeleton for landing page hero section
export const HeroSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton variant="text" width="60%" height="4rem" />
    <Skeleton variant="text" width="80%" height="1.5rem" />
    <Skeleton variant="text" width="40%" height="1.5rem" />
    <div className="flex gap-3 mt-6">
      <Skeleton variant="rounded" width="160px" height="44px" />
      <Skeleton variant="rounded" width="140px" height="44px" />
    </div>
  </div>
);

// Stats Skeleton for statistics section
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="text-center space-y-2">
        <Skeleton variant="circular" width="64px" height="64px" className="mx-auto" />
        <Skeleton variant="text" width="80px" height="2rem" className="mx-auto" />
        <Skeleton variant="text" width="60%" height="0.75rem" className="mx-auto" />
      </div>
    ))}
  </div>
);

// Carousel Skeleton for product carousels
export const CarouselSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="space-y-2">
          <Skeleton variant="text" width="150px" height="1rem" />
          <Skeleton variant="text" width="100px" height="0.75rem" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" width="40px" height="40px" />
        <Skeleton variant="rounded" width="40px" height="40px" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Page Skeleton for full page loading
export const PageSkeleton: React.FC = () => (
  <div className="space-y-8 p-8">
    <div className="space-y-4">
      <Skeleton variant="text" width="40%" height="2.5rem" />
      <Skeleton variant="text" width="60%" height="1rem" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default Skeleton;
