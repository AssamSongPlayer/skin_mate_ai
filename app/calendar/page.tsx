'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

export default function CalendarPage() {
  const { calendarTasks, markTaskCompleted, markTaskSkipped } = useAppContext();

  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now.toISOString().split('T')[0]);
  }, []);

  const prevMonth = () => {
    if (!currentDate) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    if (!currentDate) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (!currentDate || !selectedDate) {
    return (
      <PageWrapper title="Calendar">
        <div className="p-8 text-[#A1A1AA]">Loading Calendar...</div>
      </PageWrapper>
    );
  }

  const selectedDateTasks = calendarTasks.filter((t) => t.date === selectedDate);
  const morningTasks = selectedDateTasks.filter(
    (t) => t.timeOfDay === 'morning' || t.timeOfDay === 'both'
  );
  const nightTasks = selectedDateTasks.filter(
    (t) => t.timeOfDay === 'night' || t.timeOfDay === 'both'
  );

  return (
    <PageWrapper title="Calendar">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#181822] border border-[#2D2D3D] shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F3FF]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Selected Date: <span className="text-[#C4B5FD] font-medium">{selectedDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-[#A1A1AA] hover:text-[#F5F3FF] border border-[#2D2D3D] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDate(now.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-xs font-semibold text-[#F5F3FF] border border-[#2D2D3D] transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-[#A1A1AA] hover:text-[#F5F3FF] border border-[#2D2D3D] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar and Day Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <CalendarGrid
              currentDate={currentDate}
              tasks={calendarTasks}
              selectedDate={selectedDate}
              onSelectDate={(dateStr) => setSelectedDate(dateStr)}
            />
          </div>

          {/* Selected Day Agenda */}
          <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-5 shadow-xl flex flex-col h-full">
            <div className="pb-4 border-b border-[#2D2D3D] mb-4">
              <h3 className="text-base font-bold text-[#F5F3FF]">Schedule for {selectedDate}</h3>
              <p className="text-xs text-[#A1A1AA]">
                {selectedDateTasks.filter((t) => t.status === 'completed').length} of {selectedDateTasks.length} tasks completed
              </p>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#A1A1AA]">
                <Clock className="w-10 h-10 mb-2 opacity-40 text-[#A78BFA]" />
                <p className="text-xs font-medium">No tasks scheduled for this day</p>
                <p className="text-[11px] opacity-60 mt-1">Generate a routine to automatically populate days ahead</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Morning Tasks */}
                {morningTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-2">
                      <Sun className="w-3.5 h-3.5" />
                      <span>Morning</span>
                    </div>
                    <div className="space-y-2">
                      {morningTasks.map((t) => (
                        <CalendarTaskItem
                          key={t.taskId}
                          task={t}
                          onComplete={markTaskCompleted}
                          onSkip={markTaskSkipped}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Night Tasks */}
                {nightTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C4B5FD] mb-2">
                      <Moon className="w-3.5 h-3.5" />
                      <span>Night</span>
                    </div>
                    <div className="space-y-2">
                      {nightTasks.map((t) => (
                        <CalendarTaskItem
                          key={t.taskId}
                          task={t}
                          onComplete={markTaskCompleted}
                          onSkip={markTaskSkipped}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function CalendarTaskItem({
  task,
  onComplete,
  onSkip,
}: {
  task: any;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
}) {
  const isDone = task.status === 'completed';

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
        isDone
          ? 'bg-[#34D399]/10 border-[#34D399]/30 opacity-70'
          : 'bg-[#20202C] border-[#2D2D3D] hover:border-[#A78BFA]/40'
      }`}
    >
      <button
        onClick={() => onComplete(task.taskId)}
        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
          isDone
            ? 'bg-[#34D399] border-[#34D399] text-white'
            : 'border-[#A1A1AA] hover:border-[#A78BFA]'
        }`}
      >
        {isDone && <Check className="w-3 h-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-xs font-semibold truncate ${isDone ? 'line-through text-[#A1A1AA]' : 'text-[#F5F3FF]'}`}>
            {task.productName}
          </span>
          <span className="text-[10px] text-[#A78BFA] font-medium flex-shrink-0">
            {task.scheduledTime}
          </span>
        </div>
        <p className="text-[11px] text-[#A1A1AA] mt-0.5">{task.action}</p>
      </div>
    </div>
  );
}
