import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-panel-border px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-text-secondary" strokeWidth={1.5} />
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="max-w-xs text-sm text-text-secondary">{description}</p>
    </div>
  );
}
