'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import ChatInterface from '@/components/chat/ChatInterface';
import { Plus, MessageSquare, Sparkles, ChevronRight, History } from 'lucide-react';
import { SkinChat } from '@/types';

function AssistantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedChatId = searchParams.get('chatId');

  const {
    skinChats,
    activeChatId,
    setActiveChatId,
    createSkinChat,
  } = useAppContext();

  // Find active chat or default to the most recent active one
  const currentChat =
    skinChats.find((c) => c.chatId === requestedChatId) ||
    skinChats.find((c) => c.chatId === activeChatId) ||
    skinChats.find((c) => c.status !== 'archived') ||
    null;

  const handleNewChat = () => {
    const newChat = createSkinChat('New Skin Assessment', 'General Skincare');
    router.push(`/assistant?chatId=${newChat.chatId}`);
  };

  return (
    <PageWrapper title="AI Skin Assistant">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Left Side: Recent Chats List */}
        <div className="hidden lg:flex flex-col h-[calc(100vh-10rem)] rounded-2xl bg-[#12121A] border border-[#2D2D3D] p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#2D2D3D] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Conversations</span>
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg bg-[#A78BFA]/10 text-[#A78BFA] hover:bg-[#A78BFA]/20 transition-all"
              title="Start New Assessment"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
            {skinChats.map((c) => {
              const isCurrent = currentChat?.chatId === c.chatId;
              return (
                <button
                  key={c.chatId}
                  onClick={() => {
                    setActiveChatId(c.chatId);
                    router.push(`/assistant?chatId=${c.chatId}`);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs ${
                    isCurrent
                      ? 'bg-[#20202C] border border-[#A78BFA]/40 text-[#F5F3FF] shadow-sm'
                      : 'text-[#A1A1AA] hover:bg-[#181822] hover:text-[#F5F3FF]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? 'text-[#A78BFA]' : ''}`} />
                    <span className="truncate font-medium">{c.title}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40 flex-shrink-0 ml-1" />
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#2D2D3D]">
            <button
              onClick={() => router.push('/history')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#181822] hover:bg-[#20202C] text-[#A1A1AA] hover:text-[#F5F3FF] text-xs font-medium border border-[#2D2D3D] transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Full Chat History</span>
            </button>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          {currentChat ? (
            <ChatInterface key={currentChat.chatId} chat={currentChat} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] rounded-2xl bg-[#12121A] border border-[#2D2D3D] p-8 text-center shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white mb-4 shadow-xl shadow-purple-950/40">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#F5F3FF] mb-2">No Conversation Selected</h2>
              <p className="text-sm text-[#A1A1AA] max-w-md mb-6 leading-relaxed">
                Start a new consultation with Skin Mate. Tell your AI assistant about any skin concern, whether acne, pigmentation, dryness, or aging.
              </p>
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white font-semibold text-sm shadow-lg shadow-purple-950/50 hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Assessment</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#A1A1AA]">Loading AI Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
