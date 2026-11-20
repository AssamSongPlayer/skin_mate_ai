'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { ChatMessage, Product, SkinChat } from '@/types';
import {
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  Plus,
  ArrowRight,
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatCompletionModal from './ChatCompletionModal';
import { sendChatMessage } from '@/services/groqService';
import { buildSystemPrompt, extractConcernSummary } from '@/services/chatService';
import { generateIndividualRoutine } from '@/services/routineService';

interface ChatInterfaceProps {
  chat: SkinChat;
}

export default function ChatInterface({ chat }: ChatInterfaceProps) {
  const router = useRouter();
  const {
    getMessages,
    addMessage,
    userProfile,
    saveSelectedProducts,
    upsertRoutine,
    completeChat,
    renameChat,
    createSkinChat,
    refreshMasterTimetable,
    navigate,
  } = useAppContext();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    chat.selectedProductIds || []
  );
  const [collectedProducts, setCollectedProducts] = useState<Product[]>([]);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = getMessages(chat.chatId);
  const isChatCompleted = chat.status === 'completed';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial greeting if new chat
  useEffect(() => {
    if (messages.length === 0) {
      const greetingMsg: ChatMessage = {
        messageId: 'welcome_' + Date.now(),
        chatId: chat.chatId,
        role: 'assistant',
        content: `Hello ${userProfile?.name ? userProfile.name : ''}! I am Skin Mate, your personal AI skincare companion.\n\nTell me about what you are currently noticing with your skin (such as acne, dark spots, sensitivity, or dryness), and how long you have had this concern.`,
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };
      addMessage(chat.chatId, greetingMsg);
    }
  }, [chat.chatId, messages.length, userProfile?.name, addMessage]);

  const handleSend = async (customPrompt?: string) => {
    if (isChatCompleted) return; // Prevent any further messages if completed

    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    if (!customPrompt) {
      setInput('');
    }
    setError(null);

    const userMsg: ChatMessage = {
      messageId: 'msg_' + Date.now(),
      chatId: chat.chatId,
      role: 'user',
      content: textToSend,
      messageType: 'text',
      createdAt: new Date().toISOString(),
    };

    addMessage(chat.chatId, userMsg);
    const updatedMessages = [...messages, userMsg];

    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(userProfile);
      const aiResponse = await sendChatMessage(
        chat.chatId,
        updatedMessages,
        systemPrompt,
        userProfile
      );

      const aiMsg: ChatMessage = {
        messageId: 'ai_' + Date.now(),
        chatId: chat.chatId,
        role: 'assistant',
        content: aiResponse.message || '',
        messageType: aiResponse.type || 'text',
        interactiveData: aiResponse.products
          ? {
              products: aiResponse.products,
              nextAction: aiResponse.nextAction || 'await_product_selection',
              allowMultipleSelection: aiResponse.allowMultipleSelection ?? true,
            }
          : null,
        createdAt: new Date().toISOString(),
      };

      if (aiResponse.products && aiResponse.products.length > 0) {
        setCollectedProducts((prev) => {
          const map = new Map(prev.map((p) => [p.productId, p]));
          aiResponse.products?.forEach((p) => map.set(p.productId, p));
          return Array.from(map.values());
        });
      }

      addMessage(chat.chatId, aiMsg);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelectProduct = (product: Product) => {
    if (isChatCompleted) return;

    setSelectedProductIds((prev) => {
      const next = prev.includes(product.productId)
        ? prev.filter((id) => id !== product.productId)
        : [...prev, product.productId];
      return next;
    });

    setCollectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === product.productId);
      if (!exists) return [...prev, product];
      return prev;
    });
  };

  const handleConfirmSelections = () => {
    if (isChatCompleted) return;

    const selected = collectedProducts.filter((p) => selectedProductIds.includes(p.productId));
    saveSelectedProducts(chat.chatId, selected);
    setIsCompletionModalOpen(true);
  };

  const handleCompleteAssessment = async () => {
    const selected = collectedProducts.filter((p) => selectedProductIds.includes(p.productId));

    // Derive a specific, problem-based chat title from the conversation
    const { title: resolvedTitle, concern: resolvedConcern } = extractConcernSummary(
      messages,
      chat.primaryConcern
    );

    // Rename chat with the problem title
    renameChat(chat.chatId, resolvedTitle);

    const routine = await generateIndividualRoutine(
      chat.chatId,
      resolvedTitle,
      selected,
      userProfile
    );

    upsertRoutine(routine);

    // Complete the chat and lock it from further messaging
    completeChat(chat.chatId, {
      primaryConcern: resolvedConcern,
      severity: 'moderate',
      duration: 'Ongoing',
      affectedAreas: ['Face'],
      triggers: [],
      previousTreatments: [],
      currentHabits: [],
      allergies: userProfile?.allergies || [],
      skinType: userProfile?.skinType || 'Unknown',
      expectations: ['Clear, balanced, healthy skin'],
    });

    await refreshMasterTimetable();
    setIsCompletionModalOpen(false);
    navigate('routines');
    router.push('/routines');
  };

  const handleStartNewChat = () => {
    const newChat = createSkinChat('New Skin Assessment', 'General Skincare');
    navigate('chat');
    router.push(`/assistant?chatId=${newChat.chatId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto rounded-2xl bg-[#12121A] border border-[#2D2D3D] overflow-hidden shadow-2xl">
      {/* Top chat bar */}
      <div className="px-6 py-3.5 border-b border-[#2D2D3D] bg-[#181822]/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-purple-950/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#F5F3FF]">{chat.title}</h2>
              {isChatCompleted && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A1A1AA]">{chat.primaryConcern}</p>
          </div>
        </div>

        {!isChatCompleted && selectedProductIds.length > 0 && (
          <button
            onClick={() => setIsCompletionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] hover:bg-[#34D399]/25 text-xs font-medium transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finalize & End Chat ({selectedProductIds.length})</span>
          </button>
        )}

        {isChatCompleted && (
          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-xs font-semibold shadow hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Assessment</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.messageId}
            message={msg}
            selectedProductIds={selectedProductIds}
            onToggleSelectProduct={handleToggleSelectProduct}
            onAskAlternatives={(category) =>
              handleSend(
                `Can you suggest a different or more budget-friendly alternative for the ${category}?`
              )
            }
            onConfirmSelections={handleConfirmSelections}
          />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/30 text-[#FB7185] text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Area: either input bar OR completed consultation status */}
      {isChatCompleted ? (
        <div className="p-4 border-t border-[#2D2D3D] bg-[#181822] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#34D399]">
            <div className="w-6 h-6 rounded-full bg-[#34D399]/15 flex items-center justify-center flex-shrink-0">
              <Lock className="w-3.5 h-3.5 text-[#34D399]" />
            </div>
            <div>
              <p className="font-semibold text-[#F5F3FF]">Consultation Ended & Routine Active</p>
              <p className="text-[11px] text-[#A1A1AA]">
                Products have been confirmed and added to your routines. No further conversation can take place here.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                navigate('routines');
                router.push('/routines');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-[#F5F3FF] border border-[#2D2D3D] font-medium transition-colors"
            >
              <span>View Routine</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A78BFA]" />
            </button>
            <button
              onClick={handleStartNewChat}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white font-medium shadow hover:opacity-90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start New Chat</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-[#2D2D3D] bg-[#181822]">
          <div className="flex items-end gap-2 bg-[#20202C] rounded-2xl border border-[#2D2D3D] p-2 focus-within:border-[#A78BFA] transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (e.g. 'I get breakouts around my chin and my cheeks feel tight')"
              rows={1}
              className="flex-1 bg-transparent border-0 text-[#F5F3FF] text-sm placeholder-[#A1A1AA] resize-none outline-none max-h-32 p-1.5"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 disabled:opacity-40 text-white transition-all shadow-md flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ChatCompletionModal
        isOpen={isCompletionModalOpen}
        chatTitle={chat.title}
        selectedProducts={collectedProducts.filter((p) =>
          selectedProductIds.includes(p.productId)
        )}
        onConfirm={handleCompleteAssessment}
        onClose={() => setIsCompletionModalOpen(false)}
      />
    </div>
  );
}
