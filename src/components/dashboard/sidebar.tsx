"use client";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: Package },
  { href: "/dashboard/produtos", label: "Produtos", icon: ShoppingBag },
  { href: "/dashboard/categorias", label: "Categorias", icon: FolderTree },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

// Nome/status virão de store_settings + companies numa etapa futura.
// Renderizada duas vezes pelo DashboardShell (fixa no desktop, drawer
// no mobile) — ver AdminSidebar para o mesmo padrão comentado.
export function DashboardSidebar({
  className,
  storeName = "Minha Loja",
  isOpen = true,
  mobile = false,
  open = false,
  onNavigate,
  onClose,
}: {
  className?: string;
  storeName?: string;
  isOpen?: boolean;
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
          <div className="h-8 w-8 rounded-md bg-panel-card" />
          <div>
            <p className="text-sm font-semibold text-text-primary">{storeName}</p>
            <p className={cn("text-xs", isOpen ? "text-status-success" : "text-status-error")}>
              {isOpen ? "Aberta" : "Fechada"}
            </p>
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
