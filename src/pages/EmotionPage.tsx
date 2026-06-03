import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useNowFlowStore, useTodayKey } from "@/store/nowFlowStore";
import type { IfThenRuleScene, MoodType } from "@/types/nowFlow";
import { cn } from "@/lib/utils";
import { HeartPulse, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const feelings: { key: MoodType; label: string }[] = [
  { key: "anxious", label: "焦虑" },
  { key: "stressed", label: "紧绷" },
  { key: "low", label: "低落" },
  { key: "ok", label: "一般" },
  { key: "calm", label: "平静" },
];

const ifPresets = ["拿起手机刷视频", "开始拖延", "想躺平", "情绪上头", "害怕开始"];
const thenPresets = ["去喝一杯水", "站起来走100步", "打开文档并写1句话", "读一页书", "做5分钟就停"];

function sceneLabel(scene: IfThenRuleScene) {
  if (scene === "work") return "工作";
  if (scene === "night") return "夜间";
  if (scene === "commute") return "通勤";
  return "任何";
}

export default function EmotionPage() {
  const todayKey = useTodayKey();
  const ifThenRules = useNowFlowStore((s) => s.ifThenRules);
  const toggleIfThenRule = useNowFlowStore((s) => s.toggleIfThenRule);
  const createIfThenRule = useNowFlowStore((s) => s.createIfThenRule);
  const createSmallWin = useNowFlowStore((s) => s.createSmallWin);
  const smallWins = useNowFlowStore((s) => s.smallWins);

  const todayWins = useMemo(() => smallWins.filter((w) => w.dateKey === todayKey).slice(0, 5), [smallWins, todayKey]);

  const [sosOpen, setSosOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState<MoodType | null>(null);
  const [acceptance, setAcceptance] = useState("现在的状态是OK的，不需要自责。");
  const [ifTrigger, setIfTrigger] = useState("");
  const [thenAction, setThenAction] = useState("");
  const [scene, setScene] = useState<IfThenRuleScene>("any");
  const [saveAsRule, setSaveAsRule] = useState(true);
  const [smallWinText, setSmallWinText] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold tracking-tight">情绪锦囊</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">承认情绪，扶你启动</div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">SOS</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">30–90秒：觉知 → 接纳 → If-Then → 小成功</div>
          </div>
          <Button
            tone="energy"
            onClick={() => {
              setSosOpen(true);
              setStep(1);
              setFeeling(null);
              setAcceptance("现在的状态是OK的，不需要自责。");
              setIfTrigger("");
              setThenAction("");
              setScene("any");
              setSaveAsRule(true);
              setSmallWinText("");
            }}
          >
            <HeartPulse className="h-4 w-4" />
            立即救急
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">If-Then 规则</div>
          <div className="text-xs text-[var(--muted)]">{ifThenRules.length} 条</div>
        </div>
        <div className="mt-3 space-y-2">
          {ifThenRules.length ? (
            ifThenRules.slice(0, 6).map((r) => (
              <button
                key={r.id}
                type="button"
                className={cn(
                  "w-full rounded-2xl border px-3 py-3 text-left transition",
                  r.enabled
                    ? "border-white/15 bg-white/6 hover:bg-white/8"
                    : "border-[var(--stroke)] bg-white/3 opacity-70 hover:opacity-90",
                )}
                onClick={() => toggleIfThenRule(r.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-[var(--muted)]">{sceneLabel(r.scene)}</div>
                  <div className="text-xs text-[var(--muted)]">{r.enabled ? "启用中" : "已暂停"}</div>
                </div>
                <div className="mt-2 text-sm text-[var(--fg)]">
                  如果我 <span className="font-semibold">{r.ifTrigger}</span>，那么我就{" "}
                  <span className="font-semibold">{r.thenAction}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/3 px-3 py-3 text-sm text-[var(--muted)]">
              还没有规则。用一次SOS就能生成第一条。
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">今日小成功</div>
          <div className="text-xs text-[var(--muted)]">{todayWins.length} 条</div>
        </div>
        <div className="mt-3 space-y-2">
          {todayWins.length ? (
            todayWins.map((w) => (
              <div key={w.id} className="rounded-2xl border border-[var(--stroke)] bg-white/3 px-3 py-3 text-sm text-[var(--fg)]">
                <Sparkles className="mr-2 inline-block h-4 w-4 text-[var(--muted)]" />
                {w.text}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/3 px-3 py-3 text-sm text-[var(--muted)]">
              先记录一个很小的完成感，越小越容易开始。
            </div>
          )}
        </div>
      </Card>

      <Modal open={sosOpen} title={`SOS（第${step}/4步）`} onClose={() => setSosOpen(false)}>
        {step === 1 ? (
          <div className="space-y-4">
            <div className="text-sm font-semibold">觉知：我现在是…</div>
            <div className="grid grid-cols-5 gap-2">
              {feelings.map((f) => {
                const active = feeling === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    className={cn(
                      "rounded-xl border px-2 py-2 text-xs transition",
                      active
                        ? "border-white/20 bg-white/8 text-[var(--fg)]"
                        : "border-[var(--stroke)] bg-white/3 text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]",
                    )}
                    onClick={() => setFeeling(f.key)}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button tone="energy" disabled={!feeling} onClick={() => setStep(2)}>
                下一步
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="text-sm font-semibold">接纳：给自己一句话</div>
            <textarea
              value={acceptance}
              onChange={(e) => setAcceptance(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            />
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                上一步
              </Button>
              <Button tone="energy" onClick={() => setStep(3)}>
                下一步
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="text-sm font-semibold">If-Then：把触发编程成替代动作</div>
            <div className="space-y-2">
              <div className="text-xs text-[var(--muted)]">如果我…</div>
              <input
                value={ifTrigger}
                onChange={(e) => setIfTrigger(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
                placeholder="例如：拿起手机刷视频"
              />
              <div className="flex flex-wrap gap-2">
                {ifPresets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="rounded-full border border-[var(--stroke)] bg-white/3 px-3 py-1 text-xs text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--fg)]"
                    onClick={() => setIfTrigger(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-xs text-[var(--muted)]">那么我就…</div>
              <input
                value={thenAction}
                onChange={(e) => setThenAction(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
                placeholder="例如：去喝一杯水"
              />
              <div className="flex flex-wrap gap-2">
                {thenPresets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="rounded-full border border-[var(--stroke)] bg-white/3 px-3 py-1 text-xs text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--fg)]"
                    onClick={() => setThenAction(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <select
                  className="h-11 flex-1 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)]"
                  value={scene}
                  onChange={(e) => setScene(e.target.value as IfThenRuleScene)}
                >
                  <option value="any">任何场景</option>
                  <option value="work">工作</option>
                  <option value="night">夜间</option>
                  <option value="commute">通勤</option>
                </select>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm transition",
                    saveAsRule
                      ? "border-white/20 bg-white/8 text-[var(--fg)]"
                      : "border-[var(--stroke)] bg-white/3 text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]",
                  )}
                  onClick={() => setSaveAsRule((v) => !v)}
                >
                  <Plus className="h-4 w-4" />
                  保存规则
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>
                上一步
              </Button>
              <Button tone="energy" disabled={!ifTrigger.trim() || !thenAction.trim()} onClick={() => setStep(4)}>
                下一步
              </Button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <div className="text-sm font-semibold">小成功：给自己一句夸奖（可选）</div>
            <textarea
              value={smallWinText}
              onChange={(e) => setSmallWinText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
              placeholder="例如：我打开了文档并写下第一句话"
            />
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(3)}>
                上一步
              </Button>
              <Button
                tone="energy"
                onClick={() => {
                  if (saveAsRule && ifTrigger.trim() && thenAction.trim()) {
                    createIfThenRule({ ifTrigger, thenAction, scene });
                  }
                  if (smallWinText.trim()) {
                    createSmallWin({ dateKey: todayKey, text: smallWinText.trim(), mood: feeling });
                  }
                  setSosOpen(false);
                }}
              >
                完成
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

