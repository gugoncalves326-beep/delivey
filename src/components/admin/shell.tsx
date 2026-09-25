"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminTopbar } from "./topbar";

/**
 * Controla o estado aberto/fechado do drawer mobile. Desktop
 * continua com a sidebar fixa (sem JS extra); mobile mostra a
 * sidebar como drawer sobre um backdrop, fechando ao clicar fora,
 * ao navegar para outra rota, ou ao apertar Esc.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="flex h-screen bg-panel-bg">
      <AdminSidebar className="hidden md:flex" />

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <AdminSidebar
        className="md:hidden"
        mobile
        open={open}
        onNavigate={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar onMenuClick={() => setOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
