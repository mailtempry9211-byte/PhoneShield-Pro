import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeftOnRectangleIcon, ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { NAV_GROUPS } from "./nav-config";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";

export function SidebarNav({
  collapsed = false,
  onNavigate,
  onToggleCollapse,
  onLogout,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  onLogout: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-4">
        <Logo showText={!collapsed} size="sm" />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:grid"
          >
            <ChevronDoubleLeftIcon
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                {group.heading}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.to, item.exact);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full gradient-brand"
                        />
                      )}
                      <item.icon
                        className={cn("h-5 w-5 shrink-0", active && "text-sidebar-primary")}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            collapsed && "justify-center px-0",
          )}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}
