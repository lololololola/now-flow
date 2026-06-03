import TimeEntrySheet from "@/components/log/TimeEntrySheet";
import TimeLine from "@/components/log/TimeLine";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useNowFlowStore } from "@/store/nowFlowStore";
import type { TimeEntry } from "@/types/nowFlow";
import { categoryColorVar } from "@/utils/category";
import { addMinutes, dateKeyOf, minutesBetween, startOfDay } from "@/utils/time";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

function floorToSlot(date: Date, granularityMinutes: number) {
  const dayStart = startOfDay(date);
  const minutes = Math.floor((date.getTime() - dayStart.getTime()) / 60000);
  const floored = Math.floor(minutes / granularityMinutes) * granularityMinutes;
  const start = addMinutes(dayStart, floored);
  const end = addMinutes(start, granularityMinutes);
  return { start, end };
}

function sumByCategory(entries: { primaryCategory: "basis" | "energy" | "creation"; startAt: string; endAt: string }[]) {
  const totals = { basis: 0, energy: 0, creation: 0 };
  for (const e of entries) {
    totals[e.primaryCategory] += minutesBetween(new Date(e.startAt), new Date(e.endAt));
  }
  return totals;
}

function formatHM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h${m}m`;
}

export default function LogPage() {
  const activities = useNowFlowStore((s) => s.activities);
  const timeEntries = useNowFlowStore((s) => s.timeEntries);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateKey = dateKeyOf(selectedDate);

  const dayEntries = useMemo(() => timeEntries.filter((e) => e.dateKey === dateKey), [timeEntries, dateKey]);
  const totals = useMemo(() => sumByCategory(dayEntries), [dayEntries]);

  const activityNameOf = (id: string | null) => activities.find((a) => a.id === id)?.name ?? "";

  const [granularityMinutes] = useState(30);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSlot, setSheetSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [sheetEntry, setSheetEntry] = useState<TimeEntry | null>(null);

  const openSheet = (slot: { start: Date; end: Date }, entry: TimeEntry | null = null) => {
    setSheetSlot(slot);
    setSheetEntry(entry);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSheetSlot(null);
    setSheetEntry(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold tracking-tight">NOW Flow</div>
          <div className="mt-0.5 text-xs text-[var(--muted)]">先记录，让时间显形</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--stroke)] bg-white/3 text-[var(--fg)] transition hover:bg-white/6"
            onClick={() => setSelectedDate(addMinutes(selectedDate, -24 * 60))}
            aria-label="前一天"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--stroke)] bg-white/3 text-[var(--fg)] transition hover:bg-white/6"
            onClick={() => setSelectedDate(addMinutes(selectedDate, 24 * 60))}
            aria-label="后一天"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{dateKey}</div>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("basis") }} />
              {formatHM(totals.basis)}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("energy") }} />
              {formatHM(totals.energy)}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("creation") }} />
              {formatHM(totals.creation)}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-[var(--muted)]">点击时间块快速打点，可叠加记录</div>
          <Button
            size="sm"
            tone="creation"
            onClick={() => {
              const slot = floorToSlot(new Date(), granularityMinutes);
              openSheet(slot);
            }}
          >
            <Plus className="h-4 w-4" />
            记录当下
          </Button>
        </div>
      </Card>

      <TimeLine
        date={selectedDate}
        entries={dayEntries}
        granularityMinutes={granularityMinutes}
        activityNameOf={activityNameOf}
        onPickSlot={(slot, entry) => {
          openSheet(slot, entry);
        }}
      />

      <div className="fixed bottom-24 right-6 z-50 md:right-10">
        <button
          type="button"
          className={cn(
            "inline-flex h-14 w-14 items-center justify-center rounded-2xl text-[var(--bg)] shadow-[0_18px_60px_-30px_rgba(0,0,0,0.75)] transition hover:scale-[1.02] active:scale-[0.98]",
          )}
          style={{ backgroundColor: "var(--creation)" }}
          onClick={() => {
            const slot = floorToSlot(new Date(), granularityMinutes);
            openSheet(slot);
          }}
          aria-label="记录当下"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <TimeEntrySheet
        open={sheetOpen}
        slot={sheetSlot}
        existingEntry={sheetEntry}
        onClose={closeSheet}
      />
    </div>
  );
}

