'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number; // positive = up, negative = down
  color?: string; // tailwind color class for icon bg
  subtitle?: string;
}

export default function StatCard({ icon: Icon, label, value, trend, color = 'bg-purple-500/20', subtitle }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-5 flex flex-col gap-4 hover:border-[#A78BFA]/40 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-[#A78BFA]" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-[#34D399]' : 'text-[#FB7185]'}`}>
            {trend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-[#F5F3FF]">{value}</p>
        <p className="text-sm text-[#A1A1AA] mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-[#A1A1AA]/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
