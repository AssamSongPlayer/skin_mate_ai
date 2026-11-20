'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SkinChat, Product } from '@/types';
import { Calendar, Package, MessageSquare, ClipboardList, Archive, Trash2 } from 'lucide-react';

interface ConcernCardProps {
  chat: SkinChat;
  productCount?: number;
  hasRoutine?: boolean;
  onArchive?: (chatId: string) => void;
  onDelete?: (chatId: string) => void;
}

const CONCERN_EMOJIS: Record<string, string> = {
  acne: '🧴',
  'dark spots': '🌙',
  'dark-spots': '🌙',
  darkspots: '🌙',
  'dry skin': '💧',
  'dry-skin': '💧',
  dryskin: '💧',
  oily: '🌿',
  sensitive: '❤️',
  general: '✨',
  default: '✨',
};

function getConcernEmoji(concern: string): string {
  const lower = concern.toLowerCase();
  for (const [key, emoji] of Object.entries(CONCERN_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return CONCERN_EMOJIS.default;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-[#A78BFA]/15', text: 'text-[#A78BFA]', label: 'Active' },
  completed: { bg: 'bg-[#34D399]/15', text: 'text-[#34D399]', label: 'Completed' },
  archived: { bg: 'bg-[#A1A1AA]/15', text: 'text-[#A1A1AA]', label: 'Archived' },
  paused: { bg: 'bg-[#FBBF24]/15', text: 'text-[#FBBF24]', label: 'Paused' },
};

export default function ConcernCard({ chat, productCount = 0, hasRoutine = false, onArchive, onDelete }: ConcernCardProps) {
  const router = useRouter();
  const emoji = getConcernEmoji(chat.primaryConcern || chat.title);
  const statusStyle = STATUS_STYLES[chat.status] || STATUS_STYLES.active;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-5 flex flex-col gap-4 hover:border-[#A78BFA]/40 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-[#F5F3FF] leading-tight">{chat.title}</h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">{chat.primaryConcern}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Package className="w-3.5 h-3.5" />
          <span>{productCount} product{productCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(chat.createdAt)}</span>
        </div>
        {hasRoutine && (
          <div className="flex items-center gap-1.5 text-xs text-[#34D399]">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Routine active</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <button
          onClick={() => router.push(`/assistant?chatId=${chat.chatId}`)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Open Chat
        </button>
        {hasRoutine && (
          <button
            onClick={() => router.push('/routines')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-xs font-medium hover:border-[#A78BFA]/40 transition-all"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            View Routine
          </button>
        )}
        {onArchive && chat.status !== 'archived' && (
          <button
            onClick={() => onArchive(chat.chatId)}
            className="p-1.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#A1A1AA] hover:text-[#FBBF24] hover:border-[#FBBF24]/30 transition-all"
            title="Archive"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(chat.chatId)}
            className="p-1.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#A1A1AA] hover:text-[#FB7185] hover:border-[#FB7185]/30 transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
