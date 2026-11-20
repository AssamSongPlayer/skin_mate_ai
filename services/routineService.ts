'use client';

import type { IndividualRoutine, RoutineTask, RoutineStatus, Product, UserProfile } from '@/types';
import {
  getIndividualRoutines,
  saveIndividualRoutine,
  updateRoutineStatus,
} from '@/lib/storageService';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

export function calculateReviewDate(startDate: string, daysAhead: number = 28): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export function createRoutineFromAIResponse(
  chatId: string,
  aiRoutine: any,
  chatTitle: string
): IndividualRoutine {
  const startDate = new Date().toISOString().split('T')[0];
  const reviewDate = calculateReviewDate(startDate, 28);

  const rawTasks: any[] = Array.isArray(aiRoutine?.tasks) ? aiRoutine.tasks : [];
  const tasks: RoutineTask[] = rawTasks.map((t: any, idx: number) => ({
    taskId: t.taskId ?? generateId(),
    productId: t.productId ?? generateId(),
    productName: t.productName ?? t.name ?? 'Unknown Product',
    productCategory: t.productCategory ?? t.category ?? 'other',
    action: t.action ?? 'Apply as directed',
    timeOfDay: t.timeOfDay ?? 'both',
    order: t.order ?? idx + 1,
    duration: typeof t.duration === 'number' ? t.duration : 2,
    frequency: t.frequency ?? 'Daily',
    instructions: t.instructions ?? t.usageInstructions ?? '',
    precautions: Array.isArray(t.precautions) ? t.precautions : [],
    sourceChatId: chatId,
  }));

  const routine: IndividualRoutine = {
    routineId: aiRoutine?.routineId ?? generateId(),
    chatId,
    chatTitle,
    tasks,
    startDate,
    reviewDate,
    status: 'active',
    version: aiRoutine?.version ?? 1,
    notes: aiRoutine?.notes ?? '',
    createdAt: now(),
    updatedAt: now(),
  };

  saveIndividualRoutine(routine);
  return routine;
}

export async function generateIndividualRoutine(
  chatId: string,
  chatTitle: string,
  selectedProducts: Product[],
  userProfile: UserProfile | null
): Promise<IndividualRoutine> {
  const startDate = new Date().toISOString().split('T')[0];
  const reviewDate = calculateReviewDate(startDate, 28);

  // Try API first
  try {
    const res = await fetch('/api/routine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId,
        selectedProducts,
        userProfile,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.routine) {
        saveIndividualRoutine(data.routine);
        return data.routine;
      }
    }
  } catch {
    // Fall back to local creation
  }

  // Fallback: build high quality routine directly from selected products
  const tasks: RoutineTask[] = selectedProducts.map((p, idx) => ({
    taskId: generateId(),
    productId: p.productId,
    productName: p.name,
    productCategory: p.category,
    action: p.usageInstructions || `Apply ${p.name} evenly onto skin.`,
    timeOfDay: p.timeOfDay || 'both',
    order: idx + 1,
    duration: 2,
    frequency: p.frequency || 'Daily',
    instructions: p.usageInstructions || 'Follow packaging instructions.',
    precautions: p.precautions || [],
    sourceChatId: chatId,
  }));

  const routine: IndividualRoutine = {
    routineId: generateId(),
    chatId,
    chatTitle,
    tasks,
    startDate,
    reviewDate,
    status: 'active',
    version: 1,
    notes: `Personalized routine formulated for ${chatTitle}`,
    createdAt: now(),
    updatedAt: now(),
  };

  saveIndividualRoutine(routine);
  return routine;
}

export function pauseRoutine(routineId: string): void {
  updateRoutineStatus(routineId, 'paused');
}

export function resumeRoutine(routineId: string): void {
  updateRoutineStatus(routineId, 'active');
}

export function deleteRoutine(routineId: string): void {
  updateRoutineStatus(routineId, 'archived');
}

export function getActiveRoutines(): IndividualRoutine[] {
  return getIndividualRoutines().filter((r) => r.status === 'active');
}
