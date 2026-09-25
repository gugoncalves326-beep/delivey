"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  name,
  disabled,
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-brand-purple" : "bg-panel-border"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
      {name && <input type="hidden" name={name} value={checked ? "on" : ""} />}
    </button>
  );
}
