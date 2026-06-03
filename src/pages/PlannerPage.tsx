import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useNowFlowStore } from "@/store/nowFlowStore";
import { categoryColorVar } from "@/utils/category";
import { dateKeyOf } from "@/utils/time";
import { Plus } from "lucide-react";
import { useMemo } from "react";

export default function PlannerPage() {
  const tasks = useNowFlowStore((s) => s.tasks);
  const dailyReviews = useNowFlowStore((s) => s.dailyReviews);

  const tomorrowKey = useMemo(() => dateKeyOf(new Date(Date.now() + 24 * 60 * 60 * 1000)), []);
  const latestReview = useMemo(() => dailyReviews.find((r) => r.dateKey === dateKeyOf(new Date())) ?? dailyReviews[0] ?? null, [
    dailyReviews,
  ]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold tracking-tight">明日计划</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">固定时间桶 → 任务池 → 碎片桶</div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{tomorrowKey}</div>
          <div className="text-xs text-[var(--muted)]">建议留白 40%</div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl border border-[var(--stroke)] bg-white/3 p-3">
            <div className="text-[var(--muted)]">固定时间桶</div>
            <div className="mt-1 text-sm font-semibold text-[var(--fg)]">0</div>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-white/3 p-3">
            <div className="text-[var(--muted)]">任务池</div>
            <div className="mt-1 text-sm font-semibold text-[var(--fg)]">{tasks.filter((t) => t.status !== "archived").length}</div>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-white/3 p-3">
            <div className="text-[var(--muted)]">碎片桶</div>
            <div className="mt-1 text-sm font-semibold text-[var(--fg)]">0</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">三只青蛙</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">最重要的三件事</div>
          </div>
          <Button size="sm" variant="secondary">
            <Plus className="h-4 w-4" />
            新建任务
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          {latestReview?.frog1 ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm text-[var(--fg)]">{latestReview.frog1}</div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("creation") }} />
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-3 text-sm text-[var(--muted)]">
              先去复盘页填写“明日最小计划”，这里会自动带入
            </div>
          )}
          {latestReview?.frog2 ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm text-[var(--fg)]">{latestReview.frog2}</div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("creation") }} />
            </div>
          ) : null}
          {latestReview?.frog3 ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm text-[var(--fg)]">{latestReview.frog3}</div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar("creation") }} />
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">碎片时间桶（MVP）</div>
        <div className="mt-1 text-xs text-[var(--muted)]">5分钟清单与15分钟清单将在下一步接入任务池</div>
      </Card>
    </div>
  );
}

