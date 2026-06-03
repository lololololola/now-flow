import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { LogIn, UserPlus, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUser = useAuthStore((s) => s.currentUser);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  // 已登录用户自动跳转到首页
  useEffect(() => {
    if (currentUser) {
      navigate("/log", { replace: true });
    }
  }, [currentUser, navigate]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password) {
      setError("请填写用户名和密码");
      return;
    }

    setSubmitting(true);

    if (mode === "login") {
      const user = await login(username.trim(), password);
      if (!user) {
        setError("用户名或密码错误");
      }
      // 登录成功会自动触发 useEffect 跳转
    } else {
      if (password.length < 4) {
        setError("密码至少需要4位");
        setSubmitting(false);
        return;
      }
      const user = await register(username.trim(), password);
      if (!user) {
        setError("用户名已存在或注册失败");
      } else {
        setSuccess("注册成功！正在跳转...");
        // 注册成功会自动触发 useEffect 跳转
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold tracking-tight">NOW Flow</div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            {mode === "login" ? "登录你的账户" : "创建新账户"}
          </div>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-white/15"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "至少4位密码" : "请输入密码"}
                  className="h-11 w-full rounded-xl border border-[var(--stroke)] bg-white/3 px-3 pr-10 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-white/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                "处理中..."
              ) : mode === "login" ? (
                <>
                  <LogIn className="h-4 w-4" />
                  登录
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  注册
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {mode === "login" ? "还没有账户？去注册" : "已有账户？去登录"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
