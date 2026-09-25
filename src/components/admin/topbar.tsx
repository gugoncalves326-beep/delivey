"use client";

import { Menu } from "lucide-react";

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-panel-border bg-panel-bg px-5">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-text-secondary hover:bg-panel-card md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-panel-card" />
      </div>
    </header>
  );
}
