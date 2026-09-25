import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-panel-border bg-panel-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-colors focus:border-brand-purple",
        className
      )}
      {...props}
    />
  );
}
