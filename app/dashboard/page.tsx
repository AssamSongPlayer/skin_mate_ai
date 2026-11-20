'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import StatCard from '@/components/dashboard/StatCard';
import TodayRoutine from '@/components/dashboard/TodayRoutine';
import ConcernCard from '@/components/dashboard/ConcernCard';
import {
  Sparkles,
  CheckSquare,
  Package,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const {
    userProfile,
    skinChats,
    products,
    individualRoutines,
    calendarTasks,
    deleteChat,
    archiveChat,
    createSkinChat,
  } = useAppContext();

  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const activeChats = skinChats.filter((c) => c.status !== 'archived');
  const activeProducts = products.filter((p) => p.selectedStatus);
  const activeRoutines = individualRoutines.filter((r) => r.status === 'active');

  const todayTasks = todayStr ? calendarTasks.filter((t) => t.date === todayStr) : [];
  const completedToday = todayTasks.filter((t) => t.status === 'completed');
  const completionRate =
    todayTasks.length > 0 ? Math.round((completedToday.length / todayTasks.length) * 100) : 0;

  const handleStartNewAssessment = () => {
    const newChat = createSkinChat('New Skin Assessment', 'General Skincare');
    router.push(`/assistant?chatId=${newChat.chatId}`);
  };

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181822] via-[#20202C] to-[#181822] border border-[#2D2D3D] p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#A78BFA]/15 text-[#C4B5FD] border border-[#A78BFA]/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              AI-Powered Skincare Ecosystem
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F3FF] tracking-tight">
              Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}!
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 leading-relaxed">
              Your skin care is tailored, safe, and synchronized. Manage your AI conversations, selected products, routines, and master timetable in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={handleStartNewAssessment}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-white font-medium text-sm transition-all shadow-lg shadow-purple-950/40"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Skin Assessment</span>
              </button>
              <button
                onClick={() => router.push('/timetable')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-[#F5F3FF] font-medium text-sm border border-[#2D2D3D] transition-colors"
              >
                <span>View Master Timetable</span>
                <ArrowRight className="w-4 h-4 text-[#A1A1AA]" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Sparkles}
            label="Active Concerns"
            value={activeChats.length}
            subtitle="Skin topics assessed"
          />
          <StatCard
            icon={Package}
            label="Selected Products"
            value={activeProducts.length}
            subtitle="Across all routines"
          />
          <StatCard
            icon={Calendar}
            label="Active Routines"
            value={activeRoutines.length}
            subtitle="Currently running"
          />
          <StatCard
            icon={CheckSquare}
            label="Today's Completion"
            value={`${completionRate}%`}
            subtitle={`${completedToday.length} of ${todayTasks.length} tasks`}
            trend={completionRate > 0 ? completionRate : undefined}
          />
        </div>

        {/* Today Routine & Active Concerns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today Routine Schedule */}
          <div className="lg:col-span-1">
            <TodayRoutine tasks={todayTasks} />
          </div>

          {/* Active Concerns Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#F5F3FF]">Active Skin Assessments</h2>
                <p className="text-xs text-[#A1A1AA]">Independent consultations & routines</p>
              </div>
              <button
                onClick={() => router.push('/history')}
                className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeChats.length === 0 ? (
              <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-8 text-center flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#A78BFA] mb-3 opacity-60" />
                <h3 className="text-sm font-semibold text-[#F5F3FF]">No skin assessments yet</h3>
                <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-4">
                  Start an AI conversation to assess your skin, discover tailored products, and formulate smart routines.
                </p>
                <button
                  onClick={handleStartNewAssessment}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-xs font-semibold shadow"
                >
                  Start Assessment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChats.map((chat) => {
                  const chatProducts = products.filter((p) =>
                    p.sourceChatIds.includes(chat.chatId)
                  );
                  const hasRoutine = individualRoutines.some(
                    (r) => r.chatId === chat.chatId && r.status === 'active'
                  );

                  return (
                    <ConcernCard
                      key={chat.chatId}
                      chat={chat}
                      productCount={chatProducts.length}
                      hasRoutine={hasRoutine}
                      onArchive={archiveChat}
                      onDelete={deleteChat}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
