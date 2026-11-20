'use client';

import React from 'react';
import { CalendarTask } from '@/types';
import { Check, Clock } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  tasks: CalendarTask[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export default function CalendarGrid({
  currentDate,
  tasks,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-5 shadow-xl">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-3 text-center">
        {weekDays.map((wd) => (
          <span key={wd} className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider py-1">
            {wd}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-transparent" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          const dayTasks = tasks.filter((t) => t.date === dateStr);
          const completedTasks = dayTasks.filter((t) => t.status === 'completed');
          const hasTasks = dayTasks.length > 0;
          const isAllDone = hasTasks && completedTasks.length === dayTasks.length;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`h-20 p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${
                isSelected
                  ? 'bg-[#20202C] border-[#A78BFA] shadow-md shadow-purple-950/40'
                  : isToday
                  ? 'bg-[#181822] border-[#A78BFA]/50'
                  : 'bg-[#12121A] border-[#2D2D3D] hover:border-[#A78BFA]/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-[#A78BFA] text-white'
                      : isSelected
                      ? 'text-[#A78BFA]'
                      : 'text-[#F5F3FF]'
                  }`}
                >
                  {day}
                </span>

                {isAllDone && (
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                )}
              </div>

              {/* Task indicators */}
              <div className="w-full">
                {hasTasks ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#A1A1AA]">
                      {completedTasks.length}/{dayTasks.length}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#20202C] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#A78BFA] to-[#34D399]"
                        style={{
                          width: `${(completedTasks.length / dayTasks.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#A1A1AA]/40">—</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
