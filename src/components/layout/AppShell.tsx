import { Outlet } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1100px] flex-col">
        <div className="flex-1 px-4 pb-24 pt-5">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
