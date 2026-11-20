'use client';

import React, { useState } from 'react';
import { IndividualRoutine, RoutineTask } from '@/types';
import { Clock, Play, Pause, Trash2, Calendar, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface RoutineCardProps {
  routine: IndividualRoutine;
  onPause?: (routineId: string) => void;
  onResume?: (routineId: string) => void;
  onDelete?: (routineId: string) => void;
}

export default function RoutineCard({ routine, onPause, onResume, onDelete }: RoutineCardProps) {
  const [expanded, setExpanded] = useState(true);

  const morningTasks = routine.tasks.filter(
    (t) => t.timeOfDay === 'morning' || t.timeOfDay === 'both'
  );
  const nightTasks = routine.tasks.filter(
    (t) => t.timeOfDay === 'night' || t.timeOfDay === 'both'
  );

  const isPaused = routine.status === 'paused';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-6 shadow-xl ${
        isPaused
          ? 'bg-[#181822]/60 border-[#2D2D3D] opacity-75'
          : 'bg-[#181822] border-[#2D2D3D] hover:border-[#A78BFA]/40'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                routine.status === 'active'
                  ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                  : 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30'
              }`}
            >
              {routine.status.toUpperCase()}
            </span>
            <span className="text-xs text-[#A1A1AA]">Version {routine.version}</span>
          </div>
          <h3 className="text-lg font-bold text-[#F5F3FF]">{routine.chatTitle}</h3>
          {routine.notes && <p className="text-xs text-[#A1A1AA] mt-0.5">{routine.notes}</p>}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {routine.status === 'active' ? (
            <button
              onClick={() => onPause?.(routine.routineId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-xs font-medium text-[#FBBF24] border border-[#2D2D3D] transition-all"
              title="Pause routine"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => onResume?.(routine.routineId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-xs font-medium text-[#34D399] border border-[#2D2D3D] transition-all"
              title="Resume routine"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(routine.routineId)}
              className="p-1.5 rounded-xl bg-[#20202C] hover:bg-[#FB7185]/20 text-[#A1A1AA] hover:text-[#FB7185] border border-[#2D2D3D] transition-all"
              title="Delete routine"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-xl bg-[#20202C] text-[#A1A1AA] hover:text-[#F5F3FF] border border-[#2D2D3D] transition-all"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dates badge */}
      <div className="flex flex-wrap items-center gap-4 py-2 px-3 rounded-xl bg-[#12121A] border border-[#2D2D3D] text-xs text-[#A1A1AA] mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>Started: {routine.startDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#C4B5FD]" />
          <span>Review Due: {routine.reviewDate}</span>
        </div>
        <div>
          <span>{routine.tasks.length} Step{routine.tasks.length !== 1 ? 's' : ''} total</span>
        </div>
      </div>

      {/* Expanded Tasks List */}
      {expanded && (
        <div className="space-y-4 pt-2">
          {/* Morning Routine */}
          {morningTasks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-2.5 flex items-center gap-1.5">
                <span>☀️ Morning Steps</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#A78BFA]/10">
                  {morningTasks.length}
                </span>
              </h4>
              <div className="space-y-2">
                {morningTasks.map((task, i) => (
                  <TaskRow key={task.taskId || i} task={task} index={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Night Routine */}
          {nightTasks.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C4B5FD] mb-2.5 flex items-center gap-1.5">
                <span>🌙 Night Steps</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#C4B5FD]/10">
                  {nightTasks.length}
                </span>
              </h4>
              <div className="space-y-2">
                {nightTasks.map((task, i) => (
                  <TaskRow key={task.taskId || i} task={task} index={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, index }: { task: RoutineTask; index: number }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-xs">
      <div className="w-6 h-6 rounded-full bg-[#A78BFA]/15 text-[#A78BFA] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#F5F3FF] text-sm">{task.productName}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181822] text-[#A78BFA] uppercase tracking-wider">
            {task.productCategory}
          </span>
          <span className="text-xs text-[#A1A1AA]">{task.frequency}</span>
        </div>
        <p className="text-xs text-[#A1A1AA] mt-1">{task.action}</p>
        {task.instructions && (
          <p className="text-[11px] text-[#A1A1AA]/80 mt-1 italic">{task.instructions}</p>
        )}
      </div>
    </div>
  );
}
