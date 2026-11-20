// ── User ──────────────────────────────────────────────────────────────────────
export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  skinType: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal' | 'unknown';
  preferences: string[];
  allergies: string[];
  budget: 'low' | 'medium' | 'high';
  currentProducts: string[];
  skinGoals: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export type ChatStatus = 'active' | 'completed' | 'archived' | 'paused';

export interface SkinChat {
  chatId: string;
  userId: string;
  title: string;
  primaryConcern: string;
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  selectedProductIds: string[];
  individualRoutineId?: string;
  skinProfile?: SkinProfile;
}

export interface SkinProfile {
  primaryConcern: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  affectedAreas: string[];
  triggers: string[];
  previousTreatments: string[];
  currentHabits: string[];
  allergies: string[];
  skinType: string;
  expectations: string[];
}

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType =
  | 'text'
  | 'product_recommendation'
  | 'product_selection'
  | 'confirmation'
  | 'safety_alert'
  | 'routine_summary'
  | 'timetable'
  | 'alternatives';

export interface ChatMessage {
  messageId: string;
  chatId: string;
  role: MessageRole;
  content: string;
  messageType: MessageType;
  interactiveData?: ProductRecommendationData | null;
  createdAt: string;
  isStreaming?: boolean;
}

export interface ProductRecommendationData {
  products: Product[];
  nextAction: string;
  allowMultipleSelection: boolean;
  message?: string;
}

// ── Product ───────────────────────────────────────────────────────────────────
export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'treatment'
  | 'exfoliant'
  | 'mask'
  | 'eye_cream'
  | 'spot_treatment'
  | 'facial_oil'
  | 'mist'
  | 'other';

export interface Product {
  productId: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  ingredients: string[];
  keyIngredients: string[];
  reason: string;
  usageInstructions: string;
  frequency: string;
  precautions: string[];
  timeOfDay: 'morning' | 'night' | 'both';
  approximatePrice?: string;
  imageUrl?: string;
  sourceChatIds: string[];
  selectedStatus: boolean;
  isOwned: boolean;
}

// ── Routine ───────────────────────────────────────────────────────────────────
export type RoutineStatus = 'active' | 'paused' | 'completed' | 'archived';
export type TimeOfDay = 'morning' | 'night' | 'both';

export interface RoutineTask {
  taskId: string;
  productId: string;
  productName: string;
  productCategory: ProductCategory;
  action: string;
  timeOfDay: TimeOfDay;
  order: number;
  duration: number; // minutes
  frequency: string;
  instructions: string;
  precautions: string[];
  sourceChatId: string;
}

export interface IndividualRoutine {
  routineId: string;
  chatId: string;
  chatTitle: string;
  tasks: RoutineTask[];
  startDate: string;
  reviewDate: string;
  status: RoutineStatus;
  version: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Timetable ─────────────────────────────────────────────────────────────────
export type ConflictType =
  | 'ingredient_conflict'
  | 'timing_conflict'
  | 'frequency_conflict'
  | 'compatibility_unknown';

export interface TimetableConflict {
  conflictId: string;
  type: ConflictType;
  productIds: string[];
  description: string;
  recommendation: string;
}

export interface TimetableActivity {
  activityId: string;
  productId: string;
  productName: string;
  productCategory: ProductCategory;
  action: string;
  timeOfDay: TimeOfDay;
  scheduledTime: string; // "07:00"
  order: number;
  duration: number;
  frequency: string;
  sourceChatIds: string[];
  sourceRoutineIds: string[];
  isShared: boolean;
  notes: string;
}

export interface MasterTimetable {
  timetableId: string;
  version: number;
  generatedAt: string;
  sourceRoutineIds: string[];
  morningActivities: TimetableActivity[];
  nightActivities: TimetableActivity[];
  conflicts: TimetableConflict[];
  status: 'active' | 'draft' | 'outdated';
  aiAnalysis: string;
}

// ── Calendar ──────────────────────────────────────────────────────────────────
export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'missed';

export interface CalendarTask {
  taskId: string;
  activityId: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string;
  timeOfDay: TimeOfDay;
  productName: string;
  productCategory: ProductCategory;
  action: string;
  status: TaskStatus;
  completedAt?: string;
  skippedAt?: string;
  sourceChatIds: string[];
  notes?: string;
}

// ── Progress ──────────────────────────────────────────────────────────────────
export interface DailyProgress {
  date: string;
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  missedTasks: number;
  completionPercentage: number;
}

export interface WeeklyCheckIn {
  checkInId: string;
  weekStartDate: string;
  responses: {
    improvement?: string;
    irritation?: string;
    comfort?: string;
    newConcerns?: string;
    modifyRoutine?: boolean;
  };
  aiSuggestions: string;
  createdAt: string;
}

// ── Storage ───────────────────────────────────────────────────────────────────
export interface AppStorageSchema {
  version: number;
  userProfile: UserProfile | null;
  skinChats: SkinChat[];
  chatMessages: Record<string, ChatMessage[]>;
  products: Product[];
  individualRoutines: IndividualRoutine[];
  masterTimetable: MasterTimetable | null;
  calendarTasks: CalendarTask[];
  weeklyCheckIns: WeeklyCheckIn[];
  settings: AppSettings;
}

export interface AppSettings {
  reminderEnabled: boolean;
  morningReminderTime: string;
  nightReminderTime: string;
  notificationsPermission: boolean;
  theme: 'dark';
}

// ── API Response ──────────────────────────────────────────────────────────────
export interface GroqChatResponse {
  type: 'text' | 'product_recommendation' | 'routine_summary' | 'timetable';
  message: string;
  products?: Product[];
  routine?: IndividualRoutine;
  timetable?: MasterTimetable;
  nextAction?: string;
  skinProfile?: Partial<SkinProfile>;
  allowMultipleSelection?: boolean;
}
