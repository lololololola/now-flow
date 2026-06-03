import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Activity,
  DailyReview,
  FocusSession,
  IfThenRule,
  InterruptionType,
  MoodType,
  NowCategory,
  Settings,
  SmallWin,
  Task,
  TimeEntry,
  TimeEntryOverlay,
} from "@/types/nowFlow";
import { createId, dateKeyOf, nowIso } from "@/utils/time";
import { useAuthStore } from "./authStore";

type CreateTimeEntryInput = {
  dateKey: string;
  startAt: string;
  endAt: string;
  primaryCategory: NowCategory;
  primaryActivityId: string | null;
  overlays: TimeEntryOverlay[];
  mood: MoodType | null;
  interruptionType: InterruptionType | null;
  note: string;
};

type NowFlowState = {
  activities: Activity[];
  timeEntries: TimeEntry[];
  tasks: Task[];
  focusSessions: FocusSession[];
  dailyReviews: DailyReview[];
  ifThenRules: IfThenRule[];
  smallWins: SmallWin[];
  settings: Settings;

  createTimeEntry: (input: CreateTimeEntryInput) => TimeEntry;
  updateTimeEntry: (id: string, input: Partial<CreateTimeEntryInput>) => TimeEntry | null;
  deleteTimeEntry: (id: string) => void;

  upsertDailyReview: (input: Omit<DailyReview, "id" | "createdAt" | "updatedAt"> & { id?: string }) => DailyReview;

  createIfThenRule: (input: { ifTrigger: string; thenAction: string; scene: IfThenRule["scene"] }) => IfThenRule;
  toggleIfThenRule: (id: string) => void;

  createSmallWin: (input: { dateKey: string; text: string; taskId?: string | null; focusSessionId?: string | null; mood?: MoodType | null }) => SmallWin;

  setSettings: (patch: Partial<Settings>) => void;
};

function defaultActivities(): Activity[] {
  const now = nowIso();
  return [
    { id: "act_basis_sleep", category: "basis", name: "睡眠", archived: false, createdAt: now, updatedAt: now },
    { id: "act_basis_meal", category: "basis", name: "吃饭", archived: false, createdAt: now, updatedAt: now },
    { id: "act_basis_commute", category: "basis", name: "通勤", archived: false, createdAt: now, updatedAt: now },
    { id: "act_basis_house", category: "basis", name: "家务", archived: false, createdAt: now, updatedAt: now },
    { id: "act_basis_family", category: "basis", name: "陪伴家人", archived: false, createdAt: now, updatedAt: now },

    { id: "act_energy_exercise", category: "energy", name: "运动", archived: false, createdAt: now, updatedAt: now },
    { id: "act_energy_read", category: "energy", name: "阅读", archived: false, createdAt: now, updatedAt: now },
    { id: "act_energy_learn", category: "energy", name: "学习", archived: false, createdAt: now, updatedAt: now },
    { id: "act_energy_fun", category: "energy", name: "娱乐", archived: false, createdAt: now, updatedAt: now },
    { id: "act_energy_social", category: "energy", name: "社交", archived: false, createdAt: now, updatedAt: now },

    { id: "act_creation_work", category: "creation", name: "工作", archived: false, createdAt: now, updatedAt: now },
    { id: "act_creation_side", category: "creation", name: "副业", archived: false, createdAt: now, updatedAt: now },
    { id: "act_creation_output", category: "creation", name: "输出", archived: false, createdAt: now, updatedAt: now },
  ];
}

const defaultSettings: Settings = {
  crazyAlarmEnabled: true,
  reviewTime: "22:00",
  basisMinHours7d: 49,
  energyMinMinutes3d: 60,
};

function getUserStorageKey(): string {
  const userId = useAuthStore.getState().currentUser?.id;
  return userId ? `now-flow-${userId}` : "now-flow-guest";
}

