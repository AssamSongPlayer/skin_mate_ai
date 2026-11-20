'use client';

import React from 'react';
import { Product } from '@/types';
import { Package, Clock, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onRemove?: (productId: string) => void;
  onToggleOwned?: (productId: string) => void;
  onViewChat?: (chatId: string) => void;
}

export default function ProductCard({
  product,
  onRemove,
  onToggleOwned,
  onViewChat,
}: ProductCardProps) {
  return (
    <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] hover:border-[#A78BFA]/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-lg">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A78BFA]/10 text-[#A78BFA]">
              {product.category}
            </span>
            <h4 className="text-sm font-semibold text-[#F5F3FF] mt-1.5 leading-snug">
              {product.name}
            </h4>
            {product.brand && <p className="text-xs text-[#A1A1AA]">{product.brand}</p>}
          </div>

          <button
            onClick={() => onToggleOwned?.(product.productId)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
              product.isOwned
                ? 'bg-[#34D399]/15 border-[#34D399]/30 text-[#34D399]'
                : 'bg-[#20202C] border-[#2D2D3D] text-[#A1A1AA] hover:text-[#F5F3FF]'
            }`}
          >
            {product.isOwned ? 'Owned' : 'Want'}
          </button>
        </div>

        {product.reason && (
          <p className="text-xs text-[#C4B5FD] italic mb-3 leading-relaxed">
            &ldquo;{product.reason}&rdquo;
          </p>
        )}

        {/* Key Ingredients */}
        {product.keyIngredients && product.keyIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.keyIngredients.map((ing, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#20202C] text-[#A1A1AA] border border-[#2D2D3D]"
              >
                {ing}
              </span>
            ))}
          </div>
        )}

        <div className="text-[11px] text-[#A1A1AA] space-y-1 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Usage: {product.frequency || 'Daily'} ({product.timeOfDay})</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#2D2D3D] flex items-center justify-between gap-2">
        {product.sourceChatIds && product.sourceChatIds.length > 0 && onViewChat && (
          <button
            onClick={() => onViewChat(product.sourceChatIds[0])}
            className="text-[11px] text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Source Chat</span>
          </button>
        )}

        {onRemove && (
          <button
            onClick={() => onRemove(product.productId)}
            className="p-1.5 rounded-lg bg-[#20202C] hover:bg-[#FB7185]/20 text-[#A1A1AA] hover:text-[#FB7185] transition-colors ml-auto"
            title="Remove from product list"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
