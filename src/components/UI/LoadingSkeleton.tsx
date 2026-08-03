import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-yellow-500 border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#16191F] border border-slate-800/80 rounded-xl p-5 space-y-4 animate-pulse"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-800 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-slate-800/40 rounded w-full" />
            <div className="h-3 bg-slate-800/40 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 bg-slate-800/30 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse"
        >
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-800 rounded w-48" />
            <div className="h-3 bg-slate-800/60 rounded w-32" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-4 bg-slate-800 rounded w-20" />
            <div className="h-6 bg-slate-800 rounded-full w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const BannerSkeleton: React.FC = () => {
  return (
    <div className="bg-[#16191F] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
      <div className="flex items-center gap-5 w-full">
        <div className="w-24 h-24 bg-slate-800 rounded-xl shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-slate-800 rounded w-40" />
          <div className="h-6 bg-slate-800 rounded w-64" />
          <div className="h-3 bg-slate-800/60 rounded w-full max-w-md" />
        </div>
      </div>
    </div>
  );
};
