'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div
        className={`${sizeClasses[size]} rounded-full border-t-[#A78BFA] border-r-transparent border-b-[#A78BFA]/30 border-l-transparent animate-spin`}
      />
      {text && <p className="text-xs text-[#A1A1AA] animate-pulse">{text}</p>}
    </div>
  );
}
