'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 my-2 animate-fadeIn">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-purple-950/30">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#181822] border border-[#2D2D3D] shadow-md flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-bounce" />
        <span className="text-xs text-[#A1A1AA] ml-2">Skin Mate is thinking...</span>
      </div>
    </div>
  );
}
