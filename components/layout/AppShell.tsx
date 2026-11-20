'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

interface AppShellProps {
  currentPage: string;
  children: React.ReactNode;
}

export default function AppShell({ currentPage, children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0B0F] text-[#F5F3FF]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header currentPageTitle={currentPage} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
