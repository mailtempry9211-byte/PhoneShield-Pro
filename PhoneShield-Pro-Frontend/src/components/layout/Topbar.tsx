import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bars3Icon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { breadcrumbsFor } from "./nav-config";
import { initials, titleCase } from "@/utils/format";

export function Topbar({ onOpenMenu, onLogout }: { onOpenMenu: () => void; onLogout: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = breadcrumbsFor(pathname);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border glass no-print">
      <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm">
              <li className="shrink-0">
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
                  <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {crumb.last ? (
                    <span className="truncate font-medium">{titleCase(crumb.label)}</span>
                  ) : (
                    <Link
                      to={crumb.href}
                      className="truncate text-muted-foreground hover:text-foreground"
                    >
                      {titleCase(crumb.label)}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Notifications"
                className="relative grid h-9 w-9 place-items-center rounded-xl border border-border transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <BellIcon className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                You're all caught up.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-border px-1.5 py-1 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="gradient-brand text-[11px] font-semibold text-primary-foreground">
                    {initials(user?.name || user?.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:block">
                  {user?.name || user?.email || "Account"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              <DropdownMenuLabel className="truncate">
                {user?.email || "Signed in"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserCircleIcon className="mr-2 h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Cog6ToothIcon className="mr-2 h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
