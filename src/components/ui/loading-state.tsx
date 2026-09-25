export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-12 text-text-secondary">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-panel-border border-t-brand-purple" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
