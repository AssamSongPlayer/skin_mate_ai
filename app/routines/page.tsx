'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import RoutineCard from '@/components/routines/RoutineCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ClipboardList, Plus, Sparkles, Calendar } from 'lucide-react';

export default function RoutinesPage() {
  const router = useRouter();
  const {
    individualRoutines,
    updateRoutineStatus,
    deleteRoutine,
  } = useAppContext();

  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);

  const activeRoutines = individualRoutines.filter((r) => r.status !== 'archived');

  const handlePause = async (id: string) => {
    await updateRoutineStatus(id, 'paused');
  };

  const handleResume = async (id: string) => {
    await updateRoutineStatus(id, 'active');
  };

  const handleConfirmDelete = async () => {
    if (deleteRoutineId) {
      await deleteRoutine(deleteRoutineId);
      setDeleteRoutineId(null);
    }
  };

  return (
    <PageWrapper title="My Routines">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#F5F3FF]">Personalized Skincare Routines</h2>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Each AI consultation generates its own independent routine, later merged into your Master Timetable.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/timetable')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-xs font-semibold text-[#F5F3FF] border border-[#2D2D3D] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>View Combined Timetable</span>
            </button>

            <button
              onClick={() => router.push('/assistant')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-purple-950/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Assessment</span>
            </button>
          </div>
        </div>

        {/* Routines Grid */}
        {activeRoutines.length === 0 ? (
          <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-12 text-center flex flex-col items-center justify-center">
            <ClipboardList className="w-12 h-12 text-[#A78BFA] opacity-50 mb-3" />
            <h3 className="text-base font-bold text-[#F5F3FF]">No active routines</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-4">
              Complete an AI assessment and confirm product recommendations to generate your first routine.
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
          <div className="grid grid-cols-1 gap-6">
            {activeRoutines.map((routine) => (
              <RoutineCard
                key={routine.routineId}
                routine={routine}
                onPause={handlePause}
                onResume={handleResume}
                onDelete={(id) => setDeleteRoutineId(id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteRoutineId)}
        title="Delete Routine"
        description="Are you sure you want to remove this routine? Removing it will recalculate the Master Timetable and Calendar schedule."
        confirmLabel="Delete Routine"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteRoutineId(null)}
      />
    </PageWrapper>
  );
}
