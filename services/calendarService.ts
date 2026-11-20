import type { CalendarTask, DailyProgress } from '@/types';
import {
  getCalendarTasks,
  markTaskCompleted,
  markTaskSkipped,
  getDailyProgress,
} from '@/lib/storageService';

export function getTasksForDate(date: string): CalendarTask[] {
  return getCalendarTasks(date);
}

export function getTasksForDateRange(start: string, end: string): CalendarTask[] {
  const all = getCalendarTasks();
  return all.filter((t) => t.date >= start && t.date <= end);
}

export function getMonthlyProgress(
  year: number,
  month: number
): Record<string, DailyProgress> {
  const result: Record<string, DailyProgress> = {};
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    result[dateStr] = getDailyProgress(dateStr);
  }

  return result;
}

export function getStreakDays(): number {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const progress = getDailyProgress(dateStr);

    if (progress.totalTasks === 0) {
      // No tasks scheduled — skip this day without breaking streak (don't count it)
      continue;
    }

    if (progress.completionPercentage === 100) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function markComplete(taskId: string): void {
  markTaskCompleted(taskId);
}

export function markSkipped(taskId: string): void {
  markTaskSkipped(taskId);
}
