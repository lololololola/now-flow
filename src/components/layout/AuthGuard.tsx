import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function AuthGuard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const loading = useAuthStore((s) => s.loading);
  const init = useAuthStore((s) => s.init);
  const location = useLocation();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-[var(--muted)]">加载中...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
