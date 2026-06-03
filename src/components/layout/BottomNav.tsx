import { cn } from "@/lib/utils";
import { CalendarDays, Flame, Home, LayoutList, Settings, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/log", label: "日志", Icon: Home },
  { to: "/review", label: "复盘", Icon: CalendarDays },
  { to: "/planner", label: "计划", Icon: LayoutList },
  { to: "/focus", label: "专注", Icon: Flame },
  { to: "/emotion", label: "情绪", Icon: Sparkles },
  { to: "/settings", label: "设置", Icon: Settings },
] as const;

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="pointer-events-auto mx-auto w-full max-w-[1100px]">
        <nav className="flex items-center justify-between gap-1 rounded-2xl border border-white/10 bg-[var(--panel)]/90 px-2 py-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.45)] backdrop-blur">
          {items.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs transition",
                  "hover:bg-white/5",
                  isActive ? "bg-white/7 text-[var(--fg)]" : "text-[var(--muted)]",
                )}
              >
                <item.Icon
                  className={cn(
                    "h-[18px] w-[18px] transition",
                    isActive ? "text-[var(--fg)]" : "text-[var(--muted)] group-hover:text-[var(--fg)]",
                  )}
                  strokeWidth={2}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
