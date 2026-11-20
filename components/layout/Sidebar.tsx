'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Package,
  ClipboardList,
  Calendar,
  CalendarDays,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useAppContext, Page } from '@/context/AppContext';

interface NavItem {
  id: Page;
  path: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat', path: '/assistant', label: 'AI Skin Assistant', icon: MessageSquare },
  { id: 'history', path: '/history', label: 'Chat History', icon: History },
  { id: 'products', path: '/products', label: 'My Products', icon: Package },
  { id: 'routines', path: '/routines', label: 'My Routines', icon: ClipboardList },
  { id: 'timetable', path: '/timetable', label: 'Master Timetable', icon: Calendar },
  { id: 'calendar', path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'progress', path: '/progress', label: 'Progress Tracker', icon: BarChart2 },
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { navigate, userProfile, createSkinChat } = useAppContext();
  const [collapsed, setCollapsed] = useState(false);

  const initials = userProfile?.name
    ? userProfile.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SM';

  const handleNav = (item: NavItem) => {
    navigate(item.id);
    router.push(item.path);
  };

  const handleNewChat = () => {
    createSkinChat('New Skin Assessment', 'General Skincare');
    navigate('chat');
    router.push('/assistant');
  };

  const skinTypeBadgeColor: Record<string, string> = {
    oily: 'bg-blue-500/20 text-blue-300',
    dry: 'bg-orange-500/20 text-orange-300',
    combination: 'bg-purple-500/20 text-purple-300',
    sensitive: 'bg-pink-500/20 text-pink-300',
    normal: 'bg-green-500/20 text-green-300',
    unknown: 'bg-zinc-500/20 text-zinc-300',
  };

  return (
    <aside
      className="relative flex flex-col h-full border-r border-[#2D2D3D] bg-[#12121A] transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 72 : 260 }}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-[#2D2D3D] cursor-pointer ${
          collapsed ? 'justify-center' : ''
        }`}
        onClick={() => router.push('/dashboard')}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-900/40">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] bg-clip-text text-transparent leading-none">
              Skin Mate
            </span>
            <p className="text-[9px] text-[#A1A1AA] leading-tight mt-0.5 max-w-[160px]">
              Your Skin. Your Routine. Your AI Companion.
            </p>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className={`px-3 py-3 border-b border-[#2D2D3D] ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleNewChat}
          className={`flex items-center gap-2 bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-white font-medium rounded-xl transition-all duration-200 shadow-md shadow-purple-900/30 ${
            collapsed ? 'w-10 h-10 justify-center' : 'w-full px-4 py-2.5'
          }`}
          title="New Chat"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">New Chat</span>}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2D2D3D]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path || (item.path === '/assistant' && pathname.startsWith('/assistant'));
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 transition-all duration-200 relative group ${
                collapsed ? 'justify-center px-0 py-3' : 'px-4 py-2.5'
              } ${
                active
                  ? 'bg-[#A78BFA]/10 text-[#A78BFA]'
                  : 'text-[#A1A1AA] hover:bg-[#20202C] hover:text-[#F5F3FF]'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-[#A78BFA] to-[#8B5CF6]" />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#A78BFA]' : ''}`} />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div
        onClick={() => router.push('/settings')}
        className={`border-t border-[#2D2D3D] p-3 flex items-center gap-3 cursor-pointer hover:bg-[#20202C]/60 transition-colors ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shadow">
          {initials}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F5F3FF] truncate">
              {userProfile?.name ?? 'Guest User'}
            </p>
            {userProfile?.skinType && (
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  skinTypeBadgeColor[userProfile.skinType] ?? skinTypeBadgeColor.unknown
                }`}
              >
                {userProfile.skinType.charAt(0).toUpperCase() + userProfile.skinType.slice(1)} skin
              </span>
            )}
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#20202C] border border-[#2D2D3D] flex items-center justify-center text-[#A1A1AA] hover:text-[#A78BFA] hover:border-[#A78BFA] transition-all duration-200 z-10 shadow-md"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
