import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { categoryColorVar } from "@/utils/category";
import { addMinutes, hm } from "@/utils/time";
import { Clipboard, Pause, Play, RotateCcw, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Stage = "idle" | "focus" | "break" | "done";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function mmss(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

export default function FocusPage() {
  const [taskTitle, setTaskTitle] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<"50_10" | "5_min">("50_10");
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(10 * 60);
  const [interruptionCount, setInterruptionCount] = useState(0);

  const focusTotal = mode === "50_10" ? 50 * 60 : 5 * 60;
  const breakTotal = 10 * 60;

  useEffect(() => {
    if (stage === "idle" || stage === "done") return;
    if (paused) return;
    const timer = window.setInterval(() => {
      if (stage === "focus") {
        setSecondsLeft((v) => v - 1);
      } else {
        setBreakSecondsLeft((v) => v - 1);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage, paused]);

  useEffect(() => {
    if (stage !== "focus") return;
    if (secondsLeft > 0) return;
    setStage("break");
    setPaused(false);
    setBreakSecondsLeft(breakTotal);
  }, [secondsLeft, stage, breakTotal]);

  useEffect(() => {
    if (stage !== "break") return;
    if (breakSecondsLeft > 0) return;
    setStage("done");
    setPaused(false);
  }, [breakSecondsLeft, stage]);

  const shieldText = useMemo(() => {
    const end = addMinutes(new Date(), mode === "50_10" ? 50 : 5);
    return `我正在处理${taskTitle || "一个任务"}，预计${hm(end)}结束，届时回复。`;
  }, [taskTitle, mode]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold tracking-tight">专注</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">50/10 或 只做5分钟</div>
      </div>

      <Card className="p-4">
        <div className="text-sm font-semibold">任务</div>
        <input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
          placeholder="例如：写方案 / 写报告 / 读10页…"
          disabled={stage !== "idle" && stage !== "done"}
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "flex-1 rounded-xl border px-3 py-2 text-sm transition",
              mode === "50_10"
                ? "border-white/20 bg-white/8 text-[var(--fg)]"
                : "border-[var(--stroke)] bg-white/3 text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]",
            )}
            onClick={() => setMode("50_10")}
            disabled={stage !== "idle" && stage !== "done"}
          >
            50/10
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 rounded-xl border px-3 py-2 text-sm transition",
              mode === "5_min"
                ? "border-white/20 bg-white/8 text-[var(--fg)]"
                : "border-[var(--stroke)] bg-white/3 text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]",
            )}
            onClick={() => setMode("5_min")}
            disabled={stage !== "idle" && stage !== "done"}
          >
            只做5分钟
          </button>
        </div>

        <div className="mt-3 rounded-2xl border border-[var(--stroke)] bg-white/3 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-[var(--muted)]">防打扰护盾</div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 py-2 text-xs text-[var(--fg)] transition hover:bg-white/5"
              onClick={() => navigator.clipboard.writeText(shieldText)}
            >
              <Clipboard className="h-3.5 w-3.5" />
              复制
            </button>
          </div>
          <div className="mt-2 flex items-start gap-2 text-sm">
            <Shield className="mt-0.5 h-4 w-4 text-[var(--muted)]" />
            <div className="text-[var(--fg)]">{shieldText}</div>
          </div>
        </div>
      </Card>

      <Card className={cn("relative overflow-hidden p-4", stage === "break" && "border-white/20")}>
        {stage === "break" ? (
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(1200px 600px at 20% 20%, rgba(34,197,94,0.55), transparent 55%), radial-gradient(1000px 500px at 90% 80%, rgba(34,197,94,0.35), transparent 60%), rgba(10,16,12,0.2)",
            }}
          />
        ) : null}
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">{stage === "break" ? "休息" : "专注计时"}</div>
            <div className="text-xs text-[var(--muted)]">打断 {interruptionCount}</div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-[52px] font-semibold tracking-tight">
              {stage === "break" ? mmss(Math.max(0, breakSecondsLeft)) : mmss(Math.max(0, secondsLeft))}
            </div>
            <div className="mt-1 text-xs text-[var(--muted)]">
              {stage === "break" ? "屏幕变绿：喝水 / 拉伸 / 眺望" : mode === "50_10" ? "专注50分钟 + 休息10分钟" : "只做5分钟，先启动"}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {stage === "idle" || stage === "done" ? (
              <Button
                tone="creation"
                onClick={() => {
                  setStage("focus");
                  setPaused(false);
                  setInterruptionCount(0);
                  setSecondsLeft(focusTotal);
                  setBreakSecondsLeft(breakTotal);
                }}
              >
                <Play className="h-4 w-4" />
                开始
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPaused((v) => !v);
                  }}
                >
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {paused ? "继续" : "暂停"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setInterruptionCount((v) => v + 1);
                    setPaused(true);
                  }}
                >
                  记录干扰
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStage("idle");
                    setPaused(false);
                    setSecondsLeft(focusTotal);
                    setBreakSecondsLeft(breakTotal);
                  }}
                >
                  结束
                </Button>
              </>
            )}

            {stage === "done" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setStage("idle");
                  setPaused(false);
                  setSecondsLeft(focusTotal);
                  setBreakSecondsLeft(breakTotal);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                再来一段
              </Button>
            ) : null}
          </div>

          {stage === "break" ? (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: "喝水", color: categoryColorVar("basis") },
                { label: "拉伸", color: categoryColorVar("energy") },
                { label: "眺望", color: categoryColorVar("basis") },
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="rounded-xl border border-white/15 bg-white/8 px-3 py-3 text-sm text-white/90 transition hover:bg-white/12"
                  onClick={() => {}}
                >
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                  {a.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

