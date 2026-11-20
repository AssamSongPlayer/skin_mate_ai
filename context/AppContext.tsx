'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  UserProfile,
  SkinChat,
  ChatMessage,
  Product,
  IndividualRoutine,
  MasterTimetable,
  CalendarTask,
  AppSettings,
  SkinProfile,
  RoutineStatus,
} from '@/types';
import * as storage from '@/lib/storageService';
import { recalculateMasterTimetable as calcTimetable } from '@/services/timetableService';

export type Page =
  | 'dashboard'
  | 'chat'
  | 'history'
  | 'products'
  | 'routines'
  | 'timetable'
  | 'calendar'
  | 'progress'
  | 'settings';

interface AppState {
  userProfile: UserProfile | null;
  skinChats: SkinChat[];
  chatMessages: Record<string, ChatMessage[]>;
  products: Product[];
  individualRoutines: IndividualRoutine[];
  masterTimetable: MasterTimetable | null;
  calendarTasks: CalendarTask[];
  currentPage: Page;
  activeChatId: string | null;
  settings: AppSettings;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  reminderEnabled: false,
  morningReminderTime: '07:00',
  nightReminderTime: '21:00',
  notificationsPermission: false,
  theme: 'dark',
};

type Action =
  | { type: 'INIT'; payload: Partial<AppState> }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'UPSERT_CHAT'; payload: SkinChat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SET_CHATS'; payload: SkinChat[] }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: ChatMessage } }
  | { type: 'SET_MESSAGES'; payload: { chatId: string; messages: ChatMessage[] } }
  | { type: 'UPSERT_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'UPSERT_ROUTINE'; payload: IndividualRoutine }
  | { type: 'DELETE_ROUTINE'; payload: string }
  | { type: 'SET_ROUTINES'; payload: IndividualRoutine[] }
  | { type: 'SET_TIMETABLE'; payload: MasterTimetable | null }
  | { type: 'UPSERT_CALENDAR_TASK'; payload: CalendarTask }
  | { type: 'SET_CALENDAR_TASKS'; payload: CalendarTask[] }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'UPSERT_CHAT': {
      const exists = state.skinChats.find((c) => c.chatId === action.payload.chatId);
      const chats = exists
        ? state.skinChats.map((c) => (c.chatId === action.payload.chatId ? action.payload : c))
        : [action.payload, ...state.skinChats];
      return { ...state, skinChats: chats };
    }
    case 'DELETE_CHAT':
      return {
        ...state,
        skinChats: state.skinChats.filter((c) => c.chatId !== action.payload),
        activeChatId: state.activeChatId === action.payload ? null : state.activeChatId,
      };
    case 'SET_CHATS':
      return { ...state, skinChats: action.payload };
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChatId: action.payload };
    case 'ADD_MESSAGE': {
      const prev = state.chatMessages[action.payload.chatId] ?? [];
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [action.payload.chatId]: [...prev, action.payload.message],
        },
      };
    }
    case 'SET_MESSAGES':
      return {
        ...state,
        chatMessages: { ...state.chatMessages, [action.payload.chatId]: action.payload.messages },
      };
    case 'UPSERT_PRODUCT': {
      const exists = state.products.find((p) => p.productId === action.payload.productId);
      const products = exists
        ? state.products.map((p) => (p.productId === action.payload.productId ? action.payload : p))
        : [...state.products, action.payload];
      return { ...state, products };
    }
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.productId !== action.payload) };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'UPSERT_ROUTINE': {
      const exists = state.individualRoutines.find((r) => r.routineId === action.payload.routineId);
      const routines = exists
        ? state.individualRoutines.map((r) =>
            r.routineId === action.payload.routineId ? action.payload : r
          )
        : [...state.individualRoutines, action.payload];
      return { ...state, individualRoutines: routines };
    }
    case 'DELETE_ROUTINE':
      return {
        ...state,
        individualRoutines: state.individualRoutines.filter((r) => r.routineId !== action.payload),
      };
    case 'SET_ROUTINES':
      return { ...state, individualRoutines: action.payload };
    case 'SET_TIMETABLE':
      return { ...state, masterTimetable: action.payload };
    case 'UPSERT_CALENDAR_TASK': {
      const exists = state.calendarTasks.find((t) => t.taskId === action.payload.taskId);
      const tasks = exists
        ? state.calendarTasks.map((t) => (t.taskId === action.payload.taskId ? action.payload : t))
        : [...state.calendarTasks, action.payload];
      return { ...state, calendarTasks: tasks };
    }
    case 'SET_CALENDAR_TASKS':
      return { ...state, calendarTasks: action.payload };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const initialState: AppState = {
  userProfile: null,
  skinChats: [],
  chatMessages: {},
  products: [],
  individualRoutines: [],
  masterTimetable: null,
  calendarTasks: [],
  currentPage: 'dashboard',
  activeChatId: null,
  settings: DEFAULT_SETTINGS,
  isLoading: true,
};

