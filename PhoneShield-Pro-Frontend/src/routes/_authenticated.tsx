import { useEffect, useState } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { ready, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate({ to: "/", replace: true });
  }, [ready, isAuthenticated, navigate]);

  useEffect(() => {
    if (ready && isAuthenticated) void refreshUser();
  }, [ready, isAuthenticated, refreshUser]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
  };

  if (!ready || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border transition-[width] duration-300 lg:block no-print",
          collapsed ? "w-[76px]" : "w-[264px]",
        )}
      >
        <SidebarNav
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onLogout={handleLogout}
        />
      </aside>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]",
        )}
      >
        <Topbar onOpenMenu={() => setDrawerOpen(true)} onLogout={handleLogout} />
        <main className="flex-1 px-4 pt-5 pb-16 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window === "undefined" ? "ssr" : window.location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mx-auto w-full max-w-[1400px] space-y-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
