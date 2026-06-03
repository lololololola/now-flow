import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useNowFlowStore, useTodayKey } from "@/store/nowFlowStore";
import { categoryColorVar } from "@/utils/category";
import { minutesBetween } from "@/utils/time";
import { useMemo, useState } from "react";

function formatHM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h${m}m`;
}

export default function ReviewPage() {
  const todayKey = useTodayKey();
  const activities = useNowFlowStore((s) => s.activities);
  const timeEntries = useNowFlowStore((s) => s.timeEntries);
  const dailyReviews = useNowFlowStore((s) => s.dailyReviews);
  const upsertDailyReview = useNowFlowStore((s) => s.upsertDailyReview);

  const dayEntries = useMemo(() => timeEntries.filter((e) => e.dateKey === todayKey), [timeEntries, todayKey]);

  const totals = useMemo(() => {
    const sum = { basis: 0, energy: 0, creation: 0 };
    for (const e of dayEntries) {
      sum[e.primaryCategory] += minutesBetween(new Date(e.startAt), new Date(e.endAt));
    }
    return sum;
  }, [dayEntries]);

  const topActivities = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of dayEntries) {
      const key = e.primaryActivityId ?? "";
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + minutesBetween(new Date(e.startAt), new Date(e.endAt)));
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, mins]) => ({
        name: activities.find((a) => a.id === id)?.name ?? "未命名",
        mins,
      }));
  }, [dayEntries, activities]);

  const existing = dailyReviews.find((r) => r.dateKey === todayKey) ?? null;

  const [reflectionText, setReflectionText] = useState(existing?.reflectionText ?? "");
  const [frog1, setFrog1] = useState(existing?.frog1 ?? "");
  const [frog2, setFrog2] = useState(existing?.frog2 ?? "");
  const [frog3, setFrog3] = useState(existing?.frog3 ?? "");
  const [energyPlan, setEnergyPlan] = useState(existing?.energyPlan ?? "");
  const [sleepTargetHours, setSleepTargetHours] = useState(existing?.sleepTargetHours ?? 7.5);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold tracking-tight">每日复盘</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">证据→洞察→明日</div>
      </div>

      <Card className="p-4">
        <div className="text-sm font-semibold">今日成果（自动）</div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl border border-[var(--stroke)] bg-white/3 p-3">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("creation") }} />
              创造
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--fg)]">{formatHM(totals.creation)}</div>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-white/3 p-3">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("energy") }} />
              蓄能
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--fg)]">{formatHM(totals.energy)}</div>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-white/3 p-3">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("basis") }} />
              基础
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--fg)]">{formatHM(totals.basis)}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-[var(--muted)]">Top活动</div>
        <div className="mt-2 space-y-1">
          {topActivities.length ? (
            topActivities.map((a) => (
              <div key={a.name} className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2 text-sm">
                <div className="truncate text-[var(--fg)]">{a.name}</div>
                <div className="shrink-0 text-xs text-[var(--muted)]">{formatHM(a.mins)}</div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-3 text-sm text-[var(--muted)]">
              今日记录较少，先去日志补记关键时段
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">今日反思</div>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          rows={4}
          className="mt-2 w-full resize-none rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
          placeholder="今天最消耗我的是什么？我逃避的触发点是什么？"
        />
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">明日计划（最小集）</div>
        <div className="mt-3 space-y-2">
          <input
            value={frog1}
            onChange={(e) => setFrog1(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            placeholder="青蛙1：最重要的一件事"
          />
          <input
            value={frog2}
            onChange={(e) => setFrog2(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            placeholder="青蛙2（可选）"
          />
          <input
            value={frog3}
            onChange={(e) => setFrog3(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            placeholder="青蛙3（可选）"
          />
          <input
            value={energyPlan}
            onChange={(e) => setEnergyPlan(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            placeholder="明日蓄能：散步/运动/阅读…"
          />
          <div className="flex items-center gap-2">
            <div className="text-sm text-[var(--muted)]">睡眠底线</div>
            <input
              value={sleepTargetHours}
              onChange={(e) => setSleepTargetHours(Number(e.target.value))}
              type="number"
              step="0.5"
              min="0"
              className="h-11 w-28 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            />
            <div className="text-sm text-[var(--muted)]">小时</div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            tone="creation"
            onClick={() => {
              upsertDailyReview({
                id: existing?.id,
                dateKey: todayKey,
                reflectionText,
                frog1,
                frog2,
                frog3,
                energyPlan,
                sleepTargetHours,
              });
            }}
          >
            保存复盘
          </Button>
        </div>
      </Card>
    </div>
  );
}