export interface AppContextValue extends AppState {
  setUserProfile: (profile: UserProfile | null) => void;
  saveUserProfile: (profile: UserProfile) => void;
  createSkinChat: (title: string, concern: string) => SkinChat;
  upsertChat: (chat: SkinChat) => void;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => void;
  archiveChat: (chatId: string) => void;
  setActiveChatId: (chatId: string | null) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  setMessages: (chatId: string, messages: ChatMessage[]) => void;
  getMessages: (chatId: string) => ChatMessage[];
  completeChat: (chatId: string, skinProfile: SkinProfile) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => Promise<void>;
  saveSelectedProducts: (chatId: string, products: Product[]) => void;
  upsertRoutine: (routine: IndividualRoutine) => void;
  deleteRoutine: (routineId: string) => Promise<void>;
  updateRoutineStatus: (routineId: string, status: RoutineStatus) => Promise<void>;
  setTimetable: (timetable: MasterTimetable | null) => void;
  refreshMasterTimetable: () => Promise<MasterTimetable | null>;
  upsertCalendarTask: (task: CalendarTask) => void;
  setCalendarTasks: (tasks: CalendarTask[]) => void;
  markTaskCompleted: (taskId: string) => void;
  markTaskSkipped: (taskId: string) => void;
  refreshCalendar: () => void;
  navigate: (page: Page) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize from storage
  useEffect(() => {
    const userProfile = storage.getUserProfile();
    const skinChats = storage.getSkinChats();
    const products = storage.getAllProducts();
    const individualRoutines = storage.getIndividualRoutines();
    const masterTimetable = storage.getMasterTimetable();
    const calendarTasks = storage.getCalendarTasks();
    const settings = storage.getSettings();

    // Load messages for all chats
    const chatMessages: Record<string, ChatMessage[]> = {};
    for (const chat of skinChats) {
      chatMessages[chat.chatId] = storage.getChatMessages(chat.chatId);
    }

    dispatch({
      type: 'INIT',
      payload: {
        userProfile,
        skinChats,
        chatMessages,
        products,
        individualRoutines,
        masterTimetable,
        calendarTasks,
        settings,
      },
    });
  }, []);

  const refreshCalendar = useCallback(() => {
    const tasks = storage.getCalendarTasks();
    dispatch({ type: 'SET_CALENDAR_TASKS', payload: tasks });
  }, []);

