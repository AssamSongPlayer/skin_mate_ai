import type {
  IndividualRoutine,
  Product,
  UserProfile,
  MasterTimetable,
  TimetableActivity,
  ProductCategory,
  TimeOfDay,
} from '@/types';
import {
  saveMasterTimetable,
  generateCalendarTasksFromTimetable,
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

// Morning order: cleanser → toner → serum → treatment → moisturizer → sunscreen
const MORNING_ORDER: ProductCategory[] = [
  'cleanser', 'toner', 'serum', 'treatment', 'eye_cream',
  'moisturizer', 'sunscreen', 'other',
];

// Night order: cleanser → toner → treatment → serum → moisturizer
const NIGHT_ORDER: ProductCategory[] = [
  'cleanser', 'toner', 'treatment', 'serum', 'eye_cream',
  'facial_oil', 'moisturizer', 'other',
];

const DEDUP_CATEGORIES = new Set<ProductCategory>(['cleanser', 'moisturizer', 'sunscreen']);

function categoryOrder(cat: ProductCategory, tod: TimeOfDay): number {
  const list = tod === 'morning' ? MORNING_ORDER : NIGHT_ORDER;
  const idx = list.indexOf(cat);
  return idx === -1 ? 99 : idx;
}

function scheduledTime(order: number, tod: TimeOfDay): string {
  if (tod === 'morning') {
    const base = 7 * 60 + order * 5;
    const h = Math.floor(base / 60);
    const m = base % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } else {
    const base = 21 * 60 + order * 5;
    const h = Math.floor(base / 60);
    const m = base % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}

export function mergeTimetablesLocally(
  routines: IndividualRoutine[],
  products: Product[]
): MasterTimetable {
  const productMap = new Map(products.map((p) => [p.productId, p]));

  type ActivityAccum = {
    productName: string;
    productCategory: ProductCategory;
    action: string;
    duration: number;
    frequency: string;
    sourceChatIds: Set<string>;
    sourceRoutineIds: Set<string>;
  };

  const morningMap = new Map<string, ActivityAccum>();
  const nightMap = new Map<string, ActivityAccum>();

  for (const routine of routines) {
    if (routine.status !== 'active') continue;
    for (const task of routine.tasks) {
      const tods: TimeOfDay[] =
        task.timeOfDay === 'both' ? ['morning', 'night'] : [task.timeOfDay as TimeOfDay];

      for (const tod of tods) {
        const map = tod === 'morning' ? morningMap : nightMap;
        // Dedup by category for certain categories, else by productId
        const key = DEDUP_CATEGORIES.has(task.productCategory)
          ? task.productCategory
          : task.productId;

        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.sourceChatIds.add(task.sourceChatId);
          existing.sourceRoutineIds.add(routine.routineId);
        } else {
          map.set(key, {
            productName: task.productName,
            productCategory: task.productCategory,
            action: task.action,
            duration: task.duration,
            frequency: task.frequency,
            sourceChatIds: new Set([task.sourceChatId]),
            sourceRoutineIds: new Set([routine.routineId]),
          });
        }
      }
    }
  }

  function buildActivities(
    map: Map<string, ActivityAccum>,
    tod: TimeOfDay
  ): TimetableActivity[] {
    const entries = Array.from(map.entries());
    entries.sort((a, b) => categoryOrder(a[1].productCategory, tod) - categoryOrder(b[1].productCategory, tod));

    return entries.map(([, acc], idx) => {
      const chatIds = Array.from(acc.sourceChatIds);
      const routineIds = Array.from(acc.sourceRoutineIds);
      return {
        activityId: generateId(),
        productId: generateId(),
        productName: acc.productName,
        productCategory: acc.productCategory,
        action: acc.action,
        timeOfDay: tod,
        scheduledTime: scheduledTime(idx, tod),
        order: idx + 1,
        duration: acc.duration,
        frequency: acc.frequency,
        sourceChatIds: chatIds,
        sourceRoutineIds: routineIds,
        isShared: chatIds.length > 1,
        notes: '',
      };
    });
  }

  const morningActivities = buildActivities(morningMap, 'morning');
  const nightActivities = buildActivities(nightMap, 'night');

  const timetable: MasterTimetable = {
    timetableId: generateId(),
    version: 1,
    generatedAt: now(),
    sourceRoutineIds: routines.map((r) => r.routineId),
    morningActivities,
    nightActivities,
    conflicts: [],
    status: 'active',
    aiAnalysis:
      'Timetable generated locally. Products are ordered by category for optimal skin absorption.',
  };

  return timetable;
}

export async function recalculateMasterTimetable(
  routines: IndividualRoutine[],
  products: Product[],
  userProfile: UserProfile | null
): Promise<MasterTimetable> {
  try {
    const response = await fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routines, products, userProfile }),
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    if (data.timetable) {
      saveMasterTimetable(data.timetable);
      return data.timetable;
    }
    throw new Error('Invalid response');
  } catch {
    // Fallback to local merge
    const timetable = mergeTimetablesLocally(routines, products);
    saveMasterTimetable(timetable);
    return timetable;
  }
}

export function updateCalendarFromTimetable(
  timetable: MasterTimetable,
  daysAhead: number = 30
): void {
  generateCalendarTasksFromTimetable(timetable, daysAhead);
}
