'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { CalendarTask } from '@/types';
import { Check, Sun, Moon, Clock, Tag } from 'lucide-react';

interface TodayRoutineProps {
  tasks: CalendarTask[];
  onTaskComplete?: (taskId: string) => void;
}

export default function TodayRoutine({ tasks, onTaskComplete }: TodayRoutineProps) {
  const [activeTab, setActiveTab] = useState<'morning' | 'night'>('morning');
  const { markTaskCompleted } = useAppContext();

  const morningTasks = tasks.filter(t => t.timeOfDay === 'morning' || t.timeOfDay === 'both');
  const nightTasks = tasks.filter(t => t.timeOfDay === 'night' || t.timeOfDay === 'both');

  const displayTasks = activeTab === 'morning' ? morningTasks : nightTasks;

  const handleCheck = (taskId: string) => {
    markTaskCompleted(taskId);
    onTaskComplete?.(taskId);
  };

  return (
    <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-[#F5F3FF]">Today&apos;s Routine</h2>
        <div className="flex gap-1 p-1 bg-[#20202C] rounded-xl">
          <button
            onClick={() => setActiveTab('morning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'morning'
                ? 'bg-[#A78BFA] text-white'
                : 'text-[#A1A1AA] hover:text-[#F5F3FF]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Morning
            {morningTasks.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'morning' ? 'bg-white/20' : 'bg-[#2D2D3D]'
              }`}>
                {morningTasks.filter(t => t.status === 'completed').length}/{morningTasks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('night')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'night'
                ? 'bg-[#A78BFA] text-white'
                : 'text-[#A1A1AA] hover:text-[#F5F3FF]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Night
            {nightTasks.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'night' ? 'bg-white/20' : 'bg-[#2D2D3D]'
              }`}>
                {nightTasks.filter(t => t.status === 'completed').length}/{nightTasks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {displayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[#20202C] flex items-center justify-center mb-3">
            {activeTab === 'morning' ? (
              <Sun className="w-6 h-6 text-[#A1A1AA]" />
            ) : (
              <Moon className="w-6 h-6 text-[#A1A1AA]" />
            )}
          </div>
          <p className="text-sm text-[#A1A1AA]">No {activeTab} tasks for today</p>
          <p className="text-xs text-[#A1A1AA]/60 mt-1">Complete a skin assessment to build your routine</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayTasks.map((task) => (
            <div
              key={task.taskId}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                task.status === 'completed'
                  ? 'bg-[#34D399]/5 border-[#34D399]/20 opacity-70'
                  : 'bg-[#20202C] border-[#2D2D3D] hover:border-[#A78BFA]/30'
              }`}
            >
              <button
                onClick={() => task.status !== 'completed' && handleCheck(task.taskId)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  task.status === 'completed'
                    ? 'bg-[#34D399] border-[#34D399]'
                    : 'border-[#2D2D3D] hover:border-[#A78BFA]'
                }`}
              >
                {task.status === 'completed' && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-[#A1A1AA]' : 'text-[#F5F3FF]'}`}>
                    {task.productName}
                  </span>
                  <span className="text-xs text-[#A1A1AA]">{task.action}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {task.scheduledTime && (
                    <span className="flex items-center gap-1 text-xs text-[#A1A1AA]">
                      <Clock className="w-3 h-3" />
                      {task.scheduledTime}
                    </span>
                  )}
                  {task.sourceChatIds?.slice(0, 1).map((chatId) => (
                    <span key={chatId} className="flex items-center gap-1 text-xs px-1.5 py-0.5 bg-[#A78BFA]/10 text-[#A78BFA] rounded-full">
                      <Tag className="w-2.5 h-2.5" />
                      Chat
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
