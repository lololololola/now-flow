import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { useNowFlowStore } from "@/store/nowFlowStore";
import { useAuthStore } from "@/store/authStore";
import { Moon, Sun, LogOut, User } from "lucide-react";

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">{description}</div>
      </div>
      <button
        type="button"
        className="inline-flex h-10 w-[74px] items-center rounded-full border border-[var(--stroke)] bg-white/3 p-1 transition hover:bg-white/5"
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        <span
          className="h-8 w-8 rounded-full bg-white/10 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.8)] transition"
          style={{ transform: value ? "translateX(34px)" : "translateX(0px)" }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const settings = useNowFlowStore((s) => s.settings);
  const setSettings = useNowFlowStore((s) => s.setSettings);
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold tracking-tight">设置</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">让提醒与阈值更适合你</div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
            <User className="h-5 w-5 text-[var(--muted)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{currentUser?.username}</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">当前登录用户</div>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            退出
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">外观</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">浅色/深色</div>
          </div>
          <Button variant="secondary" size="sm" onClick={toggleTheme}>
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {isDark ? "深色" : "浅色"}
          </Button>
        </div>
      </Card>

      <Card className="divide-y divide-white/10 px-4">
        <ToggleRow
          label="疯狂闹钟（整点校准）"
          description="第一周默认开启：每小时问你一次“刚才做了什么？”"
          value={settings.crazyAlarmEnabled}
          onChange={(next) => setSettings({ crazyAlarmEnabled: next })}
        />
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">每日复盘时间</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">默认 22:00</div>
          </div>
          <input
            value={settings.reviewTime}
            onChange={(e) => setSettings({ reviewTime: e.target.value })}
            type="time"
            className="h-10 rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
          />
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">河道阈值（MVP）</div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--stroke)] bg-white/3 p-3">
            <div className="text-xs text-[var(--muted)]">基础（近7天最低小时）</div>
            <input
              value={settings.basisMinHours7d}
              onChange={(e) => setSettings({ basisMinHours7d: Number(e.target.value) })}
              type="number"
              min="0"
              step="1"
              className="mt-2 h-10 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            />
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-white/3 p-3">
            <div className="text-xs text-[var(--muted)]">蓄能（近3天最低分钟）</div>
            <input
              value={settings.energyMinMinutes3d}
              onChange={(e) => setSettings({ energyMinMinutes3d: Number(e.target.value) })}
              type="number"
              min="0"
              step="5"
              className="mt-2 h-10 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none focus:ring-2 focus:ring-white/15"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

