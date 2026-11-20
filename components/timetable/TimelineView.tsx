'use client';

import React, { useState, useEffect } from 'react';
import { TimetableActivity, TimetableConflict, CalendarTask } from '@/types';
import { useAppContext } from '@/context/AppContext';
import {
  Clock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';

interface TimelineViewProps {
  morningActivities: TimetableActivity[];
  nightActivities: TimetableActivity[];
  conflicts?: TimetableConflict[];
  aiAnalysis?: string;
}

export default function TimelineView({
  morningActivities,
  nightActivities,
  conflicts = [],
  aiAnalysis,
}: TimelineViewProps) {
  const {
    calendarTasks,
    upsertCalendarTask,
    markTaskCompleted,
  } = useAppContext();

  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const changeDateBy = (days: number) => {
    if (!selectedDate) return;
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleToggleActivity = (activity: TimetableActivity) => {
    if (!selectedDate) return;

    // Find existing task for this activity and date
    const existing = calendarTasks.find(
      (t) => t.activityId === activity.activityId && t.date === selectedDate
    );

    if (existing) {
      if (existing.status === 'completed') {
        // Toggle back to pending
        upsertCalendarTask({
          ...existing,
          status: 'pending',
          completedAt: undefined,
        });
      } else {
        // Mark as completed
        upsertCalendarTask({
          ...existing,
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
      }
    } else {
      // Create a new task and mark completed
      const newTask: CalendarTask = {
        taskId: 'task_' + Math.random().toString(36).slice(2),
        activityId: activity.activityId,
        date: selectedDate,
        scheduledTime: activity.scheduledTime,
        timeOfDay: activity.timeOfDay,
        productName: activity.productName,
        productCategory: activity.productCategory,
        action: activity.action,
        status: 'completed',
        completedAt: new Date().toISOString(),
        sourceChatIds: activity.sourceChatIds,
      };
      upsertCalendarTask(newTask);
    }
  };

  const handleMarkAllDone = () => {
    if (!selectedDate) return;
    const allActivities = [...morningActivities, ...nightActivities];

    for (const act of allActivities) {
      const existing = calendarTasks.find(
        (t) => t.activityId === act.activityId && t.date === selectedDate
      );
      if (existing) {
        upsertCalendarTask({
          ...existing,
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
      } else {
        const newTask: CalendarTask = {
          taskId: 'task_' + Math.random().toString(36).slice(2),
          activityId: act.activityId,
          date: selectedDate,
          scheduledTime: act.scheduledTime,
          timeOfDay: act.timeOfDay,
          productName: act.productName,
          productCategory: act.productCategory,
          action: act.action,
          status: 'completed',
          completedAt: new Date().toISOString(),
          sourceChatIds: act.sourceChatIds,
        };
        upsertCalendarTask(newTask);
      }
    }
  };

  const allActivities = [...morningActivities, ...nightActivities];
  const completedCount = allActivities.filter((act) => {
    const task = calendarTasks.find(
      (t) => t.activityId === act.activityId && t.date === selectedDate
    );
    return task?.status === 'completed';
  }).length;

  const completionPercent =
    allActivities.length > 0 ? Math.round((completedCount / allActivities.length) * 100) : 0;

  if (!selectedDate) {
    return <div className="p-8 text-[#A1A1AA]">Loading Timetable Schedule...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Bar & Manual Completion Tracker */}
      <div className="p-5 rounded-2xl bg-[#181822] border border-[#2D2D3D] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F5F3FF]">
                Daily Schedule: {selectedDate}
              </h3>
              {completionPercent === 100 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  All Done
                </span>
              )}
            </div>
            <p className="text-xs text-[#A1A1AA]">
              {completedCount} of {allActivities.length} steps completed ({completionPercent}%)
            </p>
          </div>
        </div>

        {/* Date Navigation & Mark All */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#20202C] p-1 rounded-xl border border-[#2D2D3D]">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F5F3FF] hover:bg-[#181822] transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1 text-xs font-semibold text-[#F5F3FF] hover:text-[#A78BFA] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F5F3FF] hover:bg-[#181822] transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleMarkAllDone}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#34D399]/15 hover:bg-[#34D399]/25 text-[#34D399] border border-[#34D399]/30 text-xs font-semibold transition-all shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Day Complete</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#181822] h-2 rounded-full overflow-hidden border border-[#2D2D3D]">
        <div
          className="h-full bg-gradient-to-r from-[#A78BFA] to-[#34D399] transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* AI Analysis Summary */}
      {aiAnalysis && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#A78BFA]/10 to-[#8B5CF6]/10 border border-[#A78BFA]/30 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#A78BFA]/20 flex items-center justify-center text-[#A78BFA] flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F5F3FF]">AI Timetable Intelligence</h4>
            <p className="text-xs text-[#C4B5FD] leading-relaxed mt-1">{aiAnalysis}</p>
          </div>
        </div>
      )}

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FB7185]/10 border border-[#FB7185]/30 space-y-2">
          <div className="flex items-center gap-2 text-[#FB7185] font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Compatibility & Conflict Alerts ({conflicts.length})</span>
          </div>
          <div className="space-y-2 pt-1">
            {conflicts.map((c) => (
              <div
                key={c.conflictId}
                className="p-3 rounded-xl bg-[#181822] border border-[#FB7185]/20 text-xs"
              >
                <p className="text-[#F5F3FF] font-medium">{c.description}</p>
                <p className="text-[#34D399] mt-1">Recommendation: {c.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Morning & Night Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Morning Column */}
        <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#2D2D3D] mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌅</span>
              <div>
                <h3 className="text-base font-bold text-[#F5F3FF]">Morning Routine</h3>
                <p className="text-xs text-[#A1A1AA]">Optimal layering & daylight protection</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#A78BFA]/10 text-[#A78BFA]">
              {morningActivities.length} steps
            </span>
          </div>

          {morningActivities.length === 0 ? (
            <p className="text-xs text-[#A1A1AA] text-center py-8">
              No morning activities scheduled
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#A78BFA] before:to-[#2D2D3D]">
              {morningActivities.map((act) => {
                const task = calendarTasks.find(
                  (t) => t.activityId === act.activityId && t.date === selectedDate
                );
                const isCompleted = task?.status === 'completed';

                return (
                  <TimelineItem
                    key={act.activityId}
                    activity={act}
                    isCompleted={isCompleted}
                    onToggle={() => handleToggleActivity(act)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Night Column */}
        <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#2D2D3D] mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌙</span>
              <div>
                <h3 className="text-base font-bold text-[#F5F3FF]">Night Routine</h3>
                <p className="text-xs text-[#A1A1AA]">Restorative treatments & hydration</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#C4B5FD]/10 text-[#C4B5FD]">
              {nightActivities.length} steps
            </span>
          </div>

          {nightActivities.length === 0 ? (
            <p className="text-xs text-[#A1A1AA] text-center py-8">
              No night activities scheduled
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#C4B5FD] before:to-[#2D2D3D]">
              {nightActivities.map((act) => {
                const task = calendarTasks.find(
                  (t) => t.activityId === act.activityId && t.date === selectedDate
                );
                const isCompleted = task?.status === 'completed';

                return (
                  <TimelineItem
                    key={act.activityId}
                    activity={act}
                    isCompleted={isCompleted}
                    onToggle={() => handleToggleActivity(act)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  activity,
  isCompleted,
  onToggle,
}: {
  activity: TimetableActivity;
  isCompleted: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative group">
      {/* Node Dot */}
      <div
        className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
          isCompleted
            ? 'bg-[#34D399] border-[#34D399]'
            : 'bg-[#0B0B0F] border-[#A78BFA] group-hover:scale-125'
        }`}
      />

      <div
        className={`p-4 rounded-xl border transition-all duration-200 ${
          isCompleted
            ? 'bg-[#34D399]/10 border-[#34D399]/30 opacity-80'
            : 'bg-[#20202C] border-[#2D2D3D] hover:border-[#A78BFA]/40'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                isCompleted
                  ? 'bg-[#34D399] border-[#34D399] text-white'
                  : 'border-[#A1A1AA] hover:border-[#A78BFA]'
              }`}
              title={isCompleted ? 'Mark Pending' : 'Mark Completed for this day'}
            >
              {isCompleted && <Check className="w-3 h-3 text-white" />}
            </button>
            <span
              className={`flex items-center gap-1.5 text-xs font-bold ${
                isCompleted ? 'text-[#34D399]' : 'text-[#A78BFA]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {activity.scheduledTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {activity.isShared && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399]">
                <Users className="w-3 h-3" />
                Shared
              </span>
            )}
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#181822] text-[#A1A1AA]">
              {activity.productCategory}
            </span>
          </div>
        </div>

        <h4
          className={`text-sm font-semibold leading-snug ${
            isCompleted ? 'line-through text-[#A1A1AA]' : 'text-[#F5F3FF]'
          }`}
        >
          {activity.productName}
        </h4>
        <p className="text-xs text-[#A1A1AA] mt-1">{activity.action}</p>

        {activity.sourceChatIds && activity.sourceChatIds.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#2D2D3D]/60 flex items-center justify-between text-[10px]">
            <span className="font-medium text-[#C4B5FD] bg-[#A78BFA]/10 px-2 py-0.5 rounded-md">
              {activity.sourceChatIds.length} source concern{activity.sourceChatIds.length !== 1 ? 's' : ''}
            </span>
            <span className={isCompleted ? 'text-[#34D399] font-medium' : 'text-[#A1A1AA]'}>
              {isCompleted ? 'Completed for this date' : 'Click checkbox to mark done'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
