'use client';

import React, { useState } from 'react';
import { CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ChatCompletionModalProps {
  isOpen: boolean;
  chatTitle: string;
  selectedProducts: Product[];
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function ChatCompletionModal({
  isOpen,
  chatTitle,
  selectedProducts,
  onConfirm,
  onClose,
}: ChatCompletionModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#181822] border border-[#A78BFA]/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-[#A1A1AA] hover:text-[#F5F3FF] p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-purple-950/40">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F5F3FF]">Finalize Assessment</h3>
            <p className="text-xs text-[#A1A1AA]">{chatTitle}</p>
          </div>
        </div>

        <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">
          You have selected <span className="text-[#A78BFA] font-semibold">{selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}</span>. 
          Ready to generate your personalized routine and merge it into your master timetable?
        </p>

        {/* Selected products preview */}
        <div className="max-h-48 overflow-y-auto space-y-2 mb-6 p-3 bg-[#12121A] rounded-xl border border-[#2D2D3D]">
          {selectedProducts.map((p) => (
            <div key={p.productId} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#20202C]">
              <span className="font-medium text-[#F5F3FF] truncate">{p.name}</span>
              <span className="text-[10px] text-[#A78BFA] uppercase tracking-wider ml-2">{p.category}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Generating tailored routine & updating master schedule..." />
        ) : (
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-sm font-medium text-[#F5F3FF] border border-[#2D2D3D] transition-colors"
            >
              Continue Chatting
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-950/40"
            >
              <span>Generate Routine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
