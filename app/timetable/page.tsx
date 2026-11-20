'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import TimelineView from '@/components/timetable/TimelineView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Calendar, RefreshCw, Sparkles, Clock, CheckCircle } from 'lucide-react';

export default function TimetablePage() {
  const router = useRouter();
  const { masterTimetable, refreshMasterTimetable } = useAppContext();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await refreshMasterTimetable();
    } finally {
      setIsRecalculating(false);
    }
  };

  const morningCount = masterTimetable?.morningActivities?.length || 0;
  const nightCount = masterTimetable?.nightActivities?.length || 0;
  const totalSteps = morningCount + nightCount;

  return (
    <PageWrapper title="Master Timetable">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#181822] border border-[#2D2D3D] shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] px-2.5 py-0.5 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20">
                Combined Schedule
              </span>
              {masterTimetable && (
                <span className="text-xs text-[#A1A1AA]">Version {masterTimetable.version}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#F5F3FF]">Intelligent Master Timetable</h2>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
              Harmonizes products across all your consultations, deduplicates shared cleansers and moisturizers, and arranges steps by safe application order.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-xs font-semibold text-[#F5F3FF] border border-[#2D2D3D] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#A78BFA] ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Timetable'}</span>
            </button>
            <button
              onClick={() => router.push('/calendar')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-purple-950/30"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open Calendar</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {isRecalculating ? (
          <div className="p-12 text-center rounded-2xl bg-[#181822] border border-[#2D2D3D]">
            <LoadingSpinner text="Analyzing routine compatibility & generating unified schedule..." />
          </div>
        ) : !masterTimetable || totalSteps === 0 ? (
          <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-12 text-center flex flex-col items-center justify-center">
            <Calendar className="w-12 h-12 text-[#A78BFA] opacity-50 mb-3" />
            <h3 className="text-base font-bold text-[#F5F3FF]">No Master Timetable Available</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-4">
              Complete an assessment and generate a routine to produce your unified skincare timetable.
            </p>
            <button
              onClick={() => router.push('/assistant')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white text-xs font-semibold shadow-lg shadow-purple-950/40"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Assessment</span>
            </button>
          </div>
        ) : (
          <TimelineView
            morningActivities={masterTimetable.morningActivities}
            nightActivities={masterTimetable.nightActivities}
            conflicts={masterTimetable.conflicts}
            aiAnalysis={masterTimetable.aiAnalysis}
          />
        )}
      </div>
    </PageWrapper>
  );
}
