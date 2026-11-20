'use client';

import React from 'react';
import { ChatMessage, Product } from '@/types';
import { Sparkles, User } from 'lucide-react';
import ProductRecommendationCard from './ProductRecommendationCard';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
  selectedProductIds: string[];
  onToggleSelectProduct: (product: Product) => void;
  onAskAlternatives?: (category: string) => void;
  onConfirmSelections: () => void;
}

export default function MessageBubble({
  message,
  selectedProductIds,
  onToggleSelectProduct,
  onAskAlternatives,
  onConfirmSelections,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end my-3 animate-fadeIn">
        <div className="max-w-[85%] md:max-w-[75%] flex items-end gap-2.5">
          <div className="p-4 rounded-2xl rounded-br-sm bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-sm leading-relaxed shadow-lg shadow-purple-950/30">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#20202C] border border-[#2D2D3D] flex items-center justify-center text-[#A78BFA] flex-shrink-0 text-xs">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex justify-start my-3 animate-fadeIn">
      <div className="max-w-[95%] md:max-w-[90%] flex items-start gap-2.5 w-full">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-purple-950/30 mt-1">
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {message.content && (
            <div className="p-4.5 rounded-2xl rounded-tl-sm bg-[#181822] border border-[#2D2D3D] text-[#F5F3FF] text-sm leading-relaxed shadow-md">
              <MarkdownRenderer content={message.content} />
            </div>
          )}

          {/* Interactive product recommendation */}
          {message.interactiveData?.products && message.interactiveData.products.length > 0 && (
            <ProductRecommendationCard
              products={message.interactiveData.products}
              selectedProductIds={selectedProductIds}
              onToggleSelect={onToggleSelectProduct}
              onAskAlternatives={onAskAlternatives}
              onConfirmSelections={onConfirmSelections}
            />
          )}
        </div>
      </div>
    </div>
  );
}
