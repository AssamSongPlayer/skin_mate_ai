'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#181822] border border-[#2D2D3D] my-4">
      <div className="w-14 h-14 rounded-2xl bg-[#20202C] border border-[#2D2D3D] flex items-center justify-center text-[#A78BFA] mb-4 shadow-lg shadow-purple-950/20">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-[#F5F3FF] mb-2">{title}</h3>
      <p className="text-sm text-[#A1A1AA] max-w-md leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-white text-sm font-medium transition-all shadow-md shadow-purple-950/30"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
