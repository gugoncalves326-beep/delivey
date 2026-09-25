import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "success" | "error" | "warning" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-status-success/10 text-status-success border-status-success/30",
  error: "bg-status-error/10 text-status-error border-status-error/30",
  warning: "bg-status-warning/10 text-status-warning border-status-warning/30",
  neutral: "bg-panel-bg-secondary text-text-secondary border-panel-border",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
