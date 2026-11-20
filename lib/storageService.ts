import type {
  UserProfile,
  SkinChat,
  ChatMessage,
  Product,
  IndividualRoutine,
  MasterTimetable,
  CalendarTask,
  DailyProgress,
  WeeklyCheckIn,
  AppStorageSchema,
  AppSettings,
  SkinProfile,
  RoutineStatus,
  TimetableActivity,
} from '@/types';

// ── Storage keys ──────────────────────────────────────────────────────────────
const STORAGE_VERSION = 1;
const KEYS = {
  VERSION: 'sm_version',
  USER_PROFILE: 'sm_user_profile',
  SKIN_CHATS: 'sm_skin_chats',
  CHAT_MESSAGES: 'sm_chat_messages',
  PRODUCTS: 'sm_products',
  ROUTINES: 'sm_routines',
  MASTER_TIMETABLE: 'sm_master_timetable',
  CALENDAR_TASKS: 'sm_calendar_tasks',
  WEEKLY_CHECKINS: 'sm_weekly_checkins',
  SETTINGS: 'sm_settings',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  reminderEnabled: false,
  morningReminderTime: '07:00',
  nightReminderTime: '21:00',
  notificationsPermission: false,
  theme: 'dark',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function safeGet<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: unknown): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[storageService] Failed to write key "${key}":`, e);
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

// ── User Profile ──────────────────────────────────────────────────────────────
export function getUserProfile(): UserProfile | null {
  return safeGet<UserProfile | null>(KEYS.USER_PROFILE, null);
}

export function saveUserProfile(profile: UserProfile): void {
  safeSet(KEYS.USER_PROFILE, profile);
}

// ── Skin Chats ────────────────────────────────────────────────────────────────
export function getSkinChats(): SkinChat[] {
  return safeGet<SkinChat[]>(KEYS.SKIN_CHATS, []);
}

export function saveSkinChat(chat: SkinChat): void {
  const chats = getSkinChats();
  const idx = chats.findIndex((c) => c.chatId === chat.chatId);
  if (idx >= 0) {
    chats[idx] = chat;
  } else {
    chats.unshift(chat);
  }
  safeSet(KEYS.SKIN_CHATS, chats);
}

export function createSkinChat(title: string, concern: string): SkinChat {
  const profile = getUserProfile();
  const chat: SkinChat = {
    chatId: generateId(),
    userId: profile?.userId ?? 'anonymous',
    title,
    primaryConcern: concern,
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
    selectedProductIds: [],
  };
  saveSkinChat(chat);
  return chat;
}

export function updateSkinChat(chatId: string, updates: Partial<SkinChat>): void {
  const chats = getSkinChats();
  const idx = chats.findIndex((c) => c.chatId === chatId);
  if (idx >= 0) {
    chats[idx] = { ...chats[idx], ...updates, updatedAt: now() };
    safeSet(KEYS.SKIN_CHATS, chats);
  }
}

export function deleteSkinChat(chatId: string): void {
  const chats = getSkinChats().filter((c) => c.chatId !== chatId);
  safeSet(KEYS.SKIN_CHATS, chats);

  // Remove associated messages
  const allMessages = safeGet<Record<string, ChatMessage[]>>(KEYS.CHAT_MESSAGES, {});
  delete allMessages[chatId];
  safeSet(KEYS.CHAT_MESSAGES, allMessages);

  // Clean up products associated with this chat
  const allProducts = getAllProducts();
  const updatedProducts: Product[] = [];
  for (const product of allProducts) {
    const remainingSources = (product.sourceChatIds || []).filter((id) => id !== chatId);
    if (remainingSources.length > 0) {
      updatedProducts.push({
        ...product,
        sourceChatIds: remainingSources,
      });
    }
    // If remainingSources is empty, product is dropped completely
  }
  safeSet(KEYS.PRODUCTS, updatedProducts);

  // Also archive / remove routines associated with this chat
  const allRoutines = getIndividualRoutines();
  const updatedRoutines = allRoutines.filter((r) => r.chatId !== chatId);
  safeSet(KEYS.ROUTINES, updatedRoutines);
}

export function completeSkinChat(chatId: string, skinProfile: SkinProfile): void {
  updateSkinChat(chatId, {
    status: 'completed',
    completedAt: now(),
    skinProfile,
  });
}

// ── Chat Messages ─────────────────────────────────────────────────────────────
export function getChatMessages(chatId: string): ChatMessage[] {
  const all = safeGet<Record<string, ChatMessage[]>>(KEYS.CHAT_MESSAGES, {});
  return all[chatId] ?? [];
}

export function saveChatMessage(message: ChatMessage): void {
  const all = safeGet<Record<string, ChatMessage[]>>(KEYS.CHAT_MESSAGES, {});
  if (!all[message.chatId]) all[message.chatId] = [];
  const idx = all[message.chatId].findIndex((m) => m.messageId === message.messageId);
  if (idx >= 0) {
    all[message.chatId][idx] = message;
  } else {
    all[message.chatId].push(message);
  }
  safeSet(KEYS.CHAT_MESSAGES, all);
}

// ── Products ──────────────────────────────────────────────────────────────────
export function getAllProducts(): Product[] {
  return safeGet<Product[]>(KEYS.PRODUCTS, []);
}

export function saveProduct(product: Product): void {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.productId === product.productId);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.push(product);
  }
  safeSet(KEYS.PRODUCTS, products);
}

export function updateProduct(productId: string, updates: Partial<Product>): void {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.productId === productId);
  if (idx >= 0) {
    products[idx] = { ...products[idx], ...updates };
    safeSet(KEYS.PRODUCTS, products);
  }
}

export function deleteProduct(productId: string): void {
  const products = getAllProducts().filter((p) => p.productId !== productId);
  safeSet(KEYS.PRODUCTS, products);
}

export function getProductsByChatId(chatId: string): Product[] {
  return getAllProducts().filter((p) => p.sourceChatIds.includes(chatId));
}

export function saveSelectedProducts(chatId: string, products: Product[]): void {
  const productIds: string[] = [];
  for (const product of products) {
    // Merge sourceChatIds
    const existing = getAllProducts().find((p) => p.productId === product.productId);
    if (existing) {
      const merged = Array.from(new Set([...existing.sourceChatIds, chatId]));
      updateProduct(product.productId, { ...product, sourceChatIds: merged, selectedStatus: true });
    } else {
      saveProduct({ ...product, sourceChatIds: [chatId], selectedStatus: true });
    }
    productIds.push(product.productId);
  }
  updateSkinChat(chatId, { selectedProductIds: productIds });
}

// ── Individual Routines ───────────────────────────────────────────────────────
export function getIndividualRoutines(): IndividualRoutine[] {
  return safeGet<IndividualRoutine[]>(KEYS.ROUTINES, []);
}

export function getRoutineByChatId(chatId: string): IndividualRoutine | null {
  return getIndividualRoutines().find((r) => r.chatId === chatId) ?? null;
}

export function saveIndividualRoutine(routine: IndividualRoutine): void {
  const routines = getIndividualRoutines();
  const idx = routines.findIndex((r) => r.routineId === routine.routineId);
  if (idx >= 0) {
    routines[idx] = routine;
  } else {
    routines.push(routine);
  }
  safeSet(KEYS.ROUTINES, routines);
  // Link back to chat
  updateSkinChat(routine.chatId, { individualRoutineId: routine.routineId });
}

export function updateRoutineStatus(routineId: string, status: RoutineStatus): void {
  const routines = getIndividualRoutines();
  const idx = routines.findIndex((r) => r.routineId === routineId);
  if (idx >= 0) {
    routines[idx] = { ...routines[idx], status, updatedAt: now() };
    safeSet(KEYS.ROUTINES, routines);
  }
}

// ── Master Timetable ──────────────────────────────────────────────────────────
export function getMasterTimetable(): MasterTimetable | null {
  return safeGet<MasterTimetable | null>(KEYS.MASTER_TIMETABLE, null);
}

export function saveMasterTimetable(timetable: MasterTimetable): void {
  safeSet(KEYS.MASTER_TIMETABLE, timetable);
}

// ── Calendar Tasks ────────────────────────────────────────────────────────────
export function getCalendarTasks(date?: string): CalendarTask[] {
  const tasks = safeGet<CalendarTask[]>(KEYS.CALENDAR_TASKS, []);
  if (date) return tasks.filter((t) => t.date === date);
  return tasks;
}

export function saveCalendarTask(task: CalendarTask): void {
  const tasks = safeGet<CalendarTask[]>(KEYS.CALENDAR_TASKS, []);
  const idx = tasks.findIndex((t) => t.taskId === task.taskId);
  if (idx >= 0) {
    tasks[idx] = task;
  } else {
    tasks.push(task);
  }
  safeSet(KEYS.CALENDAR_TASKS, tasks);
}

export function markTaskCompleted(taskId: string): void {
  const tasks = safeGet<CalendarTask[]>(KEYS.CALENDAR_TASKS, []);
  const idx = tasks.findIndex((t) => t.taskId === taskId);
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], status: 'completed', completedAt: now() };
    safeSet(KEYS.CALENDAR_TASKS, tasks);
  }
}

export function markTaskSkipped(taskId: string): void {
  const tasks = safeGet<CalendarTask[]>(KEYS.CALENDAR_TASKS, []);
  const idx = tasks.findIndex((t) => t.taskId === taskId);
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], status: 'skipped', skippedAt: now() };
    safeSet(KEYS.CALENDAR_TASKS, tasks);
  }
}

export function deleteTasksByActivityId(activityId: string): void {
  const tasks = safeGet<CalendarTask[]>(KEYS.CALENDAR_TASKS, []).filter(
    (t) => t.activityId !== activityId
  );
  safeSet(KEYS.CALENDAR_TASKS, tasks);
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function generateCalendarTasksFromTimetable(
  timetable: MasterTimetable,
  daysAhead: number = 30
): void {
  const today = new Date().toISOString().split('T')[0];
  const allActivities: TimetableActivity[] = [
    ...timetable.morningActivities,
    ...timetable.nightActivities,
  ];

  const existing = safeGet<CalendarTask[]>(KEYS.CALENDAR_TASKS, []);
  const existingKeys = new Set(existing.map((t) => `${t.activityId}__${t.date}`));

  const newTasks: CalendarTask[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const date = addDaysToDate(today, i);
    for (const activity of allActivities) {
      const key = `${activity.activityId}__${date}`;
      if (!existingKeys.has(key)) {
        newTasks.push({
          taskId: generateId(),
          activityId: activity.activityId,
          date,
          scheduledTime: activity.scheduledTime,
          timeOfDay: activity.timeOfDay,
          productName: activity.productName,
          productCategory: activity.productCategory,
          action: activity.action,
          status: 'pending',
          sourceChatIds: activity.sourceChatIds,
        });
      }
    }
  }
  safeSet(KEYS.CALENDAR_TASKS, [...existing, ...newTasks]);
}

// ── Progress ──────────────────────────────────────────────────────────────────
export function getDailyProgress(date: string): DailyProgress {
  const tasks = getCalendarTasks(date);
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const skipped = tasks.filter((t) => t.status === 'skipped').length;
  const missed = tasks.filter((t) => t.status === 'missed').length;
  return {
    date,
    totalTasks: total,
    completedTasks: completed,
    skippedTasks: skipped,
    missedTasks: missed,
    completionPercentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function getWeeklyProgress(weekStart: string): DailyProgress[] {
  const days: DailyProgress[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDaysToDate(weekStart, i);
    days.push(getDailyProgress(date));
  }
  return days;
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function getSettings(): AppSettings {
  return safeGet<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}

// ── Weekly Check-ins ──────────────────────────────────────────────────────────
export function getWeeklyCheckIns(): WeeklyCheckIn[] {
  return safeGet<WeeklyCheckIn[]>(KEYS.WEEKLY_CHECKINS, []);
}

export function saveWeeklyCheckIn(checkIn: WeeklyCheckIn): void {
  const checkIns = getWeeklyCheckIns();
  const idx = checkIns.findIndex((c) => c.checkInId === checkIn.checkInId);
  if (idx >= 0) {
    checkIns[idx] = checkIn;
  } else {
    checkIns.push(checkIn);
  }
  safeSet(KEYS.WEEKLY_CHECKINS, checkIns);
}

// ── Import / Export ───────────────────────────────────────────────────────────
export function exportAllData(): AppStorageSchema {
  return {
    version: STORAGE_VERSION,
    userProfile: getUserProfile(),
    skinChats: getSkinChats(),
    chatMessages: safeGet<Record<string, ChatMessage[]>>(KEYS.CHAT_MESSAGES, {}),
    products: getAllProducts(),
    individualRoutines: getIndividualRoutines(),
    masterTimetable: getMasterTimetable(),
    calendarTasks: getCalendarTasks(),
    weeklyCheckIns: getWeeklyCheckIns(),
    settings: getSettings(),
  };
}

export function clearAllData(): void {
  if (!isClient()) return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