export const useNowFlowStore = create<NowFlowState>()(
  persist(
    (set, get) => ({
      activities: defaultActivities(),
      timeEntries: [],
      tasks: [],
      focusSessions: [],
      dailyReviews: [],
      ifThenRules: [],
      smallWins: [],
      settings: defaultSettings,

      createTimeEntry: (input) => {
        const now = nowIso();
        const entry: TimeEntry = {
          id: createId("te"),
          dateKey: input.dateKey,
          startAt: input.startAt,
          endAt: input.endAt,
          primaryCategory: input.primaryCategory,
          primaryActivityId: input.primaryActivityId,
          overlays: input.overlays,
          mood: input.mood,
          interruptionType: input.interruptionType,
          note: input.note,
          createdAt: now,
          updatedAt: now,
        };
        set({ timeEntries: [entry, ...get().timeEntries] });
        return entry;
      },

      updateTimeEntry: (id, input) => {
        const existing = get().timeEntries.find((e) => e.id === id);
        if (!existing) return null;
        const updated: TimeEntry = {
          ...existing,
          ...(input.dateKey !== undefined && { dateKey: input.dateKey }),
          ...(input.startAt !== undefined && { startAt: input.startAt }),
          ...(input.endAt !== undefined && { endAt: input.endAt }),
          ...(input.primaryCategory !== undefined && { primaryCategory: input.primaryCategory }),
          ...(input.primaryActivityId !== undefined && { primaryActivityId: input.primaryActivityId }),
          ...(input.overlays !== undefined && { overlays: input.overlays }),
          ...(input.mood !== undefined && { mood: input.mood }),
          ...(input.interruptionType !== undefined && { interruptionType: input.interruptionType }),
          ...(input.note !== undefined && { note: input.note }),
          updatedAt: nowIso(),
        };
        set({ timeEntries: get().timeEntries.map((e) => (e.id === id ? updated : e)) });
        return updated;
      },

      deleteTimeEntry: (id) => {
        set({ timeEntries: get().timeEntries.filter((e) => e.id !== id) });
      },

      upsertDailyReview: (input) => {
        const now = nowIso();
        const existing = input.id ? get().dailyReviews.find((r) => r.id === input.id) : null;
        const review: DailyReview = {
          id: existing?.id ?? createId("dr"),
          dateKey: input.dateKey,
          reflectionText: input.reflectionText,
          frog1: input.frog1,
          frog2: input.frog2,
          frog3: input.frog3,
          energyPlan: input.energyPlan,
          sleepTargetHours: input.sleepTargetHours,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        const rest = get().dailyReviews.filter((r) => r.id !== review.id);
        set({ dailyReviews: [review, ...rest] });
        return review;
      },

      createIfThenRule: (input) => {
        const now = nowIso();
        const rule: IfThenRule = {
          id: createId("it"),
          ifTrigger: input.ifTrigger.trim(),
          thenAction: input.thenAction.trim(),
          scene: input.scene,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        };
        set({ ifThenRules: [rule, ...get().ifThenRules] });
        return rule;
      },

      toggleIfThenRule: (id) => {
        set({
          ifThenRules: get().ifThenRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled, updatedAt: nowIso() } : r)),
        });
      },

      createSmallWin: (input) => {
        const now = nowIso();
        const win: SmallWin = {
          id: createId("sw"),
          dateKey: input.dateKey,
          text: input.text.trim(),
          taskId: input.taskId ?? null,
          focusSessionId: input.focusSessionId ?? null,
          mood: input.mood ?? null,
          createdAt: now,
        };
        set({ smallWins: [win, ...get().smallWins] });
        return win;
      },

      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
    }),
    {
      name: "now-flow-dynamic",
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const key = getUserStorageKey();
          return localStorage.getItem(`${name}:${key}`);
        },
        setItem: (name, value) => {
          const key = getUserStorageKey();
          localStorage.setItem(`${name}:${key}`, value);
        },
        removeItem: (name) => {
          const key = getUserStorageKey();
          localStorage.removeItem(`${name}:${key}`);
        },
      })),
      partialize: (state) => ({
        activities: state.activities,
        timeEntries: state.timeEntries,
        tasks: state.tasks,
        focusSessions: state.focusSessions,
        dailyReviews: state.dailyReviews,
        ifThenRules: state.ifThenRules,
        smallWins: state.smallWins,
        settings: state.settings,
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<NowFlowState> | undefined;
        return {
          activities: state?.activities?.length ? state.activities : defaultActivities(),
          timeEntries: state?.timeEntries ?? [],
          tasks: state?.tasks ?? [],
          focusSessions: state?.focusSessions ?? [],
          dailyReviews: state?.dailyReviews ?? [],
          ifThenRules: state?.ifThenRules ?? [],
          smallWins: state?.smallWins ?? [],
          settings: state?.settings ?? defaultSettings,
        };
      },
    },
  ),
);

export function useTodayKey() {
  return dateKeyOf(new Date());
}
