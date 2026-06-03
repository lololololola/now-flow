import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useNowFlowStore } from "@/store/nowFlowStore";
import type { MoodType, NowCategory, TimeEntry, TimeEntryOverlay } from "@/types/nowFlow";
import { categoryColorVar, categoryLabel } from "@/utils/category";
import { hm } from "@/utils/time";
import { useEffect, useMemo, useState } from "react";

type Slot = { start: Date; end: Date };

function moodLabel(m: MoodType) {
  if (m === "calm") return "平静";
  if (m === "ok") return "一般";
  if (m === "anxious") return "焦虑";
  if (m === "stressed") return "紧绷";
  return "低落";
}

const moods: MoodType[] = ["calm", "ok", "anxious", "stressed", "low"];

export default function TimeEntrySheet({
  open,
  slot,
  existingEntry,
  onClose,
}: {
  open: boolean;
  slot: Slot | null;
  existingEntry: TimeEntry | null;
  onClose: () => void;
}) {
  const activities = useNowFlowStore((s) => s.activities);
  const createTimeEntry = useNowFlowStore((s) => s.createTimeEntry);
  const updateTimeEntry = useNowFlowStore((s) => s.updateTimeEntry);
  const deleteTimeEntry = useNowFlowStore((s) => s.deleteTimeEntry);

  const isEdit = Boolean(existingEntry);

  const defaultCategory: NowCategory = "basis";
  const [primaryCategory, setPrimaryCategory] = useState<NowCategory>(defaultCategory);
  const [primaryActivityId, setPrimaryActivityId] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<TimeEntryOverlay[]>([]);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<MoodType | null>(null);

  // 当弹窗打开时，根据 existingEntry 回填数据
  useEffect(() => {
    if (open && existingEntry) {
      setPrimaryCategory(existingEntry.primaryCategory);
      setPrimaryActivityId(existingEntry.primaryActivityId);
      setOverlays(existingEntry.overlays.map((o) => ({ ...o })));
      setNote(existingEntry.note);
      setMood(existingEntry.mood);
    } else if (open && !existingEntry) {
      setPrimaryCategory(defaultCategory);
      setPrimaryActivityId(null);
      setOverlays([]);
      setNote("");
      setMood(null);
    }
  }, [open, existingEntry]);

  const filtered = useMemo(
    () => activities.filter((a) => !a.archived && a.category === primaryCategory),
    [activities, primaryCategory],
  );

  const title = isEdit
    ? `编辑记录 ${existingEntry ? hm(new Date(existingEntry.startAt)) + " - " + hm(new Date(existingEntry.endAt)) : ""}`
    : slot
      ? `记录 ${hm(slot.start)} - ${hm(slot.end)}`
      : "记录";

  const canSave = isEdit ? Boolean(existingEntry) : Boolean(slot);

  const handleSave = () => {
    if (isEdit && existingEntry) {
      updateTimeEntry(existingEntry.id, {
        primaryCategory,
        primaryActivityId,
        overlays,
        mood,
        note,
      });
    } else if (slot) {
      const startAt = slot.start.toISOString();
      const endAt = slot.end.toISOString();
      const dateKey = `${slot.start.getFullYear()}-${String(slot.start.getMonth() + 1).padStart(2, "0")}-${String(
        slot.start.getDate(),
      ).padStart(2, "0")}`;

      createTimeEntry({
        dateKey,
        startAt,
        endAt,
        primaryCategory,
        primaryActivityId,
        overlays,
        mood,
        interruptionType: null,
        note,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingEntry) {
      deleteTimeEntry(existingEntry.id);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        onClose();
      }}
    >
      <div className="space-y-4">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            {(["basis", "energy", "creation"] as const).map((c) => {
              const isActive = primaryCategory === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setPrimaryCategory(c);
                    setPrimaryActivityId(null);
                  }}
                  className={cn(
                    "flex-1 rounded-xl px-3 py-2 text-sm transition",
                    isActive ? "text-[var(--fg)]" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]",
                  )}
                  style={isActive ? { backgroundColor: "rgba(255,255,255,0.06)" } : undefined}
                >
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColorVar(c) }} />
                  {categoryLabel(c)}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--muted)]">快速选择</div>
          <div className="grid grid-cols-2 gap-2">
            {filtered.slice(0, 6).map((a) => {
              const active = primaryActivityId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setPrimaryActivityId(a.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-sm transition",
                    active
                      ? "border-white/20 bg-white/8 text-[var(--fg)]"
                      : "border-[var(--stroke)] bg-white/3 text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]",
                  )}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>

        <Card className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">叠加记录</div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                if (overlays.length >= 2) return;
                setOverlays([...overlays, { category: "energy", activityId: null }]);
              }}
              disabled={overlays.length >= 2}
            >
              + 叠加
            </Button>
          </div>
          {overlays.length ? (
            <div className="mt-3 space-y-2">
              {overlays.map((o, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    className="h-10 w-28 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)]"
                    value={o.category}
                    onChange={(e) => {
                      const v = e.target.value as NowCategory;
                      const next = overlays.slice();
                      next[idx] = { category: v, activityId: null };
                      setOverlays(next);
                    }}
                  >
                    <option value="basis">基础</option>
                    <option value="energy">蓄能</option>
                    <option value="creation">创造</option>
                  </select>
                  <select
                    className="h-10 flex-1 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)]"
                    value={o.activityId ?? ""}
                    onChange={(e) => {
                      const next = overlays.slice();
                      next[idx] = { ...o, activityId: e.target.value || null };
                      setOverlays(next);
                    }}
                  >
                    <option value="">选择活动</option>
                    {activities
                      .filter((a) => !a.archived && a.category === o.category)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--fg)]"
                    onClick={() => setOverlays(overlays.filter((_, i) => i !== idx))}
                    aria-label="删除叠加"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-xs text-[var(--muted)]">通勤+英语、吃饭+播客等都可以叠加记录</div>
          )}
        </Card>

        <Card className="p-3">
          <div className="text-sm font-semibold">情绪（可选）</div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {moods.map((m) => {
              const active = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(active ? null : m)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs transition",
                    active
                      ? "border-white/20 bg-white/8 text-[var(--fg)]"
                      : "border-[var(--stroke)] bg-white/3 text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]",
                  )}
                >
                  {moodLabel(m)}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-sm font-semibold">备注（可选）</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            placeholder="干扰源、感受、关键节点…"
          />
        </Card>

        <div className="flex items-center justify-between gap-2">
          {isEdit ? (
            <Button type="button" variant="ghost" tone="creation" onClick={handleDelete}>
              删除
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button
              type="button"
              tone={primaryCategory === "basis" ? "basis" : primaryCategory === "energy" ? "energy" : "creation"}
              disabled={!canSave}
              onClick={handleSave}
            >
              {isEdit ? "保存修改" : "保存"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