  const refreshMasterTimetable = useCallback(async (): Promise<MasterTimetable | null> => {
    const currentRoutines = storage.getIndividualRoutines().filter((r) => r.status === 'active');
    const currentProducts = storage.getAllProducts().filter((p) => p.selectedStatus);
    const profile = storage.getUserProfile();

    try {
      const timetable = await calcTimetable(currentRoutines, currentProducts, profile);
      storage.saveMasterTimetable(timetable);
      dispatch({ type: 'SET_TIMETABLE', payload: timetable });
      refreshCalendar();
      return timetable;
    } catch (err) {
      console.error('Failed to recalculate timetable:', err);
      return null;
    }
  }, [refreshCalendar]);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  }, []);

  const saveUserProfile = useCallback((profile: UserProfile) => {
    storage.saveUserProfile(profile);
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  }, []);

  const createSkinChat = useCallback((title: string, concern: string): SkinChat => {
    const newChat = storage.createSkinChat(title, concern);
    dispatch({ type: 'UPSERT_CHAT', payload: newChat });
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: newChat.chatId });
    return newChat;
  }, []);

  const upsertChat = useCallback((chat: SkinChat) => {
    storage.saveSkinChat(chat);
    dispatch({ type: 'UPSERT_CHAT', payload: chat });
  }, []);

  const deleteChat = useCallback(
    async (chatId: string) => {
      // Delete the chat and all uniquely associated products & routines in storage
      storage.deleteSkinChat(chatId);
      dispatch({ type: 'DELETE_CHAT', payload: chatId });

      // Sync updated products and routines state immediately
      const updatedProducts = storage.getAllProducts();
      dispatch({ type: 'SET_PRODUCTS', payload: updatedProducts });

      const updatedRoutines = storage.getIndividualRoutines();
      dispatch({ type: 'SET_ROUTINES', payload: updatedRoutines });

      await refreshMasterTimetable();
    },
    [refreshMasterTimetable]
  );

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    storage.updateSkinChat(chatId, { title: newTitle });
    const chats = storage.getSkinChats();
    dispatch({ type: 'SET_CHATS', payload: chats });
  }, []);

  const archiveChat = useCallback((chatId: string) => {
    storage.updateSkinChat(chatId, { status: 'archived' });
    const chats = storage.getSkinChats();
    dispatch({ type: 'SET_CHATS', payload: chats });
  }, []);

  const setActiveChatId = useCallback((chatId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
  }, []);

  const addMessage = useCallback((chatId: string, message: ChatMessage) => {
    storage.saveChatMessage(message);
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message } });
  }, []);

  const setMessages = useCallback((chatId: string, messages: ChatMessage[]) => {
    for (const msg of messages) {
      storage.saveChatMessage(msg);
    }
    dispatch({ type: 'SET_MESSAGES', payload: { chatId, messages } });
  }, []);

  const getMessages = useCallback((chatId: string): ChatMessage[] => {
    return storage.getChatMessages(chatId);
  }, []);

  const completeChat = useCallback((chatId: string, skinProfile: SkinProfile) => {
    storage.completeSkinChat(chatId, skinProfile);
    const chats = storage.getSkinChats();
    dispatch({ type: 'SET_CHATS', payload: chats });
  }, []);

  const upsertProduct = useCallback((product: Product) => {
    storage.saveProduct(product);
    dispatch({ type: 'UPSERT_PRODUCT', payload: product });
  }, []);

  const deleteProduct = useCallback(
    async (productId: string) => {
      storage.deleteProduct(productId);
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
      await refreshMasterTimetable();
    },
    [refreshMasterTimetable]
  );

  const saveSelectedProducts = useCallback((chatId: string, products: Product[]) => {
    storage.saveSelectedProducts(chatId, products);
    const allProducts = storage.getAllProducts();
    dispatch({ type: 'SET_PRODUCTS', payload: allProducts });
    const chats = storage.getSkinChats();
    dispatch({ type: 'SET_CHATS', payload: chats });
  }, []);

  const upsertRoutine = useCallback((routine: IndividualRoutine) => {
    storage.saveIndividualRoutine(routine);
    dispatch({ type: 'UPSERT_ROUTINE', payload: routine });
  }, []);

  const deleteRoutine = useCallback(
    async (routineId: string) => {
      storage.updateRoutineStatus(routineId, 'archived');
      const routines = storage.getIndividualRoutines();
      dispatch({ type: 'SET_ROUTINES', payload: routines });
      await refreshMasterTimetable();
    },
    [refreshMasterTimetable]
  );

  const updateRoutineStatus = useCallback(
    async (routineId: string, status: RoutineStatus) => {
      storage.updateRoutineStatus(routineId, status);
      const routines = storage.getIndividualRoutines();
      dispatch({ type: 'SET_ROUTINES', payload: routines });
      await refreshMasterTimetable();
    },
    [refreshMasterTimetable]
  );

  const setTimetable = useCallback((timetable: MasterTimetable | null) => {
    if (timetable) storage.saveMasterTimetable(timetable);
    dispatch({ type: 'SET_TIMETABLE', payload: timetable });
  }, []);

  const upsertCalendarTask = useCallback((task: CalendarTask) => {
    storage.saveCalendarTask(task);
    dispatch({ type: 'UPSERT_CALENDAR_TASK', payload: task });
  }, []);

  const setCalendarTasks = useCallback((tasks: CalendarTask[]) => {
    dispatch({ type: 'SET_CALENDAR_TASKS', payload: tasks });
  }, []);

  const markTaskCompleted = useCallback((taskId: string) => {
    storage.markTaskCompleted(taskId);
    const tasks = storage.getCalendarTasks();
    dispatch({ type: 'SET_CALENDAR_TASKS', payload: tasks });
  }, []);

  const markTaskSkipped = useCallback((taskId: string) => {
    storage.markTaskSkipped(taskId);
    const tasks = storage.getCalendarTasks();
    dispatch({ type: 'SET_CALENDAR_TASKS', payload: tasks });
  }, []);

  const navigate = useCallback((page: Page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const current = storage.getSettings();
    const updated = { ...current, ...newSettings };
    storage.saveSettings(updated);
    dispatch({ type: 'SET_SETTINGS', payload: updated });
  }, []);

  const clearAllData = useCallback(() => {
    storage.clearAllData();
    dispatch({
      type: 'INIT',
      payload: {
        userProfile: null,
        skinChats: [],
        chatMessages: {},
        products: [],
        individualRoutines: [],
        masterTimetable: null,
        calendarTasks: [],
        settings: DEFAULT_SETTINGS,
      },
    });
  }, []);

  const value: AppContextValue = {
    ...state,
    setUserProfile,
    saveUserProfile,
    createSkinChat,
    upsertChat,
    deleteChat,
    renameChat,
    archiveChat,
    setActiveChatId,
    addMessage,
    setMessages,
    getMessages,
    completeChat,
    upsertProduct,
    deleteProduct,
    saveSelectedProducts,
    upsertRoutine,
    deleteRoutine,
    updateRoutineStatus,
    setTimetable,
    refreshMasterTimetable,
    upsertCalendarTask,
    setCalendarTasks,
    markTaskCompleted,
    markTaskSkipped,
    refreshCalendar,
    navigate,
    updateSettings,
    clearAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
