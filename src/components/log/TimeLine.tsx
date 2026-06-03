import { cn } from "@/lib/utils";
import type { TimeEntry } from "@/types/nowFlow";
import { categoryColorVar } from "@/utils/category";
import { addMinutes, hm, startOfDay } from "@/utils/time";

type Slot = { start: Date; end: Date };

function buildSlots(date: Date, granularityMinutes: number) {
  const dayStart = startOfDay(date);
  const start = addMinutes(dayStart, 6 * 60);
  const end = addMinutes(dayStart, 24 * 60);
  const slots: Slot[] = [];
  for (let t = start; t < end; t = addMinutes(t, granularityMinutes)) {
    slots.push({ start: t, end: addMinutes(t, granularityMinutes) });
  }
  return slots;
}

function overlaps(slot: Slot, entry: TimeEntry) {
  const es = new Date(entry.startAt);
  const ee = new Date(entry.endAt);
  return slot.start < ee && slot.end > es;
}

export default function TimeLine({
  date,
  entries,
  granularityMinutes,
  activityNameOf,
  onPickSlot,
}: {
  date: Date;
  entries: TimeEntry[];
  granularityMinutes: number;
  activityNameOf: (activityId: string | null) => string;
  onPickSlot: (slot: Slot, entry: TimeEntry | null) => void;
}) {
  const slots = buildSlots(date, granularityMinutes);
  const now = new Date();
  const isToday =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm font-semibold">时间日志</div>
        <div className="text-xs text-[var(--muted)]">{granularityMinutes}分钟</div>
      </div>
      <div className="max-h-[70vh] overflow-auto pb-2">
        {slots.map((slot) => {
          const slotEntries = entries.filter((e) => overlaps(slot, e));
          const primary = slotEntries[0];
          const isNow = isToday && now >= slot.start && now < slot.end;
          const color = primary ? categoryColorVar(primary.primaryCategory) : null;
          const title = primary ? activityNameOf(primary.primaryActivityId) : "";

          // 构建叠加展示文本
          const overlayTexts = primary?.overlays
            .map((o) => activityNameOf(o.activityId))
            .filter(Boolean) ?? [];

          return (
            <button
              key={slot.start.toISOString()}
              type="button"
              onClick={() => onPickSlot(slot, primary ?? null)}
              className={cn(
                "relative flex w-full items-stretch gap-4 px-4 py-3 text-left transition",
                "hover:bg-white/4",
                isNow && "bg-white/5",
              )}
            >
              <div className="w-12 shrink-0 pt-0.5 text-xs text-[var(--muted)]">{hm(slot.start)}</div>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={cn("h-9 w-1.5 shrink-0 rounded-full")}
                  style={{ backgroundColor: color ?? "rgba(255,255,255,0.08)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">
                    {primary ? (
                      <span className="text-[var(--fg)]">
                        {title || "已记录"}
                        {overlayTexts.length > 0 && (
                          <span className="text-[var(--muted)]"> + {overlayTexts.join("、")}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[var(--muted)]">空</span>
                    )}
                  </div>
                  {primary?.note ? (
                    <div className="mt-0.5 truncate text-xs text-[var(--muted)]">{primary.note}</div>
                  ) : null}
                </div>
              </div>
              {isNow ? (
                <div className="absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--creation)]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
