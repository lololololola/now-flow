import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--stroke)] bg-[var(--card)] shadow-[0_20px_70px_-55px_rgba(0,0,0,0.65)]",
        className,
      )}
      {...props}
    />
  );
}
