import type { ComponentType, ReactNode } from "react";
import { InboxIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = InboxIcon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-4 font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <ExclamationTriangleIcon className="h-7 w-7" />
      </div>
      <p className="mt-4 font-medium">Couldn't load this data</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}
