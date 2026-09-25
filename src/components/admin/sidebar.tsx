"use client";

import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Wallet,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
  { href: "/admin/pedidos", label: "Pedidos", icon: Package },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

/**
 * Sidebar do ADM_SUPREMO. Renderizada duas vezes pelo AdminShell:
 * uma vez fixa (desktop, `hidden md:flex`) e outra como drawer
 * (mobile, `mobile` + `open` controlam a exibição). O conteúdo é o
 * mesmo nos dois casos — só a posição/transição muda.
 */
export function AdminSidebar({
  className,
  mobile = false,
  open = false,
  onNavigate,
  onClose,
}: {
  className?: string;
  mobile?: boolean;
  open?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-panel-border bg-panel-bg-secondary",
        mobile &&
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
        mobile && (open ? "translate-x-0" : "-translate-x-full"),
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-brand-purple to-brand-purple-secondary" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Plataforma</p>
            <p className="text-xs text-brand-gold">ADM SUPREMO</p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-md p-1.5 text-text-secondary hover:bg-panel-card hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand-purple/15 text-text-primary"
                  : "text-text-secondary hover:bg-panel-card hover:text-text-primary"
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-panel-border px-3 py-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-panel-card hover:text-text-primary">
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </aside>
  );
}
