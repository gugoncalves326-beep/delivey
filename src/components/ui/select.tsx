import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-panel-border bg-panel-bg-secondary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-brand-purple",
        className
      )}
      {...props}
    />
  );
}
