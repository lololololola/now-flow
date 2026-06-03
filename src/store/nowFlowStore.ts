import { create } from "zustand";
import { supabase } from "@/lib/supabase";
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
  loading: boolean;

  createTimeEntry: (input: CreateTimeEntryInput) => Promise<TimeEntry | null>;
  updateTimeEntry: (id: string, input: Partial<CreateTimeEntryInput>) => Promise<TimeEntry | null>;
  deleteTimeEntry: (id: string) => Promise<void>;

  upsertDailyReview: (input: Omit<DailyReview, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<DailyReview | null>;

  createIfThenRule: (input: { ifTrigger: string; thenAction: string; scene: IfThenRule["scene"] }) => IfThenRule;
  toggleIfThenRule: (id: string) => void;

  createSmallWin: (input: { dateKey: string; text: string; taskId?: string | null; focusSessionId?: string | null; mood?: MoodType | null }) => SmallWin;

  setSettings: (patch: Partial<Settings>) => void;
  loadTimeEntries: () => Promise<void>;
  loadActivities: () => Promise<void>;
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

export const useNowFlowStore = create<NowFlowState>((set, get) => ({
  activities: defaultActivities(),
  timeEntries: [],
  tasks: [],
  focusSessions: [],
  dailyReviews: [],
  ifThenRules: [],
  smallWins: [],
  settings: defaultSettings,
  loading: false,

  loadTimeEntries: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      const entries: TimeEntry[] = data.map((row) => ({
        id: row.id,
        dateKey: row.date_key,
        startAt: row.start_at,
        endAt: row.end_at,
        primaryCategory: row.primary_category as NowCategory,
        primaryActivityId: row.primary_activity_id,
        overlays: row.overlays as TimeEntryOverlay[],
        mood: row.mood as MoodType | null,
        interruptionType: row.interruption_type as InterruptionType | null,
        note: row.note,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      set({ timeEntries: entries, loading: false });
    } else {
      set({ loading: false });
    }
  },

  loadActivities: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id);
    if (!error && data && data.length > 0) {
      const acts: Activity[] = data.map((row) => ({
        id: row.id,
        category: row.category as NowCategory,
        name: row.name,
        archived: row.archived,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      set({ activities: acts });
    }
  },

  createTimeEntry: async (input) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

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

    const { error } = await supabase.from("time_entries").insert({
      id: entry.id,
      user_id: user.id,
      date_key: entry.dateKey,
      start_at: entry.startAt,
      end_at: entry.endAt,
      primary_category: entry.primaryCategory,
      primary_activity_id: entry.primaryActivityId,
      overlays: entry.overlays,
      mood: entry.mood,
      interruption_type: entry.interruptionType,
      note: entry.note,
    });

    if (error) {
      console.error("createTimeEntry error:", error);
      return null;
    }

    set({ timeEntries: [entry, ...get().timeEntries] });
    return entry;
  },

  updateTimeEntry: async (id, input) => {
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

    const { error } = await supabase
      .from("time_entries")
      .update({
        date_key: updated.dateKey,
        start_at: updated.startAt,
        end_at: updated.endAt,
        primary_category: updated.primaryCategory,
        primary_activity_id: updated.primaryActivityId,
        overlays: updated.overlays,
        mood: updated.mood,
        interruption_type: updated.interruptionType,
        note: updated.note,
        updated_at: updated.updatedAt,
      })
      .eq("id", id);

    if (error) {
      console.error("updateTimeEntry error:", error);
      return null;
    }

    set({ timeEntries: get().timeEntries.map((e) => (e.id === id ? updated : e)) });
    return updated;
  },

  deleteTimeEntry: async (id) => {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) {
      console.error("deleteTimeEntry error:", error);
      return;
    }
    set({ timeEntries: get().timeEntries.filter((e) => e.id !== id) });
  },

  upsertDailyReview: async (input) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

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

    if (existing) {
      await supabase.from("daily_reviews").update({
        date_key: review.dateKey,
        reflection_text: review.reflectionText,
        frog1: review.frog1,
        frog2: review.frog2,
        frog3: review.frog3,
        energy_plan: review.energyPlan,
        sleep_target_hours: review.sleepTargetHours,
        updated_at: review.updatedAt,
      }).eq("id", review.id);
    } else {
      await supabase.from("daily_reviews").insert({
        id: review.id,
        user_id: user.id,
        date_key: review.dateKey,
        reflection_text: review.reflectionText,
        frog1: review.frog1,
        frog2: review.frog2,
        frog3: review.frog3,
        energy_plan: review.energyPlan,
        sleep_target_hours: review.sleepTargetHours,
      });
    }

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
}));

export function useTodayKey() {
  return dateKeyOf(new Date());
}
