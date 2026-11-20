'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import ConcernCard from '@/components/dashboard/ConcernCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Plus, Search, Filter, MessageSquare } from 'lucide-react';
import { ChatStatus } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const { skinChats, products, individualRoutines, createSkinChat, archiveChat, deleteChat } =
    useAppContext();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ChatStatus | 'all'>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredChats = skinChats.filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.primaryConcern.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStartNewChat = () => {
    const newChat = createSkinChat('New Skin Assessment', 'General Skincare');
    router.push(`/assistant?chatId=${newChat.chatId}`);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteChat(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <PageWrapper title="Chat History">
      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations by concern or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181822] border border-[#2D2D3D] text-[#F5F3FF] text-sm placeholder-[#A1A1AA] focus:border-[#A78BFA] outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex p-1 rounded-xl bg-[#181822] border border-[#2D2D3D] text-xs">
              {(['all', 'active', 'completed', 'archived'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    filter === tab
                      ? 'bg-[#A78BFA] text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-[#F5F3FF]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartNewChat}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-purple-950/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Chats Grid */}
        {filteredChats.length === 0 ? (
          <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-12 text-center flex flex-col items-center justify-center">
            <MessageSquare className="w-12 h-12 text-[#A78BFA] opacity-50 mb-3" />
            <h3 className="text-base font-bold text-[#F5F3FF]">No conversations found</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-4">
              {search
                ? 'No chats matched your search query. Try another keyword.'
                : 'You have not completed any skincare assessments yet.'}
            </p>
            <button
              onClick={handleStartNewChat}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-xs font-medium"
            >
              Start New Assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChats.map((chat) => {
              const chatProducts = products.filter((p) => p.sourceChatIds.includes(chat.chatId));
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
                  onDelete={(id) => setDeleteTargetId(id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Skin Assessment"
        description="Are you sure you want to delete this conversation? This will permanently archive its associated routine and recalculate the master timetable."
        confirmLabel="Delete Conversation"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </PageWrapper>
  );
}
