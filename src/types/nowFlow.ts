export type NowCategory = "basis" | "energy" | "creation";

export type MoodType = "calm" | "ok" | "anxious" | "stressed" | "low";

export type InterruptionType = "person" | "phone" | "meeting" | "environment" | "emotion" | "other";

export type TimeEntryOverlay = {
  category: NowCategory;
  activityId: string | null;
};

export type TimeEntry = {
  id: string;
  dateKey: string;
  startAt: string;
  endAt: string;
  primaryCategory: NowCategory;
  primaryActivityId: string | null;
  overlays: TimeEntryOverlay[];
  mood: MoodType | null;
  interruptionType: InterruptionType | null;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: string;
  category: NowCategory;
  name: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatus = "todo" | "doing" | "done" | "archived";

export type Task = {
  id: string;
  category: NowCategory;
  title: string;
  purpose: string;
  estimateMinutes: number;
  completionStandard: string;
  nextAction: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type FocusMode = "50_10" | "5_min";

export type FocusSession = {
  id: string;
  taskId: string | null;
  startAt: string;
  endAt: string | null;
  mode: FocusMode;
  interruptionCount: number;
  breakEffective: boolean | null;
  createdAt: string;
};

export type DailyReview = {
  id: string;
  dateKey: string;
  reflectionText: string;
  frog1: string;
  frog2: string;
  frog3: string;
  energyPlan: string;
  sleepTargetHours: number;
  createdAt: string;
  updatedAt: string;
};

export type IfThenRuleScene = "work" | "night" | "commute" | "any";

export type IfThenRule = {
  id: string;
  ifTrigger: string;
  thenAction: string;
  scene: IfThenRuleScene;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SmallWin = {
  id: string;
  dateKey: string;
  text: string;
  taskId: string | null;
  focusSessionId: string | null;
  mood: MoodType | null;
  createdAt: string;
};

export type Settings = {
  crazyAlarmEnabled: boolean;
  reviewTime: string;
  basisMinHours7d: number;
  energyMinMinutes3d: number;
};
