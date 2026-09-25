import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function Alert({
  variant = "error",
  children,
}: {
  variant?: "error" | "success";
  children: React.ReactNode;
}) {
  const Icon = variant === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        variant === "error"
          ? "border-status-error/30 bg-status-error/10 text-status-error"
          : "border-status-success/30 bg-status-success/10 text-status-success"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span>{children}</span>
    </div>
  );
}
