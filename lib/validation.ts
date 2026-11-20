import type {
  UserProfile,
  Product,
  IndividualRoutine,
  MasterTimetable,
} from '@/types';

// ── ID Generation ─────────────────────────────────────────────────────────────
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return (
    Math.random().toString(36).slice(2, 11) +
    '-' +
    Date.now().toString(36)
  );
}

// ── Safe JSON Parse ───────────────────────────────────────────────────────────
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ── Type-guard helpers ────────────────────────────────────────────────────────
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function requireString(obj: Record<string, unknown>, key: string): string {
  if (typeof obj[key] !== 'string') throw new Error(`Missing or invalid field: ${key}`);
  return obj[key] as string;
}

function requireNumber(obj: Record<string, unknown>, key: string): number {
  if (typeof obj[key] !== 'number') throw new Error(`Missing or invalid field: ${key}`);
  return obj[key] as number;
}

function optionalStringArray(obj: Record<string, unknown>, key: string): string[] {
  return Array.isArray(obj[key]) ? (obj[key] as string[]) : [];
}

// ── Validators ────────────────────────────────────────────────────────────────
export function validateUserProfile(data: unknown): UserProfile {
  if (!isObject(data)) throw new Error('UserProfile: expected an object');
  return {
    userId: requireString(data, 'userId'),
    name: requireString(data, 'name'),
    age: requireNumber(data, 'age'),
    skinType: (data['skinType'] as UserProfile['skinType']) ?? 'unknown',
    preferences: optionalStringArray(data, 'preferences'),
    allergies: optionalStringArray(data, 'allergies'),
    budget: (data['budget'] as UserProfile['budget']) ?? 'medium',
    currentProducts: optionalStringArray(data, 'currentProducts'),
    skinGoals: optionalStringArray(data, 'skinGoals'),
    createdAt: (data['createdAt'] as string) ?? new Date().toISOString(),
    updatedAt: (data['updatedAt'] as string) ?? new Date().toISOString(),
  };
}

export function validateProduct(data: unknown): Product {
  if (!isObject(data)) throw new Error('Product: expected an object');
  return {
    productId: requireString(data, 'productId'),
    name: requireString(data, 'name'),
    brand: typeof data['brand'] === 'string' ? data['brand'] : undefined,
    category: (data['category'] as Product['category']) ?? 'other',
    ingredients: optionalStringArray(data, 'ingredients'),
    keyIngredients: optionalStringArray(data, 'keyIngredients'),
    reason: (data['reason'] as string) ?? '',
    usageInstructions: (data['usageInstructions'] as string) ?? '',
    frequency: (data['frequency'] as string) ?? '',
    precautions: optionalStringArray(data, 'precautions'),
    timeOfDay: (data['timeOfDay'] as Product['timeOfDay']) ?? 'both',
    approximatePrice:
      typeof data['approximatePrice'] === 'string' ? data['approximatePrice'] : undefined,
    imageUrl: typeof data['imageUrl'] === 'string' ? data['imageUrl'] : undefined,
    sourceChatIds: optionalStringArray(data, 'sourceChatIds'),
    selectedStatus: Boolean(data['selectedStatus']),
    isOwned: Boolean(data['isOwned']),
  };
}

export function validateIndividualRoutine(data: unknown): IndividualRoutine {
  if (!isObject(data)) throw new Error('IndividualRoutine: expected an object');
  return {
    routineId: requireString(data, 'routineId'),
    chatId: requireString(data, 'chatId'),
    chatTitle: (data['chatTitle'] as string) ?? '',
    tasks: Array.isArray(data['tasks']) ? (data['tasks'] as IndividualRoutine['tasks']) : [],
    startDate: (data['startDate'] as string) ?? new Date().toISOString().split('T')[0],
    reviewDate: (data['reviewDate'] as string) ?? '',
    status: (data['status'] as IndividualRoutine['status']) ?? 'active',
    version: typeof data['version'] === 'number' ? data['version'] : 1,
    notes: (data['notes'] as string) ?? '',
    createdAt: (data['createdAt'] as string) ?? new Date().toISOString(),
    updatedAt: (data['updatedAt'] as string) ?? new Date().toISOString(),
  };
}

export function validateMasterTimetable(data: unknown): MasterTimetable {
  if (!isObject(data)) throw new Error('MasterTimetable: expected an object');
  return {
    timetableId: requireString(data, 'timetableId'),
    version: typeof data['version'] === 'number' ? data['version'] : 1,
    generatedAt: (data['generatedAt'] as string) ?? new Date().toISOString(),
    sourceRoutineIds: optionalStringArray(data, 'sourceRoutineIds'),
    morningActivities: Array.isArray(data['morningActivities'])
      ? (data['morningActivities'] as MasterTimetable['morningActivities'])
      : [],
    nightActivities: Array.isArray(data['nightActivities'])
      ? (data['nightActivities'] as MasterTimetable['nightActivities'])
      : [],
    conflicts: Array.isArray(data['conflicts'])
      ? (data['conflicts'] as MasterTimetable['conflicts'])
      : [],
    status: (data['status'] as MasterTimetable['status']) ?? 'draft',
    aiAnalysis: (data['aiAnalysis'] as string) ?? '',
  };
}
