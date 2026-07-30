import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  index = 0,
}: {
  label: string;
  value: ReactNode;
  icon: ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "default" | "success" | "warning" | "info" | "destructive";
  index?: number;
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning",
    info: "bg-info/12 text-info",
    destructive: "bg-destructive/12 text-destructive",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="card-elevated relative overflow-hidden p-5 transition-shadow hover:shadow-raised"
    >
      <div className="pointer-events-none absolute -top-16 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("card-elevated overflow-hidden", className)}>
      {(title || actions) && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
