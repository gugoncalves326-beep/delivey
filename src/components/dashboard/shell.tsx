"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardTopbar } from "./topbar";

export function DashboardShell({
  children,
  storeName,
  isOpen,
}: {
  children: React.ReactNode;
  storeName?: string;
  isOpen?: boolean;
}) {
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
      <DashboardSidebar className="hidden md:flex" storeName={storeName} isOpen={isOpen} />

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <DashboardSidebar
        className="md:hidden"
        mobile
        open={open}
        onNavigate={() => setOpen(false)}
        onClose={() => setOpen(false)}
        storeName={storeName}
        isOpen={isOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar onMenuClick={() => setOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
