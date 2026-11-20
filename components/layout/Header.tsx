'use client';

import React from 'react';
import { Bell, Sparkles, Plus, Search } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface HeaderProps {
  currentPageTitle: string;
}

export default function Header({ currentPageTitle }: HeaderProps) {
  const { navigate, createSkinChat, userProfile } = useAppContext();

  const handleNewChat = () => {
    createSkinChat('New Skin Assessment', 'General Skincare');
    navigate('chat');
  };

  const initials = userProfile?.name
    ? userProfile.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SM';

  return (
    <header className="h-16 border-b border-[#2D2D3D] bg-[#0B0B0F]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-[#F5F3FF] tracking-tight">{currentPageTitle}</h1>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20">
          <Sparkles className="w-3 h-3" />
          AI Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick New Chat Button */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-white text-sm font-medium transition-all shadow-md shadow-purple-950/40"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Skin Chat</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('settings')}
          className="relative p-2 rounded-xl bg-[#181822] border border-[#2D2D3D] text-[#A1A1AA] hover:text-[#F5F3FF] hover:border-[#A78BFA]/40 transition-all"
          title="Notifications & Settings"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A78BFA]" />
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate('settings')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold border border-[#A78BFA]/30 hover:ring-2 hover:ring-[#A78BFA]/40 transition-all"
          title="User Profile & Settings"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
