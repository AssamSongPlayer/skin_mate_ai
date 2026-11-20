'use client';

import React from 'react';
import { Product } from '@/types';
import { Check, Sparkles, AlertCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';

interface ProductRecommendationCardProps {
  products: Product[];
  selectedProductIds: string[];
  onToggleSelect: (product: Product) => void;
  onAskAlternatives?: (category: string) => void;
  onConfirmSelections: () => void;
}

export default function ProductRecommendationCard({
  products,
  selectedProductIds,
  onToggleSelect,
  onAskAlternatives,
  onConfirmSelections,
}: ProductRecommendationCardProps) {
  const selectedCount = products.filter((p) => selectedProductIds.includes(p.productId)).length;

  return (
    <div className="w-full my-3 p-4 rounded-2xl bg-[#181822] border border-[#A78BFA]/30 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#2D2D3D] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F5F3FF]">AI Suggested Products</h4>
            <p className="text-xs text-[#A1A1AA]">Select the products you wish to include in your routine</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#A78BFA]/15 text-[#C4B5FD] border border-[#A78BFA]/30">
          {selectedCount} / {products.length} Selected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.map((product) => {
          const isSelected = selectedProductIds.includes(product.productId);

          return (
            <div
              key={product.productId}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-[#20202C] border-[#A78BFA] shadow-md shadow-purple-950/30'
                  : 'bg-[#12121A] border-[#2D2D3D] hover:border-[#A78BFA]/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A78BFA]/10 text-[#A78BFA]">
                      {product.category}
                    </span>
                    <h5 className="text-sm font-semibold text-[#F5F3FF] mt-1.5 leading-snug">
                      {product.name}
                    </h5>
                    {product.brand && (
                      <p className="text-xs text-[#A1A1AA]">{product.brand}</p>
                    )}
                  </div>
                  {product.approximatePrice && (
                    <span className="flex items-center text-xs font-medium text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-md">
                      {product.approximatePrice}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#C4B5FD] italic mb-3 leading-relaxed">
                  &ldquo;{product.reason}&rdquo;
                </p>

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

                {/* Usage instruction */}
                <div className="text-[11px] text-[#A1A1AA] mb-3 flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#A78BFA] flex-shrink-0 mt-0.5" />
                  <span>{product.usageInstructions}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2D2D3D] flex items-center justify-between gap-2">
                {onAskAlternatives && (
                  <button
                    onClick={() => onAskAlternatives(product.category)}
                    className="text-[11px] text-[#A1A1AA] hover:text-[#C4B5FD] flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Alternative
                  </button>
                )}

                <button
                  onClick={() => onToggleSelect(product)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#A78BFA] text-white shadow'
                      : 'bg-[#20202C] text-[#F5F3FF] border border-[#2D2D3D] hover:border-[#A78BFA]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-white/20 border-white' : 'border-[#A1A1AA]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#2D2D3D]">
        <p className="text-xs text-[#A1A1AA]">
          {selectedCount > 0
            ? `${selectedCount} item${selectedCount > 1 ? 's' : ''} ready to build routine`
            : 'Select at least one product to generate routine'}
        </p>
        <button
          onClick={onConfirmSelections}
          disabled={selectedCount === 0}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-md shadow-purple-950/40"
        >
          Confirm Selections ({selectedCount})
        </button>
      </div>
    </div>
  );
}
