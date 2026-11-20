'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  ClipboardList,
  CalendarDays,
  Menu,
} from 'lucide-react';
import { useAppContext, Page } from '@/context/AppContext';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { navigate } = useAppContext();

  const navItems: Array<{ id: Page; path: string; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'chat', path: '/assistant', label: 'AI Chat', icon: MessageSquare },
    { id: 'routines', path: '/routines', label: 'Routines', icon: ClipboardList },
    { id: 'calendar', path: '/calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Menu },
  ];

  const handleNav = (item: { id: Page; path: string }) => {
    navigate(item.id);
    router.push(item.path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#12121A]/95 backdrop-blur-lg border-t border-[#2D2D3D] px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.path || (item.path === '/assistant' && pathname.startsWith('/assistant'));
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              active ? 'text-[#A78BFA]' : 'text-[#A1A1AA] hover:text-[#F5F3FF]'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-[#A78BFA]' : ''}`} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
