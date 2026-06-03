import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  tone?: "neutral" | "basis" | "energy" | "creation";
  size?: "sm" | "md";
};

const toneToVar: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "var(--fg)",
  basis: "var(--basis)",
  energy: "var(--energy)",
  creation: "var(--creation)",
};

export default function Button({ className, variant = "primary", tone = "neutral", size = "md", ...props }: Props) {
  const backgroundColor = variant === "primary" ? toneToVar[tone] : undefined;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm",
        variant === "primary" && "text-[var(--bg)]",
        variant === "primary" && "shadow-[0_14px_40px_-24px_rgba(0,0,0,0.55)]",
        variant === "secondary" && "border border-[var(--stroke)] bg-white/5 text-[var(--fg)] hover:bg-white/8",
        variant === "ghost" && "text-[var(--fg)] hover:bg-white/5",
        className,
      )}
      style={{ backgroundColor, ...props.style }}
      {...props}
    />
  );
}
